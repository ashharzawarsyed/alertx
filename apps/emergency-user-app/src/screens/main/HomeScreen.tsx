import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useAuthStore } from "../../store/authStore";
import { emergencyService, Emergency } from "../../services/emergencyService";
import { EmergencySymptomModal } from "../../components/EmergencySymptomModal";
import { FirstAidGuide } from "../../components/FirstAidGuide";
import { ambulanceDispatcher, DispatchedAmbulance } from "../../services/ambulanceDispatcher";
import { TriageResult } from "../../services/symptomAnalyzer";
import io from 'socket.io-client';
import Config from '../../config/config';
import CrossPlatformMap from "../../components/CrossPlatformMap";
import exploreService from "../../services/exploreService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDER_WIDTH = SCREEN_WIDTH - 48; // 24px padding on each side
const HANDLE_SIZE = 48;
const MAX_TRANSLATE = SLIDER_WIDTH - HANDLE_SIZE - 16; // 16px for padding

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeEmergency, setActiveEmergency] = useState<Emergency | null>(
    null
  );
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const lastCreatedEmergencyId = useRef<string | null>(null);
  const isDispatching = useRef<boolean>(false); // Prevent duplicate dispatch calls
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  
  // NLP Integration States
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [dispatchedAmbulance, setDispatchedAmbulance] = useState<DispatchedAmbulance | null>(null);

  const pan = useRef(new Animated.Value(0)).current;
  const socketRef = useRef<any>(null);

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (!user) return;

    // Get token from authStore
    const token = useAuthStore.getState().token;
    if (!token) return;

    // Connect to socket
    const baseURL = Config.API_URL.replace('/api/v1', '');
    socketRef.current = io(baseURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 Socket connected for emergency updates');
    });

    // Listen for emergency cancellation
    socketRef.current.on('emergency:cancelled', (data: { emergencyId: string; reason: string }) => {
      console.log('❌ Emergency cancelled:', data);
      if (activeEmergency?._id === data.emergencyId) {
        // Reset slider immediately
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
          tension: 100,
          friction: 10,
        }).start();

        // Clear active emergency
        setActiveEmergency(null);

        Alert.alert(
          'Emergency Cancelled',
          data.reason || 'Your emergency has been cancelled. You can now request a new emergency.',
          [{ text: 'OK' }]
        );
      }
    });

    // Listen for emergency being forwarded to another driver
    socketRef.current.on('emergency:forwarded', (data: { 
      emergencyId: string;
      previousDriver: string;
      newDriver: string;
      reason: string;
      message: string;
    }) => {
      console.log('🔄 Emergency forwarded:', data);
      
      if (activeEmergency?._id === data.emergencyId) {
        Alert.alert(
          '🔄 Emergency Forwarded',
          `Previous driver (${data.previousDriver}) was unavailable.\n\n` +
          `Your emergency has been forwarded to: ${data.newDriver}\n\n` +
          `Reason: ${data.reason}`,
          [{ text: 'OK' }]
        );
      }
    });

    // Listen for emergency status updates
    socketRef.current.on('emergency:updated', (data: { emergency: Emergency }) => {
      console.log('🔄 Emergency updated:', data);
      if (activeEmergency?._id === data.emergency._id) {
        setActiveEmergency(data.emergency);
      }
    });

    // Listen for driver acceptance
    socketRef.current.on('emergency:accepted', (data: { 
      emergencyId: string; 
      driver: any; 
      hospital: any; 
      status: 'accepted';
    }) => {
      console.log('✅ Driver accepted emergency:', data);
      
      if (activeEmergency?._id === data.emergencyId) {
        // Update active emergency with driver info
        setActiveEmergency(prev => prev ? {
          ...prev,
          status: 'accepted' as const,
          assignedDriver: data.driver.id,
        } : null);

        // Show notification to patient
        Alert.alert(
          '✅ Driver Accepted!',
          `${data.driver.name} has accepted your emergency.\n\n` +
          `📞 Phone: ${data.driver.phone}\n` +
          `🚑 Vehicle: ${data.driver.ambulanceNumber}\n` +
          `🏥 Hospital: ${data.hospital.name}`,
          [
            {
              text: 'Track Ambulance',
              onPress: () => router.push({
                pathname: '/emergency/tracking' as any,
                params: { emergencyId: data.emergencyId },
              }),
            },
            { text: 'OK' }
          ]
        );
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🔌 Socket disconnected');
      }
    };
  }, [user, activeEmergency?._id]);

  // Create PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !activeEmergency,
      onMoveShouldSetPanResponder: () => !activeEmergency,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx >= 0 && gestureState.dx <= MAX_TRANSLATE) {
          pan.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > MAX_TRANSLATE * 0.8) {
          // Slide completed - show symptom modal
          Animated.spring(pan, {
            toValue: MAX_TRANSLATE,
            useNativeDriver: Platform.OS !== "web",
          }).start(() => {
            // Show symptom modal for AI analysis
            setShowSymptomModal(true);
            pan.setValue(0);
          });
        } else {
          // Slide not completed - return to start
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: Platform.OS !== "web",
          }).start();
        }
      },
    })
  ).current;

  // Fetch active emergency
  const fetchActiveEmergency = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!user) {
      return;
    }

    try {
      const response = await emergencyService.getEmergencies(1, 10);
      if (response.success && response.data) {
        const active = response.data.emergencies.find((e) =>
          ["pending", "accepted", "in_progress"].includes(e.status)
        );
        setActiveEmergency(active || null);
      }
    } catch {
      // Silent - auth errors are expected when not logged in
    }
  }, [user]);

  // Fetch user location and nearby hospitals
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied");
          console.log("⚠️ Location permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const userLoc = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        
        setUserLocation(userLoc);
        console.log("📍 User location fetched:", location.coords);

        // Fetch nearby hospitals
        try {
          const hospitalResponse = await exploreService.getNearbyHospitals(
            userLoc.lat,
            userLoc.lng,
            10 // 10km radius
          );
          if (hospitalResponse.success && hospitalResponse.data) {
            // Handle both array and object responses
            // Backend returns data.hospitals (nested structure)
            const hospitalsArray = (hospitalResponse.data as any).hospitals || [];
            
            if (hospitalsArray.length > 0) {
              setNearbyHospitals(hospitalsArray.slice(0, 5)); // Show max 5 hospitals
              console.log(`🏥 Found ${hospitalsArray.length} nearby hospitals`);
            } else {
              // Fallback to Islamabad hospitals if no nearby hospitals found
              console.log('⚠️ No nearby hospitals, fetching Islamabad defaults...');
              const islamabadResponse = await exploreService.getNearbyHospitals(
                33.6844, // Islamabad F-7 center
                73.0479,
                50 // 50km radius to cover Islamabad
              );
              if (islamabadResponse.success && islamabadResponse.data) {
                const islamabadHospitals = (islamabadResponse.data as any).hospitals || [];
                setNearbyHospitals(islamabadHospitals.slice(0, 5));
                console.log(`🏥 Showing ${islamabadHospitals.length} Islamabad hospitals as default`);
              }
            }
          }
        } catch (error) {
          console.error("❌ Error fetching hospitals:", error);
        }
      } catch (error) {
        console.error("❌ Error getting location:", error);
        setLocationError("Failed to get location");
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchActiveEmergency();
      // Get emergency contacts from user profile - fallback to empty array if not available
      const contacts = (user?.medicalProfile as any)?.emergencyContacts || [];
      setEmergencyContacts(contacts.slice(0, 4)); // Show max 4 contacts
    }
  }, [fetchActiveEmergency, user]);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchActiveEmergency();
    setRefreshing(false);
  }, [fetchActiveEmergency]);

  // Handle symptom analysis completion
  const handleAnalysisComplete = async (analysis: TriageResult) => {
    // Prevent duplicate calls
    if (isDispatching.current) {
      console.log('⚠️ Already dispatching, ignoring duplicate call');
      return;
    }

    console.log('🔬 Analysis received:', analysis);
    setTriageResult(analysis);
    setShowSymptomModal(false);

    // Set dispatching flag
    isDispatching.current = true;

    try {
      // Check for active emergency BEFORE attempting dispatch
      console.log('🔍 Checking for active emergencies...');
      const checkResponse = await emergencyService.getEmergencies(1, 50);
      if (checkResponse.success && checkResponse.data) {
        const activeEmergencies = checkResponse.data.emergencies.filter(
          (e: Emergency) => ['pending', 'accepted', 'in_progress'].includes(e.status)
        );
        
        if (activeEmergencies.length > 0) {
          const activeEmerg = activeEmergencies[0];
          setActiveEmergency(activeEmerg);
          console.log('⚠️ Found active emergency:', activeEmerg._id);
          
          Alert.alert(
            "Active Emergency Detected",
            `You already have an emergency in progress (Status: ${activeEmerg.status}).\n\nPlease wait for the current emergency to be resolved before creating a new one.`,
            [
              {
                text: "Track Current Emergency",
                onPress: () => {
                  router.push({
                    pathname: "/emergency/tracking" as any,
                    params: { emergencyId: activeEmerg._id },
                  });
                },
              },
              { text: "OK", style: "cancel" },
            ]
          );
          isDispatching.current = false; // Reset flag
          return;
        }
      }

      // Use actual user location or fallback
      const location = userLocation || {
        lat: 33.6522224, // Fallback: Islamabad coordinates
        lng: 73.0366452,
      };

      if (!userLocation) {
        console.log("⚠️ Using fallback location - GPS not available");
      }

      // Get actual symptoms from analysis
      const actualSymptoms = analysis.detectedSymptoms?.map((s: any) => s.keyword) || [];
      const symptomsText = actualSymptoms.length > 0 
        ? actualSymptoms.join(', ')
        : `${analysis.emergencyType} emergency`;

      // Dispatch ambulance via backend (this handles everything)
      console.log('🚑 Dispatching intelligent ambulance...');
      const response = await emergencyService.dispatchIntelligentAmbulance(
        analysis,
        location,
        { symptoms: symptomsText, description: `AI-analyzed: ${analysis.emergencyType} (${analysis.severity} severity)` }
      );

      if (!response.success) {
        // Handle "already have active emergency" error
        if (response.message?.includes('already have an active emergency')) {
          Alert.alert(
            "Active Emergency Detected",
            "You already have an emergency in progress. Please wait for the current emergency to be resolved before creating a new one.",
            [
              {
                text: "Track Current Emergency",
                onPress: async () => {
                  const active = await emergencyService.getActiveEmergency();
                  if (active?.data?.emergency) {
                    setActiveEmergency(active.data.emergency);
                    router.push({
                      pathname: "/emergency/tracking" as any,
                      params: { emergencyId: active.data.emergency._id },
                    });
                  }
                },
              },
              { text: "OK", style: "cancel" },
            ]
          );
          isDispatching.current = false; // Reset flag
          return;
        }

        // Handle insufficient permissions (wrong account type)
        if (response.message?.includes('Insufficient permissions') || response.message?.includes('Authentication required')) {
          Alert.alert(
            "Wrong Account Type",
            "You are using a driver's account to login to the patient app. Please sign out and login with a patient account, or create a new patient account.",
            [
              {
                text: "Sign Out",
                onPress: () => {
                  useAuthStore.getState().signOut();
                  router.replace('/auth/signin');
                },
                style: "destructive"
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
          isDispatching.current = false; // Reset flag
          return;
        }
        
        // Other errors
        Alert.alert('Error', response.message || 'Failed to dispatch ambulance. Please try again.');
        isDispatching.current = false; // Reset flag
        return;
      }

      if (response.success && response.data) {
        setActiveEmergency(response.data.emergency);
        // Track this emergency ID to prevent duplicate notifications
        lastCreatedEmergencyId.current = response.data.emergency._id;
        
        // Show first aid guide
        setShowFirstAidGuide(true);
        
        // Build alert message - driver will be assigned when they accept
        const driverInfo = response.data.ambulance?.driver;
        const hospitalInfo = response.data.emergency.assignedHospital;
        let alertMessage = `Emergency request sent successfully!\n`;
        
        if (driverInfo) {
          alertMessage += `\n📡 Notifying nearby driver: ${driverInfo.name}`;
          alertMessage += `\n⏳ Waiting for driver to accept...`;
        } else {
          alertMessage += `\n🔍 Searching for available drivers...`;
          alertMessage += `\n⏳ Please wait for driver acceptance`;
        }
        
        if (hospitalInfo) {
          alertMessage += `\n\n🏥 Nearest Hospital: ${hospitalInfo.name}`;
          alertMessage += `\n📍 Address: ${hospitalInfo.address}`;
        }
        
        alertMessage += `\n\n🚨 Severity: ${analysis.severity}`;
        alertMessage += `\n✅ Confidence: ${Math.round(analysis.confidence)}%`;
        alertMessage += `\n\nYou will be notified when a driver accepts your emergency.`;

        Alert.alert(
          "🚨 Emergency Request Sent",
          alertMessage,
          [
            {
              text: "View First Aid",
              onPress: () => setShowFirstAidGuide(true),
            },
            {
              text: "OK",
            },
          ]
        );
        
        // Reset dispatching flag on success
        isDispatching.current = false;
      }
    } catch (error) {
      console.error('❌ Dispatch failed:', error);
      Alert.alert('Error', 'Failed to dispatch ambulance. Please try again.');
      isDispatching.current = false; // Reset flag on error
    }
  };

  const triggerEmergency = async () => {
    // Double check for active emergency before proceeding
    if (activeEmergency) {
      Alert.alert(
        "Active Emergency",
        "You already have an active emergency. Tap the banner to track it.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const response = await emergencyService.triggerEmergencyButton(
        "Emergency activated via slider"
      );

      if (response.success && response.data) {
        // Update active emergency state immediately
        setActiveEmergency(response.data.emergency);

        Alert.alert(
          "✅ Emergency Activated",
          `Help is on the way!\n\nEmergency ID: ${response.data.emergency._id?.slice(-6)}`,
          [
            {
              text: "Track Emergency",
              onPress: () =>
                router.push({
                  pathname: "/emergency/tracking" as any,
                  params: { emergencyId: response.data!.emergency._id },
                }),
            },
          ]
        );

        // Refresh emergency list
        fetchActiveEmergency();
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to activate emergency."
        );
      }
    } catch (error: any) {
      console.error("Emergency trigger error:", error);
      Alert.alert("Error", error.message || "Failed to activate emergency");
    }
  };

  const handleRequestEmergency = () => {
    Alert.alert(
      "Request Ambulance",
      "This feature will allow you to request an ambulance with specific symptoms.",
      [{ text: "OK" }]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Section: App Name & Icons */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>AlertX</Text>
        <View style={styles.topIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/notifications" as any)}
          >
            <Ionicons name="notifications-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/settings" as any)}
          >
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EF4444"
            colors={["#EF4444"]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* User Greeting & Emergency Contacts */}
        <View style={styles.userSection}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              Hi, {user?.name?.split(" ")[0] || "George"}!
            </Text>
            <TouchableOpacity
              style={styles.userAvatar}
              onPress={() => router.push("/profile")}
            >
              <Text style={styles.avatarText}>
                {getInitials(user?.name || "User")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactsRow}>
            <Text style={styles.contactsLabel}>
              Your SOS will be sent to {emergencyContacts.length || 4} people
            </Text>
            <View style={styles.contactAvatars}>
              {emergencyContacts.length > 0 ? (
                emergencyContacts.map((contact, index) => (
                  <View
                    key={index}
                    style={[
                      styles.contactAvatar,
                      { backgroundColor: getContactColor(index) },
                    ]}
                  >
                    <Text style={styles.contactInitials}>
                      {getInitials(contact.name)}
                    </Text>
                  </View>
                ))
              ) : (
                <>
                  <View
                    style={[styles.contactAvatar, { backgroundColor: "#EF4444" }]}
                  >
                    <Text style={styles.contactInitials}>KE</Text>
                  </View>
                  <View
                    style={[styles.contactAvatar, { backgroundColor: "#3B82F6" }]}
                  >
                    <Text style={styles.contactInitials}>AM</Text>
                  </View>
                  <View
                    style={[styles.contactAvatar, { backgroundColor: "#F97316" }]}
                  >
                    <Text style={styles.contactInitials}>RJ</Text>
                  </View>
                  <View
                    style={[styles.contactAvatar, { backgroundColor: "#8B5CF6" }]}
                  >
                    <Text style={styles.contactInitials}>JA</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
        {/* Active Emergency Alert */}
        {activeEmergency && (
          <View style={[
            styles.activeEmergencyBanner,
            activeEmergency.status === 'cancelled' && styles.cancelledEmergencyBanner
          ]}>
            <TouchableOpacity
              style={styles.activeEmergencyContent}
              onPress={() => {
                if (activeEmergency.status === 'cancelled') {
                  setActiveEmergency(null);
                } else {
                  router.push({
                    pathname: "/emergency/tracking" as any,
                    params: { emergencyId: activeEmergency._id },
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={activeEmergency.status === 'cancelled' ? 'close-circle' : 'alert-circle'} 
                size={24} 
                color={activeEmergency.status === 'cancelled' ? '#6B7280' : '#DC2626'} 
              />
              <View style={styles.activeEmergencyText}>
                <Text style={[
                  styles.activeEmergencyTitle,
                  activeEmergency.status === 'cancelled' && styles.cancelledText
                ]}>
                  {activeEmergency.status === 'cancelled' ? 'Emergency Cancelled' : 'Active Emergency'}
                </Text>
                <Text style={[
                  styles.activeEmergencySubtitle,
                  activeEmergency.status === 'cancelled' && styles.cancelledText
                ]}>
                  Status: {activeEmergency.status.replace("_", " ")} • {activeEmergency.status === 'cancelled' ? 'Tap to dismiss' : 'Tap to track'}
                  </Text>
                <Text style={styles.activeEmergencySubtitle}>
                  Status: {activeEmergency.status.replace("_", " ")} • Tap to
                  track
                </Text>
              </View>
              <Ionicons 
                name={activeEmergency.status === 'cancelled' ? 'close' : 'chevron-forward'} 
                size={24} 
                color={activeEmergency.status === 'cancelled' ? '#6B7280' : '#DC2626'} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions - Minimalist Design */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRequestEmergency}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="call-outline" size={24} color="#111827" />
            </View>
            <Text style={styles.actionLabel}>Call Ambulance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/emergencies")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="time-outline" size={24} color="#111827" />
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/profile")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#111827"
              />
            </View>
            <Text style={styles.actionLabel}>Medical</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Alert.alert(
                "Emergency Contacts",
                "Manage your emergency contacts here."
              )
            }
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="people-outline" size={24} color="#111827" />
            </View>
            <Text style={styles.actionLabel}>Contacts</Text>
          </TouchableOpacity>
        </View>

        {/* Location Map Preview */}
        <View style={styles.mapPreview}>
          <View style={styles.mapHeader}>
            <Ionicons name="location" size={20} color="#EF4444" />
            <Text style={styles.mapTitle}>{userLocation ? 'Your Location' : 'Default Location (Islamabad)'}</Text>
            {nearbyHospitals.length > 0 && (
              <Text style={styles.hospitalCount}>
                {nearbyHospitals.length} hospital{nearbyHospitals.length !== 1 ? 's' : ''} nearby
              </Text>
            )}
          </View>
          <View style={styles.mapWrapper}>
            <CrossPlatformMap
              initialRegion={{
                latitude: userLocation?.lat || 33.6844,
                longitude: userLocation?.lng || 73.0479,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              markers={[
                {
                  latitude: userLocation?.lat || 33.6844,
                  longitude: userLocation?.lng || 73.0479,
                  title: userLocation ? "You are here" : "Default Location",
                  description: userLocation ? "Your current location" : "Islamabad, Pakistan",
                  color: "#EF4444"
                },
                ...nearbyHospitals.map((hospital, index) => ({
                  latitude: hospital.location.lat,
                  longitude: hospital.location.lng,
                  title: hospital.name,
                  description: `${hospital.distance?.toFixed(1) || 'N/A'} km away`,
                  color: "#3B82F6"
                }))
              ]}
            />
          </View>
          {nearbyHospitals.length > 0 && (
            <View style={styles.mapLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
                <Text style={styles.legendText}>Your Location</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
                <Text style={styles.legendText}>Hospitals</Text>
              </View>
            </View>
          )}
        </View>

        {/* Info Card - Fills empty space */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#EF4444" />
              <Text style={styles.infoTitle}>Emergency Ready</Text>
            </View>
            <Text style={styles.infoText}>
              Your profile is complete and emergency services can be contacted
              instantly. Swipe below for immediate help.
            </Text>
          </View>

          {activeEmergency && (
            <View style={styles.statusCard}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                Response time: ~{Math.floor(Math.random() * 5) + 3} minutes
              </Text>
            </View>
          )}
        </View>
      </View>
      </ScrollView>

      {/* Bottom Slider */}
      <View style={styles.sliderContainer}>
        <View
          style={[styles.sliderTrack, activeEmergency && styles.sliderDisabled]}
        >
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.sliderHandle,
              {
                transform: [{ translateX: pan }],
              },
            ]}
          >
            <Ionicons name="arrow-forward" size={28} color="#000000" />
          </Animated.View>
          <Text style={styles.sliderText}>
            {activeEmergency ? "Emergency Active" : "Swipe for Emergency"}
          </Text>
        </View>
      </View>

      {/* NLP Integration Modals */}
      <EmergencySymptomModal
        visible={showSymptomModal}
        onClose={() => setShowSymptomModal(false)}
        onAnalysisComplete={handleAnalysisComplete}
        userLocation={{ lat: 37.7749, lng: -122.4194 }}
      />

      {triageResult && (
        <FirstAidGuide
          visible={showFirstAidGuide}
          onClose={() => setShowFirstAidGuide(false)}
          emergencyType={triageResult.emergencyType}
          severity={triageResult.severity}
          ambulanceETA={dispatchedAmbulance?.eta}
        />
      )}
    </SafeAreaView>
  );
}

const getContactColor = (index: number): string => {
  const colors = ["#EF4444", "#3B82F6", "#F97316", "#8B5CF6", "#10B981"];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.5,
  },
  topIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  userSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  greetingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  contactsRow: {
    marginTop: 8,
  },
  contactsLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  contactAvatars: {
    flexDirection: "row",
    gap: -8,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactInitials: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  activeEmergencyBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  activeEmergencyContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeEmergencyText: {
    marginLeft: 12,
    flex: 1,
  },
  activeEmergencyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 2,
  },
  activeEmergencySubtitle: {
    fontSize: 12,
    color: "#991B1B",
  },
  cancelledEmergencyBanner: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  cancelledText: {
    color: '#6B7280',
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  sliderContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  sliderTrack: {
    height: 64,
    backgroundColor: "#000000",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    position: "relative",
    overflow: "hidden",
  },
  sliderHandle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderText: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  sliderDisabled: {
    opacity: 0.5,
    backgroundColor: "#6B7280",
  },
  infoSection: {
    marginTop: 24,
    gap: 12,
  },
  infoCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#DC2626",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669",
  },
  mapPreview: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  hospitalCount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mapLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
