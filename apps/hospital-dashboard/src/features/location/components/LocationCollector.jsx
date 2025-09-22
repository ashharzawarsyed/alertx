import { X } from "phosphor-react";
import React, { useState, useEffect } from "react";

import locationService from "../services/locationService.js";

import {
  LocationDisplay,
  AddressInput,
  AutoLocationDetector,
  LocationStatusCard,
} from "./";

const LocationCollector = ({
  onLocationUpdate,
  onNext,
  initialAddress = "",
}) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [address, setAddress] = useState(initialAddress);
  const [manualEntry, setManualEntry] = useState(false);

  useEffect(() => {
    if (location) {
      onLocationUpdate(location);
    }
  }, [location, onLocationUpdate]);

  const handleManualEntry = async (enteredAddress) => {
    if (!enteredAddress.trim()) {
      setLocationError("Please enter a hospital address");
      return;
    }

    setLoading(true);
    setLocationError("");

    try {
      const locationData =
        await locationService.getComprehensiveLocation(enteredAddress);
      setLocation(locationData);
      setAddress(enteredAddress);
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoDetect = async () => {
    setLoading(true);
    setLocationError("");

    try {
      const locationData = await locationService.getCurrentLocation();

      // Try to get address for the coordinates
      try {
        const reversedAddress = await locationService.reverseGeocode(
          locationData.latitude,
          locationData.longitude
        );
        setAddress(reversedAddress.formatted_address);

        setLocation({
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          },
          address: reversedAddress.formatted_address,
          methods_used: ["browser_geolocation", "reverse_geocoding"],
          accuracy: locationData.accuracy < 100 ? "high" : "medium",
          timestamp: new Date().toISOString(),
        });
      } catch {
        // If reverse geocoding fails, just use coordinates
        setLocation({
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          },
          address: null,
          methods_used: ["browser_geolocation"],
          accuracy: locationData.accuracy < 100 ? "medium" : "low",
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationError("");
    setAddress(initialAddress);
  };

  const toggleManualEntry = () => {
    setManualEntry(!manualEntry);
    setLocationError("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Hospital Location</h3>
        {location && (
          <button
            type="button"
            onClick={clearLocation}
            className="text-red-500 hover:text-red-700 p-1"
            title="Clear location"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <LocationStatusCard
        locationError={locationError}
        manualEntry={manualEntry}
        loading={loading}
        onToggleManualEntry={toggleManualEntry}
        onNext={onNext}
      >
        {!location ? (
          <div className="space-y-4">
            {manualEntry ? (
              <AddressInput
                address={address}
                onAddressChange={setAddress}
                onSubmit={handleManualEntry}
                loading={loading}
              />
            ) : (
              <AutoLocationDetector
                onAutoDetect={handleAutoDetect}
                loading={loading}
              />
            )}

            {!manualEntry && (
              <>
                {/* OR Divider */}
                <div className="flex items-center">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3 text-sm text-gray-500">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              </>
            )}
          </div>
        ) : (
          <LocationDisplay location={location} />
        )}
      </LocationStatusCard>

      {/* Location Benefits Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">
          Why we need your location:
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Route emergency patients to your hospital</li>
          <li>• Calculate accurate travel times for ambulances</li>
          <li>• Optimize emergency response coordination</li>
          <li>• Provide precise directions to emergency services</li>
        </ul>
      </div>
    </div>
  );
};

export default LocationCollector;
