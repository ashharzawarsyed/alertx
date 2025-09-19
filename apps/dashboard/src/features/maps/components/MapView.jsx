import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {
  useMapsState,
  useMapsDispatch,
  MAPS_ACTIONS,
} from "../context/MapsContext";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Clean professional ambulance icon with modern SVG design
const createAmbulanceIcon = (status, isMoving = true) => {
  const statusColors = {
    "On Route": { primary: "#3B82F6", secondary: "#1E40AF", glow: "#60A5FA" },
    Idle: { primary: "#10B981", secondary: "#047857", glow: "#34D399" },
    Busy: { primary: "#EF4444", secondary: "#B91C1C", glow: "#F87171" },
  };

  const colors = statusColors[status] || statusColors["Idle"];

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
        ${isMoving ? `<div class="absolute inset-0 rounded-full animate-ping" style="background: ${colors.glow}; opacity: 0.3;"></div>` : ""}
        <div class="relative bg-white rounded-lg shadow-lg border-2 p-2" style="border-color: ${colors.primary};">
          <svg class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8H4L2 12V20C2 20.5523 2.44772 21 3 21H5C5.55228 21 6 20.5523 6 20V19H18V20C18 20.5523 18.4477 21 19 21H21C21.5523 21 22 20.5523 22 20V12L20 8Z" fill="${colors.primary}"/>
            <path d="M6 8V6C6 4.89543 6.89543 4 8 4H16C17.1046 4 18 4.89543 18 6V8" stroke="${colors.primary}" stroke-width="2" fill="none"/>
            <circle cx="7" cy="17" r="2" fill="#374151"/>
            <circle cx="17" cy="17" r="2" fill="#374151"/>
            <path d="M10 10H14M12 8V12" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <rect x="2" y="10" width="2" height="4" fill="#EF4444"/>
            <rect x="20" y="10" width="2" height="4" fill="#EF4444"/>
          </svg>
        </div>
        <div class="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center" style="background: ${colors.primary};">
          ${
            status === "On Route"
              ? '<svg class="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15,8 22,8 17,13 18,20 12,17 6,20 7,13 2,8 9,8"/></svg>'
              : status === "Idle"
                ? '<svg class="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/></svg>'
                : '<svg class="w-2 h-2 text-white" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>'
          }
        </div>
      </div>
    `,
    className: `ambulance-marker ${isMoving ? "moving" : ""}`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Clean professional hospital icon with modern SVG design
const createHospitalIcon = (available, capacity = 85) => {
  const isNearFull = capacity > 90;
  const statusColor = available
    ? isNearFull
      ? "#F59E0B"
      : "#10B981"
    : "#EF4444";
  const glowColor = available
    ? isNearFull
      ? "#FCD34D"
      : "#34D399"
    : "#F87171";

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
        <div class="absolute inset-0 rounded-lg animate-pulse" style="background: ${glowColor}; opacity: 0.2; filter: blur(4px);"></div>
        <div class="relative bg-white rounded-lg shadow-lg border-2 p-2" style="border-color: ${statusColor};">
          <svg class="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7L12 2L3 7Z" fill="${statusColor}"/>
            <path d="M3 7L12 2L21 7" stroke="${statusColor}" stroke-width="2" fill="none"/>
            <path d="M9 12H15M12 9V15" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="12" cy="4" r="1.5" fill="white"/>
            <path d="M7 15V18H9V15H7ZM15 15V18H17V15H15Z" fill="white" opacity="0.7"/>
            <path d="M6 9H18V11H6V9Z" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 text-xs font-bold text-white rounded shadow-sm" style="background: ${statusColor};">
          ${capacity}%
        </div>
      </div>
    `,
    className: `hospital-marker ${available ? "available" : "unavailable"}`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
  });
};

const MapView = () => {
  const { ambulances, hospitals, layerVisibility } = useMapsState();
  const dispatch = useMapsDispatch();

  const handleEntityClick = (entity, type) => {
    dispatch({
      type: MAPS_ACTIONS.SELECT_ENTITY,
      payload: { ...entity, type },
    });
    dispatch({
      type: MAPS_ACTIONS.SET_SIDEBAR_OPEN,
      payload: true,
    });
  };

  return (
    <div className="relative h-full w-full">
      {/* Custom CSS for animations */}
      <style>
        {`
          /* Clean, modern marker animations */
          .ambulance-marker.moving .animate-ping {
            animation: clean-ping 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
          
          @keyframes clean-ping {
            0% {
              transform: scale(1);
              opacity: 0.6;
            }
            75% {
              transform: scale(1.8);
              opacity: 0.2;
            }
            100% {
              transform: scale(2.2);
              opacity: 0;
            }
          }
          
          .hospital-marker {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .hospital-marker:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
          }
          
          .ambulance-marker {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .ambulance-marker:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
          }
          
          .hospital-marker .animate-pulse {
            animation: hospital-glow 3s ease-in-out infinite;
          }
          
          @keyframes hospital-glow {
            0%, 100% {
              opacity: 0.2;
            }
            50% {
              opacity: 0.4;
            }
          }
          
          .leaflet-container {
            height: 100%;
            width: 100%;
          }
          
          /* Remove default Leaflet marker styling */
          .leaflet-marker-icon {
            background: transparent !important;
            border: none !important;
          }
          
          .leaflet-div-icon {
            background: transparent !important;
            border: none !important;
          }
          
          /* Smooth performance optimizations */
          .ambulance-marker > div,
          .hospital-marker > div {
            will-change: transform;
            backface-visibility: hidden;
          }
        `}
      </style>

      <MapContainer
        center={[40.7589, -73.9851]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Hospitals */}
        {layerVisibility.hospitals &&
          hospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={hospital.coords}
              icon={createHospitalIcon(
                hospital.available,
                hospital.capacity || 85,
              )}
              eventHandlers={{
                click: () => handleEntityClick(hospital, "hospital"),
              }}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">{hospital.name}</h3>
                  <p
                    className={`font-medium ${hospital.available ? "text-green-600" : "text-red-600"}`}
                  >
                    {hospital.available ? "Available" : "Full"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Capacity: {hospital.capacity || 85}%
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Ambulances with real-time tracking */}
        {layerVisibility.ambulances &&
          ambulances.map((ambulance) => (
            <Marker
              key={ambulance.id}
              position={ambulance.coords}
              icon={createAmbulanceIcon(
                ambulance.status,
                ambulance.status === "On Route",
              )}
              eventHandlers={{
                click: () => handleEntityClick(ambulance, "ambulance"),
              }}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">Ambulance {ambulance.id}</h3>
                  <p
                    className={`font-medium ${
                      ambulance.status === "On Route"
                        ? "text-blue-600"
                        : ambulance.status === "Idle"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {ambulance.status}
                  </p>
                  <p className="text-sm text-gray-600">
                    ETA: {ambulance.eta || "N/A"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
