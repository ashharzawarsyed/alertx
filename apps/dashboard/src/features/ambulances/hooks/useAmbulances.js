/**
 * Custom hook for ambulance data management
 * Provides state management, real-time updates, and error handling for ambulance operations
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ambulanceAPI,
  AmbulanceAPIError,
  NetworkError,
} from "../services/ambulanceAPI";

export const useAmbulances = (filters = {}) => {
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const unsubscribeRef = useRef(null);

  // Fetch ambulances data
  const fetchAmbulances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ambulanceAPI.getAll(filters);

      if (result.success) {
        setAmbulances(result.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setError({
        message: err.message || "Failed to load ambulances",
        type: err instanceof NetworkError ? "network" : "api",
        status: err.status || 500,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Real-time updates subscription
  useEffect(() => {
    // Subscribe to real-time updates
    unsubscribeRef.current = ambulanceAPI.subscribeToUpdates((updateData) => {
      if (updateData.type === "update" && updateData.data) {
        setAmbulances(updateData.data);
        setLastUpdated(new Date());
      } else if (updateData.type === "error") {
        setError({
          message: "Real-time connection failed",
          type: "websocket",
          status: null,
        });
      }
    }, filters);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [filters]);

  // Initial data fetch
  useEffect(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  // Retry function for error recovery
  const retry = useCallback(() => {
    fetchAmbulances();
  }, [fetchAmbulances]);

  return {
    ambulances,
    loading,
    error,
    lastUpdated,
    retry,
    refetch: fetchAmbulances,
  };
};

export const useAmbulance = (ambulanceId) => {
  const [ambulance, setAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAmbulance = useCallback(async () => {
    if (!ambulanceId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await ambulanceAPI.getById(ambulanceId);

      if (result.success) {
        setAmbulance(result.data);
      }
    } catch (err) {
      setError({
        message: err.message || "Failed to load ambulance",
        type: err instanceof NetworkError ? "network" : "api",
        status: err.status || 500,
      });
    } finally {
      setLoading(false);
    }
  }, [ambulanceId]);

  useEffect(() => {
    fetchAmbulance();
  }, [fetchAmbulance]);

  // Update status function
  const updateStatus = useCallback(
    async (status, metadata = {}) => {
      try {
        await ambulanceAPI.updateStatus(ambulanceId, status, metadata);
        // Refetch to get updated data
        await fetchAmbulance();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err.message || "Failed to update status",
        };
      }
    },
    [ambulanceId, fetchAmbulance],
  );

  // Update location function
  const updateLocation = useCallback(
    async (coordinates, address = null) => {
      try {
        await ambulanceAPI.updateLocation(ambulanceId, coordinates, address);
        await fetchAmbulance();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err.message || "Failed to update location",
        };
      }
    },
    [ambulanceId, fetchAmbulance],
  );

  return {
    ambulance,
    loading,
    error,
    updateStatus,
    updateLocation,
    refetch: fetchAmbulance,
  };
};
