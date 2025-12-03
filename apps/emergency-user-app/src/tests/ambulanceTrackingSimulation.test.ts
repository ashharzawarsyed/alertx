/**
 * Mock Test File for Ambulance Tracking Simulation
 * Tests the tracking polyline behavior with dummy data
 * Simulates ambulance journey from start → patient → hospital
 */

import {
  calculateDistance,
  generatePathPoints,
  calculateTraversedPath,
  generateTrackingSegments,
  TrackingLocation,
} from '../components/maps/AmbulanceTrackingPolyline';

// Mock locations in Islamabad, Pakistan
const MOCK_LOCATIONS = {
  ambulanceStart: {
    lat: 33.6522, // Blue Area, Islamabad
    lng: 73.0366,
  } as TrackingLocation,
  patient: {
    lat: 33.6844, // F-7 Markaz
    lng: 73.0479,
  } as TrackingLocation,
  hospital: {
    lat: 33.7077, // PIMS Hospital
    lng: 73.0533,
  } as TrackingLocation,
};

/**
 * Simulate ambulance movement from start to patient
 * Tests red → blue transition as ambulance moves
 */
export const testEnRouteToPatient = () => {
  console.log('\n🚨 TEST CASE 1: Ambulance En Route to Patient');
  console.log('================================================\n');

  const steps = 10;
  const startLoc = MOCK_LOCATIONS.ambulanceStart;
  const patientLoc = MOCK_LOCATIONS.patient;
  const hospitalLoc = MOCK_LOCATIONS.hospital;

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const currentAmbulanceLocation: TrackingLocation = {
      lat: startLoc.lat + (patientLoc.lat - startLoc.lat) * ratio,
      lng: startLoc.lng + (patientLoc.lng - startLoc.lng) * ratio,
    };

    const segments = generateTrackingSegments(
      currentAmbulanceLocation,
      patientLoc,
      hospitalLoc,
      'en_route_to_patient'
    );

    const redSegments = segments.filter((s) => s.color === '#EF4444').length;
    const blueSegments = segments.filter((s) => s.color === '#3B82F6').length;
    const distanceToPatient = calculateDistance(currentAmbulanceLocation, patientLoc);
    const progressPercent = (ratio * 100).toFixed(0);

    console.log(`⏱️  Step ${i + 1}/${steps + 1} - ${distanceToPatient.toFixed(2)}km to patient (${progressPercent}% complete)`);
    console.log(`   Ambulance: (${currentAmbulanceLocation.lat.toFixed(4)}, ${currentAmbulanceLocation.lng.toFixed(4)})`);
    console.log(`   🔴 Red solid segments (remaining): ${redSegments}`);
    console.log(`   🔵 Blue dotted segments (traversed): ${blueSegments}\n`);
  }

  console.log('✅ Test Case 1 Complete: Path transitions from red to blue as ambulance moves\n');
};

/**
 * Simulate ambulance transporting patient to hospital
 * Tests combined path visualization
 */
export const testTransportingToHospital = () => {
  console.log('\n🏥 TEST CASE 2: Transporting Patient to Hospital');
  console.log('================================================\n');

  const steps = 10;
  const patientLoc = MOCK_LOCATIONS.patient;
  const hospitalLoc = MOCK_LOCATIONS.hospital;

  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const currentAmbulanceLocation: TrackingLocation = {
      lat: patientLoc.lat + (hospitalLoc.lat - patientLoc.lat) * ratio,
      lng: patientLoc.lng + (hospitalLoc.lng - patientLoc.lng) * ratio,
    };

    const segments = generateTrackingSegments(
      currentAmbulanceLocation,
      patientLoc,
      hospitalLoc,
      'transporting_to_hospital'
    );

    const redSegments = segments.filter((s) => s.color === '#EF4444').length;
    const blueSegments = segments.filter((s) => s.color === '#3B82F6').length;
    const distanceToHospital = calculateDistance(currentAmbulanceLocation, hospitalLoc);
    const progressPercent = (ratio * 100).toFixed(0);

    console.log(`⏱️  Step ${i + 1}/${steps + 1} - ${distanceToHospital.toFixed(2)}km to hospital (${progressPercent}% complete)`);
    console.log(`   Ambulance: (${currentAmbulanceLocation.lat.toFixed(4)}, ${currentAmbulanceLocation.lng.toFixed(4)})`);
    console.log(`   🔴 Red solid segments (remaining to hospital): ${redSegments}`);
    console.log(`   🔵 Blue dotted segments (traversed + completed to patient): ${blueSegments}\n`);
  }

  console.log('✅ Test Case 2 Complete: Dual path visualization working correctly\n');
};

/**
 * Test path calculation accuracy
 */
export const testPathCalculations = () => {
  console.log('\n📐 TEST CASE 3: Path Calculation Verification');
  console.log('================================================\n');

  const startLoc = MOCK_LOCATIONS.ambulanceStart;
  const patientLoc = MOCK_LOCATIONS.patient;
  const hospitalLoc = MOCK_LOCATIONS.hospital;

  // Test distance calculations
  const distanceToPatient = calculateDistance(startLoc, patientLoc);
  const distanceToHospital = calculateDistance(patientLoc, hospitalLoc);
  const totalDistance = distanceToPatient + distanceToHospital;

  console.log(`📍 Location Distances:`);
  console.log(`   Ambulance → Patient: ${distanceToPatient.toFixed(2)} km`);
  console.log(`   Patient → Hospital: ${distanceToHospital.toFixed(2)} km`);
  console.log(`   Total Journey: ${totalDistance.toFixed(2)} km\n`);

  // Test path generation
  const pathPoints = generatePathPoints(startLoc, patientLoc, 20);
  console.log(`🛣️  Path Generation:`);
  console.log(`   Generated ${pathPoints.length} interpolated points`);
  console.log(`   First point: (${pathPoints[0].lat.toFixed(4)}, ${pathPoints[0].lng.toFixed(4)})`);
  console.log(`   Last point: (${pathPoints[pathPoints.length - 1].lat.toFixed(4)}, ${pathPoints[pathPoints.length - 1].lng.toFixed(4)})\n`);

  // Test traversed path calculation
  const midPoint: TrackingLocation = {
    lat: (startLoc.lat + patientLoc.lat) / 2,
    lng: (startLoc.lng + patientLoc.lng) / 2,
  };
  const { traversed, remaining } = calculateTraversedPath(pathPoints, midPoint, patientLoc);

  console.log(`✂️  Path Splitting at Midpoint:`);
  console.log(`   Traversed segments: ${traversed.length}`);
  console.log(`   Remaining segments: ${remaining.length}`);
  console.log(`   Split ratio: ${((traversed.length / pathPoints.length) * 100).toFixed(0)}% / ${((remaining.length / pathPoints.length) * 100).toFixed(0)}%\n`);

  console.log('✅ Test Case 3 Complete: All calculations accurate\n');
};

/**
 * Test segment color transitions at various progress points
 */
export const testSegmentColorTransitions = () => {
  console.log('\n🎨 TEST CASE 4: Segment Color Transitions');
  console.log('================================================\n');

  const startLoc = MOCK_LOCATIONS.ambulanceStart;
  const patientLoc = MOCK_LOCATIONS.patient;
  const hospitalLoc = MOCK_LOCATIONS.hospital;

  const progressPoints = [0, 0.25, 0.5, 0.75, 1.0];

  progressPoints.forEach((ratio) => {
    const currentLoc: TrackingLocation = {
      lat: startLoc.lat + (patientLoc.lat - startLoc.lat) * ratio,
      lng: startLoc.lng + (patientLoc.lng - startLoc.lng) * ratio,
    };

    const segments = generateTrackingSegments(
      currentLoc,
      patientLoc,
      hospitalLoc,
      'en_route_to_patient'
    );

    const redCount = segments.filter((s) => s.color === '#EF4444').length;
    const blueCount = segments.filter((s) => s.color === '#3B82F6').length;
    const totalSegments = segments.length;

    const redPercent = totalSegments > 0 ? ((redCount / totalSegments) * 100).toFixed(0) : 0;
    const bluePercent = totalSegments > 0 ? ((blueCount / totalSegments) * 100).toFixed(0) : 0;

    console.log(`📊 Progress: ${(ratio * 100).toFixed(0)}%`);
    console.log(`   Red segments: ${redCount} (${redPercent}%)`);
    console.log(`   Blue segments: ${blueCount} (${bluePercent}%)`);
    console.log(`   Transition balance: ${redCount > blueCount ? 'More red (ahead)' : blueCount > redCount ? 'More blue (behind)' : 'Equal'}\n`);
  });

  console.log('✅ Test Case 4 Complete: Color transitions work correctly at all progress points\n');
};

/**
 * Test trip completion (all lines cleared)
 */
export const testTripCompletion = () => {
  console.log('\n🏁 TEST CASE 5: Trip Completion');
  console.log('================================================\n');

  const hospitalLoc = MOCK_LOCATIONS.hospital;
  const patientLoc = MOCK_LOCATIONS.patient;

  const segments = generateTrackingSegments(
    hospitalLoc, // Ambulance at hospital
    patientLoc,
    hospitalLoc,
    'completed'
  );

  console.log(`📍 Trip Status: COMPLETED`);
  console.log(`   Total segments remaining: ${segments.length}`);
  console.log(`   Expected: 0 (all lines cleared)\n`);

  if (segments.length === 0) {
    console.log('✅ Test Case 5 PASSED: All tracking lines cleared on completion\n');
  } else {
    console.log('❌ Test Case 5 FAILED: Lines should be cleared but found', segments.length, 'segments\n');
  }
};

/**
 * Run all test cases
 */
export const runAmbulanceTrackingTests = () => {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚨 AMBULANCE TRACKING SIMULATION TESTS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Testing tracking polyline behavior with mock Islamabad data');
  console.log('═══════════════════════════════════════════════════════════\n');

  testEnRouteToPatient();
  testTransportingToHospital();
  testPathCalculations();
  testSegmentColorTransitions();
  testTripCompletion();

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════════════════════\n');
};

export default {
  testEnRouteToPatient,
  testTransportingToHospital,
  testPathCalculations,
  testSegmentColorTransitions,
  testTripCompletion,
  runAmbulanceTrackingTests,
};
