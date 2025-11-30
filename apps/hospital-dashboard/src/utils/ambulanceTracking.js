/**
 * Ambulance Tracking Polyline Component for Hospital Dashboard
 * 
 * Calculates and generates tracking segments for ambulance journeys
 * showing red (remaining) and blue (traversed) paths dynamically
 */

/**
 * @typedef {Object} TrackingLocation
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} TrackingSegment
 * @property {TrackingLocation} from
 * @property {TrackingLocation} to
 * @property {'remaining'|'traversed'} type
 * @property {string} color
 * @property {string} [dashArray]
 * @property {number} zIndex
 */

/**
 * @typedef {Object} AmbulanceTrackingState
 * @property {TrackingSegment[]} segments
 * @property {number} progress
 * @property {number} remainingDistance
 * @property {number} traversedDistance
 */

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
 * Generate path points between two locations using linear interpolation
 * @param {TrackingLocation} start
 * @param {TrackingLocation} end
 * @param {number} [numPoints=20]
 * @returns {TrackingLocation[]}
 */
export function generatePathPoints(start, end, numPoints = 20) {
  const points = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const ratio = i / numPoints;
    points.push({
      lat: start.lat + (end.lat - start.lat) * ratio,
      lng: start.lng + (end.lng - start.lng) * ratio,
    });
  }
  
  return points;
}

/**
 * Calculate the traversed and remaining path based on ambulance position
 * @param {TrackingLocation[]} pathPoints
 * @param {TrackingLocation} ambulancePosition
 * @param {TrackingLocation} destination
 * @returns {{traversedPoints: TrackingLocation[], remainingPoints: TrackingLocation[], splitIndex: number}}
 */
export function calculateTraversedPath(
  pathPoints,
  ambulancePosition,
  destination
) {
  if (pathPoints.length === 0) {
    return { traversedPoints: [], remainingPoints: [], splitIndex: 0 };
  }

  // Find the closest point on the path to the ambulance
  let minDistance = Infinity;
  let closestIndex = 0;

  pathPoints.forEach((point, index) => {
    const distance = calculateDistance(point, ambulancePosition);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  // Split the path at the closest point
  const traversedPoints = pathPoints.slice(0, closestIndex + 1);
  const remainingPoints = pathPoints.slice(closestIndex);

  // Add ambulance position to traversed if it's not already at destination
  if (calculateDistance(ambulancePosition, destination) > 0.1) {
    traversedPoints.push(ambulancePosition);
    remainingPoints.unshift(ambulancePosition);
  }

  return { traversedPoints, remainingPoints, splitIndex: closestIndex };
}

/**
 * Generate tracking segments for different journey phases
 * @param {TrackingLocation} ambulanceLocation
 * @param {TrackingLocation} patientLocation
 * @param {TrackingLocation} hospitalLocation
 * @param {'en_route_to_patient'|'transporting_to_hospital'|'completed'} status
 * @returns {TrackingSegment[]}
 */
export function generateTrackingSegments(
  ambulanceLocation,
  patientLocation,
  hospitalLocation,
  status
) {
  const segments = [];

  if (status === 'completed') {
    // No lines when trip is completed
    return [];
  }

  if (status === 'en_route_to_patient') {
    // Generate path from ambulance to patient
    const pathToPatient = generatePathPoints(ambulanceLocation, patientLocation, 30);
    const { traversedPoints, remainingPoints } = calculateTraversedPath(
      pathToPatient,
      ambulanceLocation,
      patientLocation
    );

    // Blue dotted line for traversed path
    if (traversedPoints.length >= 2) {
      for (let i = 0; i < traversedPoints.length - 1; i++) {
        segments.push({
          from: traversedPoints[i],
          to: traversedPoints[i + 1],
          type: 'traversed',
          color: '#3B82F6', // Blue
          dashArray: '10,5',
          zIndex: 100,
        });
      }
    }

    // Red solid line for remaining path
    if (remainingPoints.length >= 2) {
      for (let i = 0; i < remainingPoints.length - 1; i++) {
        segments.push({
          from: remainingPoints[i],
          to: remainingPoints[i + 1],
          type: 'remaining',
          color: '#EF4444', // Red
          zIndex: 200,
        });
      }
    }
  } else if (status === 'transporting_to_hospital') {
    // Blue dotted line from patient to ambulance (completed pickup)
    const pathFromPatient = generatePathPoints(patientLocation, ambulanceLocation, 20);
    
    if (pathFromPatient.length >= 2) {
      for (let i = 0; i < pathFromPatient.length - 1; i++) {
        segments.push({
          from: pathFromPatient[i],
          to: pathFromPatient[i + 1],
          type: 'traversed',
          color: '#3B82F6', // Blue
          dashArray: '10,5',
          zIndex: 100,
        });
      }
    }

    // Generate path from ambulance to hospital
    const pathToHospital = generatePathPoints(ambulanceLocation, hospitalLocation, 30);
    const { traversedPoints, remainingPoints } = calculateTraversedPath(
      pathToHospital,
      ambulanceLocation,
      hospitalLocation
    );

    // Blue dotted line for traversed path to hospital
    if (traversedPoints.length >= 2) {
      for (let i = 0; i < traversedPoints.length - 1; i++) {
        segments.push({
          from: traversedPoints[i],
          to: traversedPoints[i + 1],
          type: 'traversed',
          color: '#3B82F6', // Blue
          dashArray: '10,5',
          zIndex: 150,
        });
      }
    }

    // Red solid line for remaining path to hospital
    if (remainingPoints.length >= 2) {
      for (let i = 0; i < remainingPoints.length - 1; i++) {
        segments.push({
          from: remainingPoints[i],
          to: remainingPoints[i + 1],
          type: 'remaining',
          color: '#EF4444', // Red
          zIndex: 200,
        });
      }
    }
  }

  return segments;
}

/**
 * Hook to calculate ambulance tracking state
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
  if (!ambulanceLocation || !patientLocation || !hospitalLocation) {
    return {
      segments: [],
      progress: 0,
      remainingDistance: 0,
      traversedDistance: 0,
    };
  }

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
    if (segment.type === 'remaining') {
      remainingDistance += distance;
    } else {
      traversedDistance += distance;
    }
  });

  const totalDistance = remainingDistance + traversedDistance;
  const progress = totalDistance > 0 ? (traversedDistance / totalDistance) * 100 : 0;

  return {
    segments,
    progress,
    remainingDistance,
    traversedDistance,
  };
}
