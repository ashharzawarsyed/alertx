import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEmergencyStore } from '@/src/store/emergencyStore';
import emergencyService from '@/src/services/emergencyService';
import locationService, { LocationData } from '@/src/services/locationService';
import socketService from '@/src/services/socketService';
import CrossPlatformMap from '@/components/CrossPlatformMap';
import { generatePolylineCode, PolylineSegment } from '@/src/components/maps/MapPolyline';

const { width } = Dimensions.get('window');

type TripStatus = 'en_route' | 'arrived' | 'transporting' | 'completed';

export default function ActiveEmergencyScreen() {
  const router = useRouter();
  const { activeEmergency, clearActiveEmergency, addToHistory } = useEmergencyStore();

  const [tripStatus, setTripStatus] = useState<TripStatus>('en_route');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setETA] = useState<number>(0);

  useEffect(() => {
    if (!activeEmergency) {
      router.replace('/(tabs)');
      return;
    }

    // Start continuous location tracking with socket emission
    // This runs ONLY when there's an active emergency
    startLocationTracking();

    return () => {
      // Stop location tracking and socket emission when:
      // 1. Trip is completed
      // 2. Emergency is cancelled
      // 3. Component unmounts
      console.log('🛑 Stopping location tracking - emergency ended');
      locationService.stopTracking();
    };
  }, [activeEmergency]);

  const startLocationTracking = async () => {
    const success = await locationService.startTracking(
      (location) => {
        setCurrentLocation(location);
        
        // Update socket with location
        socketService.updateLocation(location);

        // Calculate distance and ETA
        if (activeEmergency) {
          const dist = locationService.calculateDistance(
            location,
            activeEmergency.location
          );
          setDistance(dist);
          setETA(locationService.calculateETA(dist));
        }
      },
      5000 // Update every 5 seconds
    );

    if (!success) {
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const handlePatientPickedUp = async () => {
    if (!activeEmergency || !currentLocation) return;

    try {
      const result = await emergencyService.markPickedUp(activeEmergency._id);

      if (result.success) {
        setTripStatus('transporting');
        socketService.notifyPickup(activeEmergency._id, currentLocation);
        Alert.alert('Success', 'Patient picked up. En route to hospital.');
      } else {
        Alert.alert('Error', result.message || 'Failed to update status');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark pickup');
    }
  };

  const handleHospitalArrival = async () => {
    if (!activeEmergency || !activeEmergency.assignedHospital || !currentLocation) return;

    try {
      const result = await emergencyService.markArrivedAtHospital(activeEmergency._id);

      if (result.success) {
        setTripStatus('completed');
        socketService.notifyHospitalArrival(
          activeEmergency._id,
          activeEmergency.assignedHospital._id,
          currentLocation
        );
        
        Alert.alert(
          'Hospital Arrival',
          'Patient delivered. Complete the trip?',
          [
            { text: 'Not Yet', style: 'cancel' },
            { text: 'Complete', onPress: handleCompleteTrip },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to update status');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to mark arrival');
    }
  };

  const handleCompleteTrip = async () => {
    if (!activeEmergency) return;

    try {
      const result = await emergencyService.completeEmergency(activeEmergency._id);

      if (result.success) {
        socketService.notifyTripCompleted(activeEmergency._id);
        addToHistory(activeEmergency);
        clearActiveEmergency();
        
        // Location tracking stops automatically via useEffect cleanup
        // when component unmounts on navigation back to home
        Alert.alert('Trip Completed', 'Great job! Ready for next emergency.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to complete trip');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete trip');
    }
  };

  if (!activeEmergency) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Emergency</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, styles[`${tripStatus}Banner`]]}>
          <Text style={styles.statusText}>
            {tripStatus === 'en_route' && '🚑 En Route to Patient'}
            {tripStatus === 'arrived' && '📍 Arrived at Location'}
            {tripStatus === 'transporting' && '🏥 Transporting to Hospital'}
            {tripStatus === 'completed' && '✅ Trip Completed'}
          </Text>
        </View>

        {/* Map with Route */}
        <View style={styles.mapCard}>
          <Text style={styles.cardTitle}>📍 Live Navigation</Text>
          <View style={styles.mapContainer}>
            <CrossPlatformMap
              initialRegion={{
                latitude: currentLocation?.lat || activeEmergency.location.lat,
                longitude: currentLocation?.lng || activeEmergency.location.lng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              markers={[
                {
                  latitude: activeEmergency.location.lat,
                  longitude: activeEmergency.location.lng,
                  title: 'Patient Location',
                  description: activeEmergency.patient.name,
                  color: '#dc2626',
                },
                ...(currentLocation ? [{
                  latitude: currentLocation.lat,
                  longitude: currentLocation.lng,
                  title: 'Your Location',
                  description: '🚑 Ambulance',
                  color: '#10b981',
                }] : []),
                ...(activeEmergency.assignedHospital ? [{
                  latitude: (activeEmergency.assignedHospital as any).location?.lat || 33.7077,
                  longitude: (activeEmergency.assignedHospital as any).location?.lng || 73.0533,
                  title: activeEmergency.assignedHospital.name,
                  description: '🏥 Hospital',
                  color: '#3b82f6',
                }] : []),
              ]}
              polylineCode={useMemo(() => {
                if (!currentLocation) return '';
                
                const segments: PolylineSegment[] = [];
                
                // Route to patient (green solid line)
                if (tripStatus === 'en_route' || tripStatus === 'arrived') {
                  segments.push({
                    coordinates: [
                      { lat: currentLocation.lat, lng: currentLocation.lng },
                      { lat: activeEmergency.location.lat, lng: activeEmergency.location.lng },
                    ],
                    color: '#10b981',
                    weight: 4,
                    opacity: 0.8,
                  });
                }
                
                // Route to hospital (blue dashed line)
                if (activeEmergency.assignedHospital && (tripStatus === 'transporting' || tripStatus === 'completed')) {
                  const hospitalLat = (activeEmergency.assignedHospital as any).location?.lat || 33.7077;
                  const hospitalLng = (activeEmergency.assignedHospital as any).location?.lng || 73.0533;
                  
                  segments.push({
                    coordinates: [
                      { lat: currentLocation.lat, lng: currentLocation.lng },
                      { lat: hospitalLat, lng: hospitalLng },
                    ],
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '10, 5',
                  });
                }
                
                return generatePolylineCode(segments);
              }, [currentLocation, tripStatus, activeEmergency])}
            />
          </View>
          <View style={styles.mapStats}>
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={20} color="#10b981" />
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{locationService.formatDistance(distance)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="#f59e0b" />
              <Text style={styles.statLabel}>ETA</Text>
              <Text style={styles.statValue}>{eta} min</Text>
            </View>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Patient Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{activeEmergency.patient.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{activeEmergency.patient.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Severity:</Text>
            <Text style={[styles.value, styles.severityText]}>
              {activeEmergency.severityLevel.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Symptoms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Symptoms</Text>
          {activeEmergency.symptoms.map((symptom, index) => (
            <View key={index} style={styles.symptomRow}>
              <Text style={styles.symptomBullet}>•</Text>
              <Text style={styles.symptomText}>{symptom}</Text>
            </View>
          ))}
        </View>

        {/* AI Analysis */}
        {activeEmergency.aiPrediction && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🤖 AI Analysis</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>
                {activeEmergency.aiPrediction.emergencyType}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Confidence:</Text>
              <Text style={styles.value}>
                {activeEmergency.aiPrediction.confidence}%
              </Text>
            </View>
          </View>
        )}

        {/* Location & ETA */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Navigation</Text>
          {activeEmergency.location.address && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{activeEmergency.location.address}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Distance:</Text>
            <Text style={styles.value}>
              {locationService.formatDistance(distance)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ETA:</Text>
            <Text style={styles.value}>{eta} min</Text>
          </View>
        </View>

        {/* Hospital Info */}
        {activeEmergency.assignedHospital && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Assigned Hospital</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {activeEmergency.assignedHospital.name}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>
                {activeEmergency.assignedHospital.address}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {tripStatus === 'en_route' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setTripStatus('arrived')}
          >
            <Text style={styles.buttonText}>Arrived at Location</Text>
          </TouchableOpacity>
        )}

        {tripStatus === 'arrived' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePatientPickedUp}
          >
            <Text style={styles.buttonText}>Patient Picked Up</Text>
          </TouchableOpacity>
        )}

        {tripStatus === 'transporting' && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleHospitalArrival}
          >
            <Text style={styles.buttonText}>Arrived at Hospital</Text>
          </TouchableOpacity>
        )}

        {tripStatus === 'completed' && (
          <TouchableOpacity
            style={styles.successButton}
            onPress={handleCompleteTrip}
          >
            <Text style={styles.buttonText}>Complete Trip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#b91c1c',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  en_routeBanner: {
    backgroundColor: '#dbeafe',
  },
  arrivedBanner: {
    backgroundColor: '#fef3c7',
  },
  transportingBanner: {
    backgroundColor: '#dcfce7',
  },
  completedBanner: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mapStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    width: 100,
  },
  value: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  severityText: {
    color: '#dc2626',
    fontWeight: '700',
  },
  symptomRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  symptomBullet: {
    fontSize: 16,
    color: '#dc2626',
    marginRight: 8,
  },
  symptomText: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  actionButtons: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  primaryButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
