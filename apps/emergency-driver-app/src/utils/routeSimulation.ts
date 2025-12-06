/**
 * Test Route Simulation for Driver App
 * 
 * This script simulates an ambulance following the ACTUAL Google Directions API route
 * Instead of hardcoded waypoints, it follows the real polyline points (e.g., 124 points)
 * 
 * Usage:
 * 1. Import in active-emergency.tsx for testing
 * 2. Call startRouteSimulation() with the Google API route
 * 3. Ambulance will follow the exact polyline path
 */

import locationService from '@/src/services/locationService';
import routingService, { RouteCoordinate } from '@/src/services/routingService';

// Test coordinates
export const AMBULANCE_START_LOCATION = {
  lat: 33.8013,
  lng: 72.7012,
  name: 'Ambulance Start (Wah Garden)',
};

export const PATIENT_LOCATION = {
  lat: 33.8255,
  lng: 72.6899,
  name: 'Patient Location',
};

export const POF_HOSPITAL = {
  lat: 33.7500,
  lng: 72.7847,
  name: 'POF Hospital Wah Cantt',
};

let simulationInterval: NodeJS.Timeout | null = null;
let currentWaypointIndex = 0;
let currentStage: 'to_patient' | 'to_hospital' = 'to_patient';
let activeRoute: RouteCoordinate[] = [];
let skipInterval = 1; // Skip every N points for faster simulation (1 = use every point)

/**
 * Start route simulation following Google Directions API route
 * @param route - The Google API route points (e.g., 124 points)
 * @param onLocationUpdate - Callback for location updates
 * @param speedMultiplier - Speed of simulation (default 2x)
 */
export const startRouteSimulation = (
  route: RouteCoordinate[],
  onLocationUpdate: (location: any) => void,
  speedMultiplier: number = 2 // 2x speed by default
) => {
  if (!route || route.length === 0) {
    console.error('❌ Cannot start simulation: No route provided');
    return;
  }

  console.log('🚑 Starting route simulation following Google API route');
  console.log(`📍 Route: ${route.length} points`);
  console.log(`⏱️ Speed multiplier: ${speedMultiplier}x`);

  currentWaypointIndex = 0;
  activeRoute = route;
  
  // Adjust skip interval based on route length (use more points for smoother animation)
  skipInterval = Math.max(1, Math.floor(route.length / 50)); // Max 50 updates
  console.log(`🎯 Using every ${skipInterval} point(s) for simulation`);

  // Update location every 1.5 seconds (adjustable by speed multiplier)
  const updateInterval = 1500 / speedMultiplier;

  simulationInterval = setInterval(() => {
    if (currentWaypointIndex >= activeRoute.length) {
      console.log('✅ Simulation completed - Arrived at destination');
      stopRouteSimulation();
      return;
    }

    const waypoint = activeRoute[currentWaypointIndex];
    
    // Calculate heading (direction) to next waypoint
    let heading = 0;
    if (currentWaypointIndex < activeRoute.length - 1) {
      const nextWaypoint = activeRoute[currentWaypointIndex + 1];
      heading = calculateBearing(
        waypoint.lat,
        waypoint.lng,
        nextWaypoint.lat,
        nextWaypoint.lng
      );
    }

    // Calculate speed (km/h) - average ambulance speed
    const speed = 60 + Math.random() * 20; // 60-80 km/h

    const locationUpdate = {
      lat: waypoint.lat,
      lng: waypoint.lng,
      accuracy: 10 + Math.random() * 5,
      altitude: 440 + Math.random() * 50,
      altitudeAccuracy: 5,
      heading: heading,
      speed: speed,
    };

    console.log(
      `🚑 Position [${currentWaypointIndex + 1}/${activeRoute.length}]: ` +
      `${waypoint.lat.toFixed(4)}, ${waypoint.lng.toFixed(4)} ` +
      `(Speed: ${speed.toFixed(0)} km/h, Heading: ${heading.toFixed(0)}°)`
    );

    onLocationUpdate(locationUpdate);
    currentWaypointIndex += skipInterval; // Skip points for faster simulation
  }, updateInterval);

  return () => stopRouteSimulation();
};

/**
 * Stop route simulation
 */
export const stopRouteSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    currentWaypointIndex = 0;
    console.log('🛑 Route simulation stopped');
  }
};

/**
 * Calculate bearing between two points
 */
const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  const bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360; // Normalize to 0-360
};

const toRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

const toDegrees = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

/**
 * Reset simulation to start
 */
export const resetRouteSimulation = () => {
  stopRouteSimulation();
  currentWaypointIndex = 0;
  console.log('🔄 Route simulation reset');
};

/**
 * Get simulation progress
 */
export const getSimulationProgress = (): number => {
  return (currentWaypointIndex / activeRoute.length) * 100;
};

/**
 * Check if simulation is running
 */
export const isSimulationRunning = (): boolean => {
  return simulationInterval !== null;
};

/**
 * Get current route being simulated
 */
export const getCurrentRoute = (): RouteCoordinate[] => {
  return activeRoute;
};
