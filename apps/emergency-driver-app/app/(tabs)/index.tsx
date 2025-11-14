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
import { useAuthStore } from '@/src/store/authStore';
import { useEmergencyStore } from '@/src/store/emergencyStore';
import emergencyService, { Emergency } from '@/src/services/emergencyService';
import socketService from '@/src/services/socketService';
import locationService from '@/src/services/locationService';

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

  useEffect(() => {
    loadEmergencies();
    setupSocketListeners();
    requestLocationPermission();

    return () => {
      socketService.offNewEmergency();
    };
  }, []);

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

  const toggleAvailability = async (value: boolean) => {
    try {
      const newStatus = value ? 'available' : 'offline';
      setIsAvailable(value);
      updateDriverStatus(newStatus);
      socketService.updateStatus(newStatus);

      if (value) {
        // Start tracking location when available
        const location = await locationService.getCurrentLocation();
        if (location) {
          socketService.updateLocation(location);
        }
      }
    } catch (error) {
      console.error('Status update error:', error);
      setIsAvailable(!value);
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

      <TouchableOpacity
        style={styles.acceptButton}
        onPress={() => handleAcceptEmergency(item)}
      >
        <Text style={styles.acceptButtonText}>Accept Emergency</Text>
      </TouchableOpacity>
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
  acceptButton: {
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
});
