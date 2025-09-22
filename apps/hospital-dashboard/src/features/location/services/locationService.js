/**
 * Hospital Location Service
 * Provides accurate location collection for patient routing
 */

class LocationService {
  constructor() {
    this.geocoder = null;
    this.map = null;
  }

  /**
   * Initialize Google Maps services (if API key available)
   */
  async initializeGoogleMaps() {
    try {
      if (window.google && window.google.maps) {
        this.geocoder = new window.google.maps.Geocoder();
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Google Maps not available:', error);
      return false;
    }
  }

  /**
   * Get current location using browser geolocation
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            method: 'browser_geolocation'
          });
        },
        (error) => {
          let errorMessage = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  /**
   * Geocode address to coordinates using Google Maps
   */
  async geocodeAddress(address) {
    try {
      await this.initializeGoogleMaps();
      
      if (!this.geocoder) {
        throw new Error('Google Maps geocoder not available');
      }

      return new Promise((resolve, reject) => {
        this.geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const result = {
              latitude: location.lat(),
              longitude: location.lng(),
              formatted_address: results[0].formatted_address,
              place_id: results[0].place_id,
              address_components: results[0].address_components,
              method: 'google_geocoding',
              accuracy: 'high'
            };
            resolve(result);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      throw new Error(`Geocoding error: ${error.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude, longitude) {
    try {
      await this.initializeGoogleMaps();
      
      if (!this.geocoder) {
        throw new Error('Google Maps geocoder not available');
      }

      const latlng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

      return new Promise((resolve, reject) => {
        this.geocoder.geocode({ location: latlng }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve({
              formatted_address: results[0].formatted_address,
              address_components: results[0].address_components,
              place_id: results[0].place_id
            });
          } else {
            reject(new Error(`Reverse geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      throw new Error(`Reverse geocoding error: ${error.message}`);
    }
  }

  /**
   * Validate hospital coordinates by checking if they're in a reasonable location
   */
  validateHospitalLocation(latitude, longitude, _expectedAddress = null) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Basic validation
    if (isNaN(lat) || isNaN(lng)) {
      return { valid: false, error: 'Invalid coordinates' };
    }

    // Check if coordinates are within reasonable bounds
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return { valid: false, error: 'Coordinates out of valid range' };
    }

    // Check if coordinates are not null island (0,0)
    if (lat === 0 && lng === 0) {
      return { valid: false, error: 'Coordinates point to null island' };
    }

    return { valid: true };
  }

  /**
   * Get comprehensive location data combining multiple methods
   */
  async getComprehensiveLocation(hospitalAddress) {
    const locationData = {
      coordinates: null,
      address: null,
      methods_used: [],
      accuracy: 'unknown',
      timestamp: new Date().toISOString()
    };

    try {
      // Method 1: Try geocoding the provided address first
      if (hospitalAddress) {
        try {
          const geocoded = await this.geocodeAddress(hospitalAddress);
          locationData.coordinates = {
            latitude: geocoded.latitude,
            longitude: geocoded.longitude
          };
          locationData.address = geocoded.formatted_address;
          locationData.place_id = geocoded.place_id;
          locationData.accuracy = 'high';
          locationData.methods_used.push('google_geocoding');
        } catch (error) {
          console.warn('Geocoding failed:', error.message);
        }
      }

      // Method 2: Fallback to browser geolocation if geocoding failed
      if (!locationData.coordinates) {
        try {
          const browserLocation = await this.getCurrentLocation();
          locationData.coordinates = {
            latitude: browserLocation.latitude,
            longitude: browserLocation.longitude
          };
          locationData.accuracy = browserLocation.accuracy < 100 ? 'medium' : 'low';
          locationData.methods_used.push('browser_geolocation');

          // Try to reverse geocode browser location
          try {
            const reversed = await this.reverseGeocode(
              browserLocation.latitude,
              browserLocation.longitude
            );
            locationData.address = reversed.formatted_address;
          } catch (error) {
            console.warn('Reverse geocoding failed:', error.message);
          }
        } catch (error) {
          console.warn('Browser geolocation failed:', error.message);
        }
      }

      // Validate final coordinates
      if (locationData.coordinates) {
        const validation = this.validateHospitalLocation(
          locationData.coordinates.latitude,
          locationData.coordinates.longitude
        );
        
        if (!validation.valid) {
          throw new Error(`Invalid location: ${validation.error}`);
        }
      }

      return locationData;
    } catch (error) {
      throw new Error(`Location collection failed: ${error.message}`);
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(latitude, longitude, precision = 6) {
    return `${parseFloat(latitude).toFixed(precision)}, ${parseFloat(longitude).toFixed(precision)}`;
  }
}

export default new LocationService();