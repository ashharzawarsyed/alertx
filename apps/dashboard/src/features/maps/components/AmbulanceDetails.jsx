import React from "react";
import {
  Truck,
  Clock,
  Users,
  Navigation,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";
import { useMapsDispatch, MAPS_ACTIONS } from "../context/MapsContext";

const AmbulanceDetails = ({ ambulance }) => {
  const dispatch = useMapsDispatch();

  if (!ambulance) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "On Route":
        return "bg-blue-500 text-white";
      case "Idle":
        return "bg-green-500 text-white";
      case "Busy":
        return "bg-red-500 text-white";
      case "Available":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleStatusUpdate = (newStatus) => {
    dispatch({
      type: MAPS_ACTIONS.UPDATE_AMBULANCE,
      payload: {
        id: ambulance.id,
        updates: { status: newStatus },
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Status Card */}
      <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
            <Truck className="h-5 w-5 text-blue-600" />
            {ambulance.id}
          </h3>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(ambulance.status)}`}
          >
            {ambulance.status}
          </span>
        </div>

        {ambulance.eta && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            ETA: {ambulance.eta} minutes
          </div>
        )}
      </div>

      {/* Crew Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <Users className="h-5 w-5 text-gray-600" />
          Crew
        </h4>
        <div className="space-y-3">
          {ambulance.crew.map((member, index) => (
            <div key={index} className="flex items-center gap-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-gray-600">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Route Information */}
      {ambulance.route && ambulance.route.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
            <Navigation className="h-5 w-5 text-gray-600" />
            Route
          </h4>
          <div className="space-y-2">
            {ambulance.route.map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>
                  Point {index + 1}: {point[0].toFixed(4)},{" "}
                  {point[1].toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-3 font-semibold text-gray-900">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleStatusUpdate("Available")}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 p-3 text-white transition-colors hover:bg-green-700"
            disabled={ambulance.status === "Available"}
          >
            <CheckCircle className="h-4 w-4" />
            Set Available
          </button>
          <button
            onClick={() => handleStatusUpdate("Busy")}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 p-3 text-white transition-colors hover:bg-red-700"
            disabled={ambulance.status === "Busy"}
          >
            <XCircle className="h-4 w-4" />
            Set Busy
          </button>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceDetails;
