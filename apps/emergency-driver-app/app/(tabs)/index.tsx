import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuthStore } from '@/src/store/authStore';
import { useEmergencyStore } from '@/src/store/emergencyStore';
import emergencyService, { Emergency } from '@/src/services/emergencyService';
import socketService from '@/src/services/socketService';
import locationService from '@/src/services/locationService';
import authService from '@/src/services/authService';
import CrossPlatformMap from '@/components/CrossPlatformMap';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateDriverStatus } = useAuthStore();
  const {
    incomingEmergencies,
    setIncomingEmergencies,
    addIncomingEmergency,
    removeIncomingEmergency,
    setActiveEmergency,
  } = useEmergencyStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(
    user?.driverInfo?.status === 'available'
  );
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadEmergencies();
    setupSocketListeners();
    requestLocationPermission();
    fetchDriverLocation();

    // Start basic location tracking (updates map only, no socket emission)
    const locationInterval = startBasicLocationTracking();
    locationIntervalRef.current = locationInterval;

    return () => {
      socketService.offNewEmergency();
      socketService.offEmergencyCancelled();
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  const fetchDriverLocation = async () => {
    try {
      console.log('📍 Requesting location permissions...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('⚠️ Location permissions denied, using default Islamabad location');
        setLocationError('Location permission denied');
        // Use default Islamabad location
        setDriverLocation({
          lat: 33.6844,
          lng: 73.0479,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setDriverLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      console.log('📍 Driver location fetched:', location.coords);
    } catch (error) {
      console.error('Failed to fetch driver location:', error);
      setLocationError('Failed to get location');
      // Fallback to default Islamabad location on error
      setDriverLocation({
        lat: 33.6844,
        lng: 73.0479,
      });
    }
  };

  const startBasicLocationTracking = () => {
    console.log('🎯 Starting basic location tracking (map updates only)...');
    
    const interval = setInterval(async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Update local state for map display
        setDriverLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });

        // Note: Location is NOT emitted to socket here
        // Only emit when there's an active emergency (see active-emergency.tsx)
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    }, 10000); // Update every 10 seconds (less frequent since no socket emission)

    return interval;
  };

  const requestLocationPermission = async () => {
    const result = await locationService.requestPermissions();
    if (!result.granted) {
      Alert.alert(
        'Location Required',
        'Please enable location services to receive emergencies'
      );
    }
  };

  const loadEmergencies = async () => {
    try {
      setIsLoading(true);
      const result = await emergencyService.getDriverEmergencies(1, 20);

      if (result.success && result.data) {
        const pending = result.data.emergencies.filter(
          (e) => e.status === 'pending'
        );
        setIncomingEmergencies(pending);
      }
    } catch (error) {
      console.error('Load emergencies error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewEmergency((data) => {
      console.log('🚨 New emergency received:', data.emergency);
      addIncomingEmergency(data.emergency);

      Alert.alert(
        '🚨 New Emergency',
        `${data.emergency.severityLevel.toUpperCase()} - ${data.emergency.symptoms.join(', ')}`,
        [{ text: 'View', onPress: () => {} }]
      );
    });

    // Listen for patient cancellations
    socketService.onEmergencyCancelled((data) => {
      console.log('❌ Emergency cancelled by patient:', data);
      removeIncomingEmergency(data.emergencyId);
      
      Alert.alert(
        'Emergency Cancelled',
        data.message || 'The patient has cancelled this emergency request.',
        [{ text: 'OK' }]
      );
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEmergencies();
    setIsRefreshing(false);
  };

  const handleAcceptEmergency = async (emergency: Emergency) => {
    try {
      Alert.alert(
        'Accept Emergency',
        `Accept this ${emergency.severityLevel} emergency?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Accept',
            style: 'default',
            onPress: async () => {
              const result = await emergencyService.acceptEmergency(emergency._id);

              if (result.success && result.data) {
                setActiveEmergency(result.data.emergency);
                removeIncomingEmergency(emergency._id);
                socketService.notifyEmergencyAccepted(emergency._id);

                // Navigate to active emergency screen
                // Note: Continuous location emission to socket starts in active-emergency.tsx
                router.push('/active-emergency');
              } else {
                Alert.alert('Error', result.message || 'Failed to accept emergency');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept emergency');
    }
  };

  const handleRejectEmergency = async (emergency: Emergency) => {
    try {
      Alert.alert(
        'Decline Emergency',
        'Are you sure you want to decline this emergency? It will be forwarded to another driver.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: async () => {
              const result = await emergencyService.rejectEmergency(
                emergency._id,
                'Driver unavailable'
              );

              if (result.success) {
                removeIncomingEmergency(emergency._id);
                Alert.alert(
                  'Emergency Declined',
                  result.message || 'Emergency forwarded to another driver'
                );
              } else {
                Alert.alert('Error', result.message || 'Failed to decline emergency');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to decline emergency');
    }
  };

  const toggleAvailability = async (value: boolean) => {
    try {
      const newStatus = value ? 'available' : 'offline';
      
      // Update status in backend database (persists across restarts)
      const response = await authService.updateDriverStatus(newStatus);
      
      // Update local state
      setIsAvailable(value);
      updateDriverStatus(newStatus);
      
      // Update socket status
      socketService.updateStatus(newStatus);

      // Update store with the user data from backend
      if (response?.data?.user) {
        updateDriverStatus(response.data.user.driverInfo.status);
      }

      if (value) {
        // Start tracking location when available
        const location = await locationService.getCurrentLocation();
        if (location) {
          socketService.updateLocation(location);
        }
        
        Alert.alert(
          '✅ Now Available',
          'You are now available for emergencies. You will receive notifications when there are new emergency requests.'
        );
      } else {
        Alert.alert(
          '🚫 Now Offline',
          'You are now offline and will not receive emergency requests'
        );
      }
    } catch (error: any) {
      console.error('❌ Status update error:', error);
      
      // Revert UI state on error
      setIsAvailable(!value);
      
      Alert.alert(
        '❌ Update Failed',
        error.response?.data?.message || 'Failed to update status. Please check your connection and try again.'
      );
    }
  };

  const renderEmergencyCard = ({ item }: { item: Emergency }) => (
    <TouchableOpacity
      style={[
        styles.emergencyCard,
        item.severityLevel === 'critical' && styles.criticalCard,
        item.severityLevel === 'high' && styles.highCard,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.severityBadge}>
          <Text style={styles.severityText}>
            {item.severityLevel.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.scoreText}>Score: {item.triageScore}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.patientName}>{item.patient.name}</Text>
        <Text style={styles.symptoms}>
          {item.symptoms.join(' • ')}
        </Text>
        {item.location.address && (
          <Text style={styles.address} numberOfLines={2}>
            📍 {item.location.address}
          </Text>
        )}
      </View>

      {item.aiPrediction && (
        <View style={styles.aiSection}>
          <Text style={styles.aiTitle}>🤖 AI Analysis</Text>
          <Text style={styles.aiText}>
            {item.aiPrediction.emergencyType} ({item.aiPrediction.confidence}% confidence)
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptEmergency(item)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleRejectEmergency(item)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#dc2626" />
        <Text style={styles.loadingText}>Loading emergencies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Emergency Requests</Text>
          <Text style={styles.headerSubtitle}>
            {user?.name} • {user?.driverInfo?.ambulanceNumber}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>
            {isAvailable ? 'Available' : 'Offline'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#d1d5db', true: '#10b981' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Driver Location Map */}
      <View style={styles.mapContainer}>
        <View style={styles.mapHeader}>
          <Text style={styles.mapTitle}>📍 {driverLocation ? 'Your Location' : 'Default Location (Islamabad)'}</Text>
          {incomingEmergencies.length > 0 && (
            <Text style={styles.emergencyCount}>
              {incomingEmergencies.length} active request{incomingEmergencies.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.mapWrapper}>
          <CrossPlatformMap
            initialRegion={{
              latitude: driverLocation?.lat || 33.6844,
              longitude: driverLocation?.lng || 73.0479,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            markers={[
              {
                latitude: driverLocation?.lat || 33.6844,
                longitude: driverLocation?.lng || 73.0479,
                title: driverLocation ? "Your Location" : "Default Location",
                description: driverLocation ? "Driver position" : "Islamabad, Pakistan",
                color: "#10b981"
              },
              ...incomingEmergencies.map((emergency, index) => ({
                latitude: emergency.location.lat,
                longitude: emergency.location.lng,
                title: `Emergency ${index + 1}`,
                description: emergency.severityLevel,
                color: emergency.severityLevel === 'critical' ? '#ef4444' : '#f59e0b'
              }))
            ]}
          />
        </View>
      </View>

      {/* Emergency List */}
      {incomingEmergencies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🚑</Text>
          <Text style={styles.emptyTitle}>No Active Requests</Text>
          <Text style={styles.emptyText}>
            {isAvailable
              ? 'You will be notified when a new emergency is dispatched'
              : 'Toggle availability to start receiving emergencies'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={incomingEmergencies}
          renderItem={renderEmergencyCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#dc2626"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  criticalCard: {
    borderColor: '#dc2626',
  },
  highCard: {
    borderColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  cardBody: {
    marginBottom: 12,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  symptoms: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
  },
  address: {
    fontSize: 13,
    color: '#6b7280',
  },
  aiSection: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  aiText: {
    fontSize: 13,
    color: '#075985',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  emergencyCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
});
