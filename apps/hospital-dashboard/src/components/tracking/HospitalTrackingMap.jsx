import { MapPin, Truck, FirstAid } from 'phosphor-react';
import React, { useEffect, useRef, useState } from 'react';

import { useAmbulanceTracking } from '../../utils/ambulanceTracking';
import { generateTrackingMapHTML } from '../../utils/mapPolyline';

/**
 * Hospital Tracking Map Component
 * 
 * Displays ambulance tracking with real-time polylines showing:
 * - Red solid lines for remaining path
 * - Blue dotted lines for traversed path
 * 
 * @param {Object} ambulance - Ambulance data with location
 * @param {Object} patient - Patient data with pickup location
 * @param {Object} hospital - Hospital data with location
 * @param {string} status - Journey status ('en_route_to_patient' | 'transporting_to_hospital' | 'completed')
 */
export const HospitalTrackingMap = ({
  ambulance,
  patient,
  hospital,
  status = 'en_route_to_patient',
  className = '',
}) => {
  const iframeRef = useRef(null);
  const [mapError, setMapError] = useState(false);

  // Extract locations
  const ambulanceLocation = ambulance?.location 
    ? { lat: ambulance.location.latitude || ambulance.location.lat, lng: ambulance.location.longitude || ambulance.location.lng }
    : null;
  
  const patientLocation = patient?.location 
    ? { lat: patient.location.latitude || patient.location.lat, lng: patient.location.longitude || patient.location.lng }
    : patient?.pickupLocation
    ? { lat: patient.pickupLocation.latitude || patient.pickupLocation.lat, lng: patient.pickupLocation.longitude || patient.pickupLocation.lng }
    : null;
  
  const hospitalLocation = hospital?.location 
    ? { lat: hospital.location.latitude || hospital.location.lat, lng: hospital.location.longitude || hospital.location.lng }
    : { lat: 33.7077, lng: 73.0533 }; // PIMS Hospital fallback

  // Use tracking hook
  const tracking = useAmbulanceTracking(
    ambulanceLocation,
    patientLocation,
    hospitalLocation,
    status
  );

  // Prepare markers
  const markers = [];
  
  if (ambulanceLocation) {
    markers.push({
      position: ambulanceLocation,
      title: `Ambulance ${ambulance.vehicleNumber || ambulance.id}`,
      color: '#3B82F6', // Blue
    });
  }
  
  if (patientLocation) {
    markers.push({
      position: patientLocation,
      title: `Patient: ${patient.patientName || patient.name || 'Pickup Location'}`,
      color: '#F59E0B', // Orange
    });
  }
  
  markers.push({
    position: hospitalLocation,
    title: hospital.name || 'Hospital',
    color: '#DC2626', // Red
  });

  // Calculate map center
  const center = ambulanceLocation || patientLocation || hospitalLocation;

  // Generate map HTML with tracking polylines
  const mapHTML = generateTrackingMapHTML(
    center,
    markers,
    tracking.segments,
    '' // Add your Google Maps API key here if needed
  );

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(mapHTML);
        doc.close();
      }
    }
  }, [mapHTML]);

  if (!ambulanceLocation && !patientLocation) {
    return (
      <div className={`bg-slate-50 rounded-xl border border-slate-200 p-8 text-center ${className}`}>
        <MapPin size={48} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">Location data unavailable</p>
        <p className="text-slate-400 text-sm mt-1">Waiting for GPS coordinates...</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div className="relative w-full h-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <iframe
          ref={iframeRef}
          title="Ambulance Tracking Map"
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          onError={() => setMapError(true)}
        />
        
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <MapPin size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Map failed to load</p>
              <p className="text-slate-400 text-sm">Check your internet connection</p>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Info Overlay */}
      <div className="absolute top-4 left-4 right-4 flex gap-2">
        {/* Progress Card */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">Journey Progress</span>
            <span className="text-sm font-bold text-blue-600">{tracking.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${tracking.progress}%` }}
            />
          </div>
        </div>

        {/* Distance Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-red-500" />
            <div>
              <div className="text-xs text-slate-600">Remaining</div>
              <div className="text-sm font-bold text-slate-900">
                {tracking.remainingDistance.toFixed(1)} km
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-3">
        <div className="text-xs font-semibold text-slate-700 mb-2">Tracking Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-red-500"></div>
            <span className="text-xs text-slate-600">Remaining Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 border-b-2 border-dashed border-blue-500"></div>
            <span className="text-xs text-slate-600">Traversed Path</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border ${
          status === 'en_route_to_patient' 
            ? 'bg-orange-500 text-white border-orange-600'
            : status === 'transporting_to_hospital'
            ? 'bg-blue-500 text-white border-blue-600'
            : 'bg-green-500 text-white border-green-600'
        }`}>
          {status === 'en_route_to_patient' && '🚑 En Route to Patient'}
          {status === 'transporting_to_hospital' && '🏥 Transporting to Hospital'}
          {status === 'completed' && '✅ Trip Completed'}
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Tracking Preview Component
 * Shows mini map preview for patient cards
 */
export const TrackingPreview = ({
  ambulance,
  patient,
  hospital,
  status,
  onViewFullMap,
}) => {
  const ambulanceLocation = ambulance?.location 
    ? { lat: ambulance.location.latitude || ambulance.location.lat, lng: ambulance.location.longitude || ambulance.location.lng }
    : null;
  
  const patientLocation = patient?.location 
    ? { lat: patient.location.latitude || patient.location.lat, lng: patient.location.longitude || patient.location.lng }
    : patient?.pickupLocation
    ? { lat: patient.pickupLocation.latitude || patient.pickupLocation.lat, lng: patient.pickupLocation.longitude || patient.pickupLocation.lng }
    : null;
  
  const hospitalLocation = hospital?.location 
    ? { lat: hospital.location.latitude || hospital.location.lat, lng: hospital.location.longitude || hospital.location.lng }
    : { lat: 33.7077, lng: 73.0533 };

  const tracking = useAmbulanceTracking(
    ambulanceLocation,
    patientLocation,
    hospitalLocation,
    status
  );

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Live Tracking</span>
        </div>
        <button
          onClick={onViewFullMap}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          View Map →
        </button>
      </div>

      <div className="space-y-2">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-600">Progress</span>
            <span className="text-xs font-bold text-blue-600">{tracking.progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${tracking.progress}%` }}
            />
          </div>
        </div>

        {/* Distance Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500"></div>
            <span className="text-slate-600">{tracking.remainingDistance.toFixed(1)} km remaining</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 border-b border-dashed border-blue-500"></div>
            <span className="text-slate-600">{tracking.traversedDistance.toFixed(1)} km done</span>
          </div>
        </div>
      </div>
    </div>
  );
};
