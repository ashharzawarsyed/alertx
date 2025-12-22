/**
 * Ambulance Tracking with Google Directions API for Hospital Dashboard
 * Web-compatible version using the same routing logic as mobile apps
 * 
 * Features:
 * - Google Directions API for real road routes
 * - Polyline decoding for accurate paths
 * - Dynamic traveled (blue dashed) vs remaining (green/orange) segments
 * - Real-time route progress tracking
 */

import React from 'react';

/**
 * @typedef {Object} TrackingLocation
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} RouteCoordinate
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} TrackingSegment
 * @property {TrackingLocation[]} coordinates - Array of coordinates for polyline
 * @property {string} color - Hex color
 * @property {number} weight - Line weight
 * @property {number} opacity - Line opacity
 * @property {string} [dashArray] - Dash pattern for dotted lines
 * @property {number} zIndex - Z-index for layering
 */

/**
 * @typedef {Object} AmbulanceTrackingState
 * @property {TrackingSegment[]} segments
 * @property {number} progress
 * @property {number} remainingDistance
 * @property {number} traversedDistance
 * @property {RouteCoordinate[]} routeCoordinates
 */

// Google Maps API key from environment
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Calculate distance between two points using Haversine formula
 * @param {TrackingLocation} point1
 * @param {TrackingLocation} point2
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(point1, point2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Decode Google's encoded polyline format to coordinates
 * Algorithm from: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 * @param {string} encoded - Encoded polyline string
 * @returns {RouteCoordinate[]} Decoded coordinates
 */
export function decodePolyline(encoded) {
  const points = [];
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
 * Fetch route from Google Directions API
 * @param {TrackingLocation} origin
 * @param {TrackingLocation} destination
 * @returns {Promise<RouteCoordinate[]>} Route coordinates
 */
export async function fetchRoute(origin, destination) {
  try {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const route = data.routes[0];
      const encodedPolyline = route.overview_polyline.points;
      const decodedPath = decodePolyline(encodedPolyline);
      
      console.log(`✅ Route fetched: ${decodedPath.length} points`);
      return decodedPath;
    } else {
      console.warn('⚠️ Directions API error:', data.status);
      // Fallback to straight line
      return [origin, destination];
    }
  } catch (error) {
    console.error('❌ Error fetching route:', error);
    // Fallback to straight line
    return [origin, destination];
  }
}

/**
 * Update position and split route into traveled/remaining segments
 * @param {RouteCoordinate[]} routeCoordinates - Full route from Google API
 * @param {TrackingLocation} currentLocation - Current ambulance position
 * @returns {{traveled: RouteCoordinate[], remaining: RouteCoordinate[]}}
 */
export function updateRoutePaths(routeCoordinates, currentLocation) {
  if (routeCoordinates.length === 0) {
    return { traveled: [], remaining: [] };
  }

  // Find closest point on route to current location
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < routeCoordinates.length; i++) {
    const point = routeCoordinates[i];
    const dist = Math.sqrt(
      Math.pow(point.lat - currentLocation.lat, 2) + 
      Math.pow(point.lng - currentLocation.lng, 2)
    );

    if (dist < minDistance) {
      minDistance = dist;
      closestIndex = i;
    }
  }

  // Split route into traveled and remaining
  const traveled = routeCoordinates.slice(0, closestIndex + 1);
  const remaining = routeCoordinates.slice(closestIndex);

  return { traveled, remaining };
}

/**
 * Generate tracking segments from route coordinates and current position
 * Matches mobile app implementation with traveled (blue dashed) and remaining (green/orange) paths
 * @param {RouteCoordinate[]} routeCoordinates - Full route from Google API
 * @param {TrackingLocation} currentLocation - Current ambulance position
 * @param {'en_route_to_patient'|'transporting_to_hospital'|'completed'} status
 * @returns {TrackingSegment[]}
 */
export function generateTrackingSegments(
  routeCoordinates,
  currentLocation,
  status
) {
  const segments = [];

  if (status === 'completed' || routeCoordinates.length === 0) {
    return [];
  }

  // Split route into traveled and remaining based on current position
  const { traveled, remaining } = updateRoutePaths(routeCoordinates, currentLocation);

  // Traveled path (blue dashed)
  if (traveled.length > 1) {
    segments.push({
      coordinates: traveled,
      color: '#3b82f6',
      weight: 5,
      opacity: 0.7,
      dashArray: '10, 5',
      zIndex: 2,
    });
  }

  // Remaining path (green for to patient, orange for to hospital)
  if (remaining.length > 1) {
    const color = status === 'transporting_to_hospital' ? '#f97316' : '#10b981';
    segments.push({
      coordinates: remaining,
      color: color,
      weight: 5,
      opacity: 0.9,
      zIndex: 1,
    });
  }

  return segments;
}

/**
 * Hook to calculate ambulance tracking state with Google API routes
 * Web-compatible version using React hooks
 * @param {TrackingLocation|null} ambulanceLocation
 * @param {TrackingLocation|null} patientLocation
 * @param {TrackingLocation|null} hospitalLocation
 * @param {'en_route_to_patient'|'transporting_to_hospital'|'completed'} status
 * @returns {AmbulanceTrackingState}
 */
export function useAmbulanceTracking(
  ambulanceLocation,
  patientLocation,
  hospitalLocation,
  status
) {
  const [routeCoordinates, setRouteCoordinates] = React.useState([]);
  const [segments, setSegments] = React.useState([]);

  // Fetch route when locations or status change
  React.useEffect(() => {
    if (!ambulanceLocation || !patientLocation || !hospitalLocation) {
      setRouteCoordinates([]);
      setSegments([]);
      return;
    }

    const loadRoute = async () => {
      const destination = status === 'transporting_to_hospital' 
        ? hospitalLocation 
        : patientLocation;

      const route = await fetchRoute(ambulanceLocation, destination);
      setRouteCoordinates(route);

      // Generate segments from route
      const newSegments = generateTrackingSegments(
        route,
        ambulanceLocation,
        status
      );
      setSegments(newSegments);
    };

    loadRoute();
  }, [
    ambulanceLocation?.lat,
    ambulanceLocation?.lng,
    patientLocation?.lat,
    patientLocation?.lng,
    hospitalLocation?.lat,
    hospitalLocation?.lng,
    status
  ]);

  // Calculate distances
  let remainingDistance = 0;
  let traversedDistance = 0;

  segments.forEach((segment) => {
    if (segment.coordinates && segment.coordinates.length >= 2) {
      for (let i = 0; i < segment.coordinates.length - 1; i++) {
        const dist = calculateDistance(
          segment.coordinates[i],
          segment.coordinates[i + 1]
        );
        if (segment.color === '#3b82f6') {
          traversedDistance += dist;
        } else {
          remainingDistance += dist;
        }
      }
    }
  });

  const totalDistance = remainingDistance + traversedDistance;
  const progress = totalDistance > 0 ? (traversedDistance / totalDistance) * 100 : 0;

  return {
    segments,
    progress,
    remainingDistance,
    traversedDistance,
    routeCoordinates,
  };
}
