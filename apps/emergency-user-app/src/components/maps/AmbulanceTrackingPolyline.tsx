import React, { useEffect, useState, useMemo } from 'react';

export interface TrackingLocation {
  lat: number;
  lng: number;
}

export interface TrackingSegment {
  from: TrackingLocation;
  to: TrackingLocation;
  type: 'to_patient' | 'to_hospital';
  color: string;
  dashArray?: string;
  zIndex?: number;
}

export interface AmbulanceTrackingState {
  segments: TrackingSegment[];
  progress: number;
  remainingDistance: number;
  traversedDistance: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (point1: TrackingLocation, point2: TrackingLocation): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLon = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Generate interpolated points between two locations for smooth path rendering
 * Uses linear interpolation for simplicity - can be enhanced with route APIs
 */
export const generatePathPoints = (
  start: TrackingLocation,
  end: TrackingLocation,
  numPoints: number = 20
): TrackingLocation[] => {
  const points: TrackingLocation[] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    points.push({
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio,
    });
  }
  
  return points;
};

/**
 * Calculate traversed and remaining path based on ambulance position
 * Finds closest point on path and splits accordingly
 */
export const calculateTraversedPath = (
  pathPoints: TrackingLocation[],
  ambulanceLocation: TrackingLocation,
  destination: TrackingLocation
): { traversed: TrackingLocation[]; remaining: TrackingLocation[] } => {
  if (pathPoints.length === 0) {
    return { traversed: [], remaining: [] };
  }

  // Find closest point on path to ambulance
  let closestIndex = 0;
  let minDistance = calculateDistance(pathPoints[0], ambulanceLocation);

  pathPoints.forEach((point, index) => {
    const distance = calculateDistance(point, ambulanceLocation);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  // Check if ambulance has reached destination (within 100 meters)
  const distanceToDestination = calculateDistance(ambulanceLocation, destination);
  if (distanceToDestination < 0.1) {
    return { traversed: pathPoints, remaining: [] };
  }

  // Split path at closest point
  const traversed = pathPoints.slice(0, closestIndex + 1);
  const remaining = pathPoints.slice(closestIndex);

  return { traversed, remaining };
};

/**
 * Generate tracking segments with appropriate colors and styles
 * Red solid for remaining path, blue dotted for traversed path
 */
export const generateTrackingSegments = (
  ambulanceLocation: TrackingLocation,
  patientLocation: TrackingLocation,
  hospitalLocation: TrackingLocation,
  status: 'en_route_to_patient' | 'transporting_to_hospital' | 'completed'
): TrackingSegment[] => {
  const segments: TrackingSegment[] = [];

  if (status === 'completed') {
    // Trip completed - no lines
    return segments;
  }

  if (status === 'en_route_to_patient') {
    // Generate path from ambulance to patient
    const pathToPatient = generatePathPoints(ambulanceLocation, patientLocation, 30);
    const { traversed, remaining } = calculateTraversedPath(
      pathToPatient,
      ambulanceLocation,
      patientLocation
    );

    // Add traversed segments (blue dotted)
    for (let i = 0; i < traversed.length - 1; i++) {
      segments.push({
        from: traversed[i],
        to: traversed[i + 1],
        type: 'to_patient',
        color: '#3B82F6', // Blue
        dashArray: '5, 10', // Dotted pattern
        zIndex: 1,
      });
    }

    // Add remaining segments (red solid)
    for (let i = 0; i < remaining.length - 1; i++) {
      segments.push({
        from: remaining[i],
        to: remaining[i + 1],
        type: 'to_patient',
        color: '#EF4444', // Red
        zIndex: 2,
      });
    }
  } else if (status === 'transporting_to_hospital') {
    // Path to patient is complete (blue dotted)
    const pathToPatient = generatePathPoints(patientLocation, patientLocation, 5);
    
    // Generate path from patient to hospital
    const pathToHospital = generatePathPoints(ambulanceLocation, hospitalLocation, 30);
    const { traversed, remaining } = calculateTraversedPath(
      pathToHospital,
      ambulanceLocation,
      hospitalLocation
    );

    // Mark path to patient as complete (blue dotted line back to patient)
    const completedPatientPath = generatePathPoints(ambulanceLocation, patientLocation, 10);
    for (let i = 0; i < completedPatientPath.length - 1; i++) {
      segments.push({
        from: completedPatientPath[i],
        to: completedPatientPath[i + 1],
        type: 'to_patient',
        color: '#3B82F6',
        dashArray: '5, 10',
        zIndex: 1,
      });
    }

    // Add traversed segments to hospital (blue dotted)
    for (let i = 0; i < traversed.length - 1; i++) {
      segments.push({
        from: traversed[i],
        to: traversed[i + 1],
        type: 'to_hospital',
        color: '#3B82F6',
        dashArray: '5, 10',
        zIndex: 1,
      });
    }

    // Add remaining segments to hospital (red solid)
    for (let i = 0; i < remaining.length - 1; i++) {
      segments.push({
        from: remaining[i],
        to: remaining[i + 1],
        type: 'to_hospital',
        color: '#EF4444',
        zIndex: 2,
      });
    }
  }

  return segments;
};

/**
 * React hook for managing ambulance tracking state
 */
export const useAmbulanceTracking = (
  ambulanceLocation: TrackingLocation,
  patientLocation: TrackingLocation,
  hospitalLocation: TrackingLocation,
  status: 'en_route_to_patient' | 'transporting_to_hospital' | 'completed'
): AmbulanceTrackingState => {
  const [state, setState] = useState<AmbulanceTrackingState>({
    segments: [],
    progress: 0,
    remainingDistance: 0,
    traversedDistance: 0,
  });

  useEffect(() => {
    const segments = generateTrackingSegments(
      ambulanceLocation,
      patientLocation,
      hospitalLocation,
      status
    );

    // Calculate distances
    let remainingDistance = 0;
    let traversedDistance = 0;

    segments.forEach((segment) => {
      const distance = calculateDistance(segment.from, segment.to);
      if (segment.color === '#EF4444') {
        remainingDistance += distance;
      } else {
        traversedDistance += distance;
      }
    });

    const totalDistance = remainingDistance + traversedDistance;
    const progress = totalDistance > 0 ? (traversedDistance / totalDistance) * 100 : 0;

    setState({
      segments,
      progress,
      remainingDistance,
      traversedDistance,
    });
  }, [
    ambulanceLocation.lat, 
    ambulanceLocation.lng, 
    patientLocation.lat, 
    patientLocation.lng, 
    hospitalLocation.lat, 
    hospitalLocation.lng, 
    status
  ]);

  return state;
};

export default useAmbulanceTracking;
