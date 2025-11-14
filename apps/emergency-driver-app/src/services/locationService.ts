import * as Location from 'expo-location';

export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

class LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;
  private trackingCallback: ((location: LocationData) => void) | null = null;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<LocationPermissionStatus> {
    try {
      console.log('📍 Requesting location permissions...');

      const { status } = await Location.requestForegroundPermissionsAsync();

      const granted = status === 'granted';

      if (granted) {
        console.log('✅ Location permissions granted');
      } else {
        console.warn('⚠️ Location permissions denied');
      }

      return {
        granted,
        canAskAgain: status !== 'denied',
      };
    } catch (error) {
      console.error('❌ Location permission error:', error);
      return {
        granted: false,
        canAskAgain: false,
      };
    }
  }

  /**
   * Check if location permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('❌ Check permissions error:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.checkPermissions();

      if (!hasPermission) {
        console.warn('⚠️ No location permission');
        return null;
      }

      console.log('📍 Getting current location...');

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const locationData: LocationData = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      console.log('✅ Location acquired:', locationData);
      return locationData;
    } catch (error) {
      console.error('❌ Get location error:', error);
      return null;
    }
  }

  /**
   * Start tracking location with callback
   */
  async startTracking(
    callback: (location: LocationData) => void,
    interval: number = 5000 // 5 seconds default
  ): Promise<boolean> {
    try {
      const hasPermission = await this.checkPermissions();

      if (!hasPermission) {
        const permissionResult = await this.requestPermissions();
        if (!permissionResult.granted) {
          console.error('❌ Cannot start tracking without permission');
          return false;
        }
      }

      // Stop existing tracking if any
      await this.stopTracking();

      console.log('🚀 Starting location tracking...');

      this.trackingCallback = callback;

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: interval,
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            timestamp: location.timestamp,
          };

          console.log('📍 Location update:', locationData);

          if (this.trackingCallback) {
            this.trackingCallback(locationData);
          }
        }
      );

      console.log('✅ Location tracking started');
      return true;
    } catch (error) {
      console.error('❌ Start tracking error:', error);
      return false;
    }
  }

  /**
   * Stop tracking location
   */
  async stopTracking(): Promise<void> {
    try {
      if (this.watchSubscription) {
        console.log('🛑 Stopping location tracking...');
        this.watchSubscription.remove();
        this.watchSubscription = null;
        this.trackingCallback = null;
        console.log('✅ Location tracking stopped');
      }
    } catch (error) {
      console.error('❌ Stop tracking error:', error);
    }
  }

  /**
   * Check if currently tracking
   */
  isTracking(): boolean {
    return this.watchSubscription !== null;
  }

  /**
   * Get distance between two coordinates (in meters)
   */
  calculateDistance(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (from.lat * Math.PI) / 180;
    const φ2 = (to.lat * Math.PI) / 180;
    const Δφ = ((to.lat - from.lat) * Math.PI) / 180;
    const Δλ = ((to.lng - from.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Calculate ETA (in minutes)
   */
  calculateETA(distanceMeters: number, speedKmh: number = 60): number {
    const distanceKm = distanceMeters / 1000;
    const timeHours = distanceKm / speedKmh;
    return Math.ceil(timeHours * 60); // Convert to minutes
  }
}

export const locationService = new LocationService();
export default locationService;
