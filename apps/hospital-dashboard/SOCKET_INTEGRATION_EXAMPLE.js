// Hospital Dashboard Socket Service
// Place at: apps/hospital-dashboard/src/services/socketService.js

import { io } from 'socket.io-client';

class HospitalSocketService {
  constructor() {
    this.socket = null;
    this.ambulanceLocationCallbacks = [];
    this.emergencyStatusCallbacks = [];
  }

  connect(hospitalId, token) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return Promise.resolve(true);
    }

    console.log('🔌 Connecting hospital socket...');

    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
    });

    return new Promise((resolve) => {
      this.socket.on('connect', () => {
        console.log('✅ Hospital socket connected');
        
        // Join hospital room
        this.socket.emit('hospital:join', { hospitalId });
        console.log(`🏥 Joined hospital room: ${hospitalId}`);
        
        resolve(true);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        resolve(false);
      });

      // Listen for ambulance location updates
      this.socket.on('ambulance:locationUpdate', (data) => {
        console.log('🚑 Ambulance location update:', data);
        this.ambulanceLocationCallbacks.forEach(cb => cb(data));
      });

      // Listen for emergency status updates
      this.socket.on('emergency:statusUpdate', (data) => {
        console.log('📋 Emergency status update:', data);
        this.emergencyStatusCallbacks.forEach(cb => cb(data));
      });
    });
  }

  onAmbulanceLocation(callback) {
    this.ambulanceLocationCallbacks.push(callback);
  }

  onEmergencyStatus(callback) {
    this.emergencyStatusCallbacks.push(callback);
  }

  disconnect(hospitalId) {
    if (this.socket) {
      this.socket.emit('hospital:leave', { hospitalId });
      this.socket.disconnect();
      this.socket = null;
      this.ambulanceLocationCallbacks = [];
      this.emergencyStatusCallbacks = [];
    }
  }
}

export default new HospitalSocketService();
