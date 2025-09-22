import { CheckCircle } from "phosphor-react";
import React from "react";

import { Card } from "../../../shared/components/ui";
import locationService from "../services/locationService.js";

/**
 * Presentational component for displaying location information
 */
const LocationDisplay = ({ location, onClear }) => {
  const getAccuracyColor = (accuracy) => {
    switch (accuracy) {
      case "high":
        return "text-emerald-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const getAccuracyIcon = (accuracy) => {
    switch (accuracy) {
      case "high":
        return <CheckCircle className="w-4 h-4" weight="fill" />;
      case "medium":
        return <CheckCircle className="w-4 h-4" weight="duotone" />;
      case "low":
        return <CheckCircle className="w-4 h-4" weight="light" />;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-emerald-50 border-emerald-200" padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" weight="fill" />
            <span className="text-sm font-medium text-emerald-800">
              Location Confirmed
            </span>
          </div>

          {location.address && (
            <p className="text-sm text-gray-700 mb-2">
              <strong>Address:</strong> {location.address}
            </p>
          )}

          <p className="text-sm text-gray-700 mb-2">
            <strong>Coordinates:</strong>{" "}
            {locationService.formatCoordinates(
              location.coordinates.latitude,
              location.coordinates.longitude
            )}
          </p>

          <div className="flex items-center space-x-4 text-xs text-gray-600">
            <div
              className={`flex items-center space-x-1 ${getAccuracyColor(location.accuracy)}`}
            >
              {getAccuracyIcon(location.accuracy)}
              <span>Accuracy: {location.accuracy}</span>
            </div>

            <div>Method: {location.methods_used.join(", ")}</div>
          </div>
        </div>

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-red-500 hover:text-red-700 p-1 ml-4"
            title="Clear location"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </Card>
  );
};

export default LocationDisplay;
