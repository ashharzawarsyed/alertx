/**
 * Location Service for Hospital Dashboard
 * Handles geolocation and fallback to POF Hospital coordinates
 */

// POF Hospital coordinates (fallback)
export const POF_HOSPITAL_COORDS = {
  lat: 33.7500,
  lng: 72.7847,
  name: 'POF Hospital',
  address: 'Wah Cantt, Punjab, Pakistan'
};

/**
 * Get current location with permission handling
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported, using POF Hospital coordinates');
      resolve(POF_HOSPITAL_COORDS);
      return;
    }

    // Request current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        console.log('✅ Location obtained:', location);
        resolve(location);
      },
      (error) => {
        console.warn('Location error:', error.message, '- Using POF Hospital coordinates');
        resolve(POF_HOSPITAL_COORDS);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

/**
 * Watch location changes
 * @param {Function} callback - Called with location updates
 * @returns {number} - Watch ID for cleanup
 */
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    callback(POF_HOSPITAL_COORDS);
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      console.warn('Watch location error:', error.message);
      callback(POF_HOSPITAL_COORDS);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    }
  );
};

/**
 * Clear location watch
 * @param {number} watchId
 */
export const clearLocationWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Request location permission
 * @returns {Promise<string>} - Permission state
 */
export const requestLocationPermission = async () => {
  if (!navigator.permissions) {
    return 'prompt';
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted', 'denied', or 'prompt'
  } catch (error) {
    console.warn('Permission query failed:', error);
    return 'prompt';
  }
};
