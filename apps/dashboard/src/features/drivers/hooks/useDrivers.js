/**
 * Custom hooks for driver management
 */

import { useState, useEffect, useCallback } from "react";
import { driverAPI } from "../services/driverAPI";

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all drivers without filters since we filter on the frontend
      const result = await driverAPI.getAllDrivers();

      if (result.success) {
        setDrivers(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to load drivers");
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const approveDriver = useCallback(
    async (driverId, assignedAmbulance = null) => {
      try {
        const result = await driverAPI.approveDriver(
          driverId,
          assignedAmbulance,
        );
        if (result.success) {
          // Fetch fresh data directly instead of calling fetchDrivers to avoid circular dependency
          const refreshResult = await driverAPI.getAllDrivers();
          if (refreshResult.success) {
            setDrivers(refreshResult.data);
          }
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [],
  ); // No dependencies needed

  const rejectDriver = useCallback(async (driverId, reason = "") => {
    try {
      const result = await driverAPI.rejectDriver(driverId, reason);
      if (result.success) {
        // Fetch fresh data directly instead of calling fetchDrivers to avoid circular dependency
        const refreshResult = await driverAPI.getAllDrivers();
        if (refreshResult.success) {
          setDrivers(refreshResult.data);
        }
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []); // No dependencies needed

  const updateDriverStatus = useCallback(
    async (driverId, status, location = null) => {
      try {
        const result = await driverAPI.updateDriverStatus(
          driverId,
          status,
          location,
        );
        if (result.success) {
          // Fetch fresh data directly instead of calling fetchDrivers to avoid circular dependency
          const refreshResult = await driverAPI.getAllDrivers();
          if (refreshResult.success) {
            setDrivers(refreshResult.data);
          }
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [],
  ); // No dependencies needed

  return {
    drivers,
    loading,
    error,
    refetch: fetchDrivers,
    approveDriver,
    rejectDriver,
    updateDriverStatus,
  };
};

export const usePendingDrivers = () => {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await driverAPI.getPendingDrivers();

      if (result.success) {
        setPendingDrivers(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to load pending drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingDrivers();
  }, [fetchPendingDrivers]);

  return {
    pendingDrivers,
    loading,
    error,
    refetch: fetchPendingDrivers,
  };
};
