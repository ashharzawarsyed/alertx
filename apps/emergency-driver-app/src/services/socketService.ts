import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';
import { LocationData } from './locationService';
import { Emergency } from './emergencyService';

export interface SocketConfig {
  url: string;
  token: string;
}

export interface EmergencyNotification {
  emergency: Emergency;
  message: string;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private emergencyCallback: ((data: EmergencyNotification) => void) | null = null;
  private emergencyCancelledCallback: ((data: { emergencyId: string; reason: string; message: string }) => void) | null = null;

  /**
   * Connect to Socket.IO server
   */
  async connect(): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        console.log('✅ Socket already connected');
        return true;
      }

      const token = await AsyncStorage.getItem('driver-auth-token');

      if (!token) {
        console.error('❌ No auth token for socket connection');
        return false;
      }

      console.log('🔌 Connecting to Socket.IO...');

      this.socket = io(Config.SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupListeners();

      return new Promise((resolve) => {
        this.socket?.on('connect', () => {
          console.log('✅ Socket connected:', this.socket?.id);
          this.reconnectAttempts = 0;
          resolve(true);
        });

        this.socket?.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          this.reconnectAttempts++;

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.error('❌ Socket connect error:', error);
      return false;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Socket connected');
      this.onDriverConnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.onDriverConnect();
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Emergency notification
    this.socket.on('emergency:newRequest', (data: EmergencyNotification) => {
      console.log('🚨 New emergency notification:', data);

      if (this.emergencyCallback) {
        this.emergencyCallback(data);
      }
    });

    // Emergency cancelled by patient
    this.socket.on('emergency:cancelledByPatient', (data: { 
      emergencyId: string; 
      reason: string;
      message: string;
    }) => {
      console.log('❌ Emergency cancelled by patient:', data);
      
      if (this.emergencyCancelledCallback) {
        this.emergencyCancelledCallback(data);
      }
    });

    // Emergency cancelled (general)
    this.socket.on('emergency:cancelled', (data: { emergencyId: string; reason: string }) => {
      console.log('❌ Emergency cancelled:', data);
    });

    // Emergency updated
    this.socket.on('emergency:updated', (data: { emergency: Emergency }) => {
      console.log('🔄 Emergency updated:', data);
    });
  }

  /**
   * Notify server that driver is connected
   */
  private async onDriverConnect() {
    try {
      if (!this.socket?.connected) return;

      console.log('👋 Notifying server of driver connection');

      this.socket.emit('driver:connected', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Driver connect notify error:', error);
    }
  }

  /**
   * Listen for emergency cancellations by patient
   */
  onEmergencyCancelled(callback: (data: { emergencyId: string; reason: string; message: string }) => void) {
    this.emergencyCancelledCallback = callback;
  }

  /**
   * Remove emergency cancelled listener
   */
  offEmergencyCancelled() {
    this.emergencyCancelledCallback = null;
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.emergencyCallback = null;
      this.emergencyCancelledCallback = null;
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Update driver location
   */
  updateLocation(location: LocationData) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot update location: socket not connected');
      return;
    }

    this.socket.emit('driver:updateLocation', {
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update driver status
   */
  updateStatus(status: 'available' | 'busy' | 'offline') {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot update status: socket not connected');
      return;
    }

    console.log('🔄 Updating driver status:', status);

    this.socket.emit('driver:updateStatus', {
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify emergency accepted
   */
  notifyEmergencyAccepted(emergencyId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot notify acceptance: socket not connected');
      return;
    }

    console.log('✅ Notifying emergency accepted:', emergencyId);

    this.socket.emit('driver:emergencyAccepted', {
      emergencyId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify patient picked up
   */
  notifyPickup(emergencyId: string, location: LocationData) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot notify pickup: socket not connected');
      return;
    }

    console.log('🚑 Notifying patient pickup:', emergencyId);

    this.socket.emit('driver:patientPickedUp', {
      emergencyId,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify hospital arrival
   */
  notifyHospitalArrival(emergencyId: string, hospitalId: string, location: LocationData) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot notify hospital arrival: socket not connected');
      return;
    }

    console.log('🏥 Notifying hospital arrival:', emergencyId);

    this.socket.emit('driver:hospitalArrival', {
      emergencyId,
      hospitalId,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify trip completed
   */
  notifyTripCompleted(emergencyId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot notify completion: socket not connected');
      return;
    }

    console.log('✅ Notifying trip completed:', emergencyId);

    this.socket.emit('driver:tripCompleted', {
      emergencyId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Set callback for new emergency notifications
   */
  onNewEmergency(callback: (data: EmergencyNotification) => void) {
    this.emergencyCallback = callback;
  }

  /**
   * Remove emergency notification callback
   */
  offNewEmergency() {
    this.emergencyCallback = null;
  }
}

export const socketService = new SocketService();
export default socketService;
