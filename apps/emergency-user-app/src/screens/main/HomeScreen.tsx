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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { emergencyService, Emergency } from "../../services/emergencyService";
import { EmergencySymptomModal } from "../../components/EmergencySymptomModal";
import { FirstAidGuide } from "../../components/FirstAidGuide";
import { ambulanceDispatcher, DispatchedAmbulance } from "../../services/ambulanceDispatcher";
import { TriageResult } from "../../services/symptomAnalyzer";

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
  
  // NLP Integration States
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [showFirstAidGuide, setShowFirstAidGuide] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [dispatchedAmbulance, setDispatchedAmbulance] = useState<DispatchedAmbulance | null>(null);

  const pan = useRef(new Animated.Value(0)).current;

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
            useNativeDriver: Platform.OS !== 'web',
          }).start(() => {
            // Show symptom modal for AI analysis
            setShowSymptomModal(true);
            pan.setValue(0);
          });
        } else {
          // Slide not completed - return to start
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: Platform.OS !== 'web',
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

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (user) {
      fetchActiveEmergency();
      // Get emergency contacts from user profile - fallback to empty array if not available
      const contacts = (user?.medicalProfile as any)?.emergencyContacts || [];
      setEmergencyContacts(contacts.slice(0, 4)); // Show max 4 contacts
    }
  }, [fetchActiveEmergency, user]);

  // Handle symptom analysis completion
  const handleAnalysisComplete = async (analysis: TriageResult) => {
    console.log('🔬 Analysis received:', analysis);
    setTriageResult(analysis);
    setShowSymptomModal(false);

    try {
      // Mock user location (in production, get from GPS)
      const userLocation = {
        lat: 37.7749, // San Francisco coordinates
        lng: -122.4194,
      };

      // Dispatch ambulance based on AI analysis
      console.log('🚑 Dispatching ambulance...');
      const ambulance = await ambulanceDispatcher.dispatchAmbulance(
        analysis,
        userLocation
      );

      setDispatchedAmbulance(ambulance);

      // Trigger emergency in backend
      const response = await emergencyService.triggerEmergencyButton(
        `AI-analyzed emergency: ${analysis.emergencyType} (${analysis.severity} severity)`
      );

      if (response.success && response.data) {
        setActiveEmergency(response.data.emergency);
        
        // Show first aid guide
        setShowFirstAidGuide(true);
        
        Alert.alert(
          "🚨 Emergency Dispatched",
          `${ambulance.type} ambulance dispatched!\n\nETA: ${ambulance.eta} minutes\nVehicle: ${ambulance.vehicleNumber}\n\nSeverity: ${analysis.severity}\nConfidence: ${Math.round(analysis.confidence)}%`,
          [
            {
              text: "View First Aid",
              onPress: () => setShowFirstAidGuide(true),
            },
            {
              text: "Track Ambulance",
              onPress: () =>
                router.push({
                  pathname: "/emergency/tracking" as any,
                  params: { emergencyId: response.data!.emergency._id },
                }),
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Dispatch failed:', error);
      Alert.alert('Error', 'Failed to dispatch ambulance. Please try again.');
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
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.push("/settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User Greeting & Emergency Contacts */}
      <View style={styles.userSection}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>
            Hi, {user?.name?.split(" ")[0] || "George"}!
          </Text>
          <TouchableOpacity
            style={styles.userAvatar}
            onPress={() => router.push("/(tabs)/profile")}
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

      {/* Main Content Area - Non-Scrollable */}
      <View style={styles.mainContent}>
        {/* Active Emergency Alert */}
        {activeEmergency && (
          <TouchableOpacity
            style={styles.activeEmergencyBanner}
            onPress={() =>
              router.push({
                pathname: "/emergency/tracking" as any,
                params: { emergencyId: activeEmergency._id },
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.activeEmergencyContent}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
              <View style={styles.activeEmergencyText}>
                <Text style={styles.activeEmergencyTitle}>
                  Active Emergency
                </Text>
                <Text style={styles.activeEmergencySubtitle}>
                  Status: {activeEmergency.status.replace("_", " ")} • Tap to track
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#DC2626" />
            </View>
          </TouchableOpacity>
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
            onPress={() => router.push("/(tabs)/emergencies")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="time-outline" size={24} color="#111827" />
            </View>
            <Text style={styles.actionLabel}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/profile")}
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
    fontSize: 14,
    color: "#991B1B",
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
});
