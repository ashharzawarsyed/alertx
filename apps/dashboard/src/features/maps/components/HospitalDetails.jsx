import React from "react";
import {
  Hospital,
  Bed,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useMapsDispatch, MAPS_ACTIONS } from "../context/MapsContext";

const HospitalDetails = ({ hospital }) => {
  const dispatch = useMapsDispatch();

  if (!hospital) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Online":
        return "bg-green-500 text-white";
      case "Offline":
        return "bg-red-500 text-white";
      case "Maintenance":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCapacityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const handleStatusUpdate = (newStatus) => {
    dispatch({
      type: MAPS_ACTIONS.UPDATE_HOSPITAL,
      payload: {
        id: hospital.id,
        updates: { status: newStatus },
      },
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Hospital Info */}
      <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
            <Hospital className="h-5 w-5 text-green-600" />
            {hospital.name}
          </h3>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(hospital.status)}`}
          >
            {hospital.status}
          </span>
        </div>
        <p className="text-sm text-gray-600">{hospital.address}</p>
      </div>

      {/* Bed Capacity */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
          <Bed className="h-5 w-5 text-gray-600" />
          Bed Capacity
        </h4>

        {/* General Beds */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              General Beds
            </span>
            <span
              className={`text-sm font-bold ${getCapacityColor(hospital.beds.available, hospital.beds.total)}`}
            >
              {hospital.beds.available}/{hospital.beds.total}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                hospital.beds.available > hospital.beds.total * 0.5
                  ? "bg-green-500"
                  : hospital.beds.available > hospital.beds.total * 0.2
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{
                width: `${Math.max(5, (hospital.beds.available / hospital.beds.total) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* ICU Beds */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">ICU Beds</span>
            <span
              className={`text-sm font-bold ${getCapacityColor(hospital.beds.icu, hospital.beds.icuTotal)}`}
            >
              {hospital.beds.icu}/{hospital.beds.icuTotal}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                hospital.beds.icu > hospital.beds.icuTotal * 0.5
                  ? "bg-green-500"
                  : hospital.beds.icu > hospital.beds.icuTotal * 0.2
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{
                width: `${Math.max(5, (hospital.beds.icu / hospital.beds.icuTotal) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Emergency Status */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Emergency Status
        </h4>
        <div className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3">
          <span className="text-sm font-medium text-gray-700">
            Incoming Emergencies
          </span>
          <span className="text-lg font-bold text-orange-600">
            {hospital.incomingEmergencies}
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
          <Phone className="h-5 w-5 text-gray-600" />
          Contact
        </h4>
        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700">
          <Phone className="h-4 w-4" />
          Call Hospital
        </button>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h4 className="mb-3 font-semibold text-gray-900">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleStatusUpdate("Online")}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 p-3 text-white transition-colors hover:bg-green-700"
            disabled={hospital.status === "Online"}
          >
            <CheckCircle className="h-4 w-4" />
            Set Online
          </button>
          <button
            onClick={() => handleStatusUpdate("Maintenance")}
            className="flex items-center justify-center gap-2 rounded-lg bg-yellow-600 p-3 text-white transition-colors hover:bg-yellow-700"
            disabled={hospital.status === "Maintenance"}
          >
            <XCircle className="h-4 w-4" />
            Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;
