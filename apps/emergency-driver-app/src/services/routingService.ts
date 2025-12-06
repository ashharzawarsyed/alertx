import Constants from 'expo-constants';
import axios from 'axios';

const GOOGLE_MAPS_API_KEY = 
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 
  Constants.expoConfig?.extra?.googleMapsApiKey || 
  '';

export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  traveled: RouteCoordinate[]; // Already traveled path (blue, dashed)
  remaining: RouteCoordinate[]; // Remaining path (green, solid)
}

class RoutingService {
  private routeCache: Map<string, RouteCoordinate[]> = new Map();
  private currentRoute: RouteCoordinate[] = [];
  private currentIndex: number = 0;

  /**
   * Fetch route from Google Directions API
   */
  async fetchRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<RouteCoordinate[]> {
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}`;
    
    // Check cache first
    if (this.routeCache.has(cacheKey)) {
      console.log('🗺️ Using cached route');
      return this.routeCache.get(cacheKey)!;
    }

    try {
      console.log('🗺️ Fetching route from Google Directions API...');
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await axios.get(url);

      if (response.data.status !== 'OK') {
        console.error('❌ Directions API error:', response.data.status);
        // Fallback to straight line
        return [origin, destination];
      }

      // Decode polyline from Google's encoded format
      const route = response.data.routes[0];
      const encodedPolyline = route.overview_polyline.points;
      const decodedPath = this.decodePolyline(encodedPolyline);

      // Cache the route
      this.routeCache.set(cacheKey, decodedPath);
      
      console.log(`✅ Route fetched: ${decodedPath.length} points`);
      return decodedPath;
    } catch (error) {
      console.error('❌ Error fetching route:', error);
      // Fallback to straight line
      return [origin, destination];
    }
  }

  /**
   * Decode Google's encoded polyline format
   * Algorithm from: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
   */
  private decodePolyline(encoded: string): RouteCoordinate[] {
    const points: RouteCoordinate[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }

    return points;
  }

  /**
   * Initialize route for tracking
   */
  initializeRoute(route: RouteCoordinate[]) {
    this.currentRoute = route;
    this.currentIndex = 0;
    console.log(`🚑 Route initialized with ${route.length} points`);
  }

  /**
   * Update current position and split route into traveled/remaining
   */
  updatePosition(currentLocation: { lat: number; lng: number }): RouteSegment {
    if (this.currentRoute.length === 0) {
      return { traveled: [], remaining: [] };
    }

    // Find the closest point on the route to current location
    let minDistance = Infinity;
    let closestIndex = this.currentIndex;

    // Search within a window around current index for efficiency
    const searchStart = Math.max(0, this.currentIndex - 5);
    const searchEnd = Math.min(this.currentRoute.length, this.currentIndex + 20);

    for (let i = searchStart; i < searchEnd; i++) {
      const routePoint = this.currentRoute[i];
      const distance = this.calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        routePoint.lat,
        routePoint.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    // Update current index (can only move forward)
    if (closestIndex > this.currentIndex) {
      this.currentIndex = closestIndex;
    }

    // Split route into traveled and remaining
    const traveled = this.currentRoute.slice(0, this.currentIndex + 1);
    const remaining = this.currentRoute.slice(this.currentIndex);

    console.log(`📍 Position updated: ${traveled.length} traveled, ${remaining.length} remaining`);

    return { traveled, remaining };
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Reset service
   */
  reset() {
    this.currentRoute = [];
    this.currentIndex = 0;
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    if (this.currentRoute.length === 0) return 0;
    return (this.currentIndex / this.currentRoute.length) * 100;
  }
}

export default new RoutingService();
