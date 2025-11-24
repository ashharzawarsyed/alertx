import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config/config';

interface AmbulanceLocationUpdate {
  emergencyId: string;
  location: {
    lat: number;
    lng: number;
  };
  speed: number;
  heading: number;
  timestamp: Date;
}

interface EmergencyStatusUpdate {
  emergencyId: string;
  status: string;
  timestamp: Date;
}

class SocketService {
  private socket: Socket | null = null;
  private ambulanceLocationCallback: ((data: AmbulanceLocationUpdate) => void) | null = null;
  private emergencyStatusCallback: ((data: EmergencyStatusUpdate) => void) | null = null;

  /**
   * Connect to Socket.IO server
   */
  async connect(): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        console.log('✅ Socket already connected');
        return true;
      }

      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        console.error('❌ No auth token for socket connection');
        return false;
      }

      console.log('🔌 Connecting user to Socket.IO...');

      this.socket = io(Config.SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.setupListeners();

      return new Promise((resolve) => {
        this.socket?.on('connect', () => {
          console.log('✅ User socket connected:', this.socket?.id);
          resolve(true);
        });

        this.socket?.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error.message);
          resolve(false);
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
      console.log('🔌 User socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    // Ambulance location updates
    this.socket.on('ambulance:locationUpdate', (data: AmbulanceLocationUpdate) => {
      console.log('🚑 Ambulance location update:', data);
      if (this.ambulanceLocationCallback) {
        this.ambulanceLocationCallback(data);
      }
    });

    // Emergency status updates
    this.socket.on('emergency:statusUpdate', (data: EmergencyStatusUpdate) => {
      console.log('📋 Emergency status update:', data);
      if (this.emergencyStatusCallback) {
        this.emergencyStatusCallback(data);
      }
    });

    // Emergency completed
    this.socket.on('emergency:completed', (data: { emergencyId: string }) => {
      console.log('✅ Emergency completed:', data);
    });
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Join emergency room to receive updates
   */
  joinEmergencyRoom(emergencyId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Cannot join emergency room: socket not connected');
      return;
    }

    console.log('🚪 Joining emergency room:', emergencyId);
    this.socket.emit('emergency:join', { emergencyId });
  }

  /**
   * Leave emergency room
   */
  leaveEmergencyRoom(emergencyId: string) {
    if (!this.socket?.connected) {
      return;
    }

    console.log('🚪 Leaving emergency room:', emergencyId);
    this.socket.emit('emergency:leave', { emergencyId });
  }

  /**
   * Set callback for ambulance location updates
   */
  onAmbulanceLocationUpdate(callback: (data: AmbulanceLocationUpdate) => void) {
    this.ambulanceLocationCallback = callback;
  }

  /**
   * Remove ambulance location callback
   */
  offAmbulanceLocationUpdate() {
    this.ambulanceLocationCallback = null;
  }

  /**
   * Set callback for emergency status updates
   */
  onEmergencyStatusUpdate(callback: (data: EmergencyStatusUpdate) => void) {
    this.emergencyStatusCallback = callback;
  }

  /**
   * Remove emergency status callback
   */
  offEmergencyStatusUpdate() {
    this.emergencyStatusCallback = null;
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting user socket...');
      this.socket.disconnect();
      this.socket = null;
      this.ambulanceLocationCallback = null;
      this.emergencyStatusCallback = null;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
