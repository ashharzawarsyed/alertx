import React from "react";
import { AlertTriangle, Hospital, Users, Zap } from "lucide-react";
import { useMapsState } from "../context/MapsContext";

const HotspotDetails = ({ hotspot }) => {
  const { hospitals } = useMapsState();

  if (!hotspot) return null;

  const getSeverityColor = (emergencies) => {
    if (emergencies >= 15) return "text-red-600 bg-red-50";
    if (emergencies >= 10) return "text-orange-600 bg-orange-50";
    if (emergencies >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getSeverityText = (emergencies) => {
    if (emergencies >= 15) return "Critical";
    if (emergencies >= 10) return "High";
    if (emergencies >= 5) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hotspot Info */}
      <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Emergency Hotspot
        </h3>
        <div className="text-center">
          <div className="mb-2 text-3xl font-bold text-red-600">
            {hotspot.emergencies}
          </div>
          <div className="text-sm text-gray-600">Active Emergencies</div>
          <div
            className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${getSeverityColor(hotspot.emergencies)}`}
          >
            {getSeverityText(hotspot.emergencies)} Priority
          </div>
        </div>
      </div>

      {/* Area Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-3 font-semibold text-gray-900">Area Coverage</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Radius</span>
            <span className="text-sm font-medium">{hotspot.radius}m</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Coverage Area</span>
            <span className="text-sm font-medium">
              {((Math.PI * Math.pow(hotspot.radius, 2)) / 1000).toFixed(2)} km²
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Coordinates</span>
            <span className="text-sm font-medium">
              {hotspot.coords[0].toFixed(4)}, {hotspot.coords[1].toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <Zap className="h-5 w-5 text-blue-600" />
          Recommendations
        </h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            <p>Deploy 2 additional ambulances to this area</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            <p>Alert nearby hospitals to prepare for incoming patients</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            <p>Consider setting up temporary triage station</p>
          </div>
        </div>
      </div>

      {/* Nearby Hospitals */}
      <div className="rounded-xl bg-gray-50 p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <Hospital className="h-5 w-5 text-gray-600" />
          Nearby Hospitals
        </h4>
        <div className="space-y-2">
          {hospitals.slice(0, 2).map((hospital) => (
            <div
              key={hospital.id}
              className="flex items-center justify-between rounded-lg bg-white p-2"
            >
              <div>
                <p className="text-sm font-medium">{hospital.name}</p>
                <p className="text-xs text-gray-600">
                  {hospital.beds.available} beds available
                </p>
              </div>
              <span className="text-xs text-blue-600">2.1 km</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-medium text-white transition-colors hover:bg-red-700">
          <AlertTriangle className="h-4 w-4" />
          Dispatch Emergency Response
        </button>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-3 font-medium text-white transition-colors hover:bg-orange-700">
          <Users className="h-4 w-4" />
          Coordinate Resources
        </button>
      </div>
    </div>
  );
};

export default HotspotDetails;
