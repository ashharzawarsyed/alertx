/**
 * Custom hooks for Controls & Settings management
 * Optimized with proper dependency management and error handling
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { controlsAPI } from "../services/controlsAPI";

// Main controls hook for managing all settings
export const useControls = () => {
  const [allSettings, setAllSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await controlsAPI.getAllSettings();

      if (result.success) {
        setAllSettings(result.data);
        setLastFetched(new Date().toISOString());
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSettings();
  }, [fetchAllSettings]);

  const updateCategory = useCallback(async (category, settings) => {
    try {
      const result = await controlsAPI.updateSettings(category, settings);
      if (result.success) {
        // Update local state to reflect changes immediately
        setAllSettings((prev) => ({
          ...prev,
          [category]: result.data,
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const resetCategory = useCallback(async (category) => {
    try {
      const result = await controlsAPI.resetToDefaults(category);
      if (result.success) {
        setAllSettings((prev) => ({
          ...prev,
          [category]: result.data,
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const exportSettings = useCallback(async (categories = []) => {
    try {
      const result = await controlsAPI.exportSettings(categories);
      if (result.success) {
        // Create and download the export file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `alertx-settings-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const importSettings = useCallback(
    async (file) => {
      try {
        const text = await file.text();
        const settingsData = JSON.parse(text);

        const result = await controlsAPI.importSettings(settingsData);
        if (result.success) {
          // Refresh all settings after import
          await fetchAllSettings();
          return { success: true, data: result.data };
        } else {
          return { success: false, error: result.error };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    [fetchAllSettings],
  );

  return {
    allSettings,
    loading,
    error,
    lastFetched,
    refetch: fetchAllSettings,
    updateCategory,
    resetCategory,
    exportSettings,
    importSettings,
  };
};

// Hook for managing specific settings category
export const useSettings = (category) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [originalSettings, setOriginalSettings] = useState(null);

  const fetchSettings = useCallback(async () => {
    if (!category) return;

    try {
      setLoading(true);
      setError(null);

      const result = await controlsAPI.getSettings(category);

      if (result.success) {
        setSettings(result.data.settings);
        setOriginalSettings(result.data.settings);
        setIsDirty(false);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || `Failed to load ${category} settings`);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = useCallback(
    (key, value) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        setIsDirty(
          JSON.stringify(newSettings) !== JSON.stringify(originalSettings),
        );
        return newSettings;
      });
    },
    [originalSettings],
  );

  const updateMultipleSettings = useCallback(
    (newSettings) => {
      setSettings((prev) => {
        const updatedSettings = { ...prev, ...newSettings };
        setIsDirty(
          JSON.stringify(updatedSettings) !== JSON.stringify(originalSettings),
        );
        return updatedSettings;
      });
    },
    [originalSettings],
  );

  const saveSettings = useCallback(async () => {
    if (!settings || !isDirty) return { success: true };

    try {
      const result = await controlsAPI.updateSettings(category, settings);
      if (result.success) {
        setOriginalSettings(settings);
        setIsDirty(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [category, settings, isDirty]);

  const resetSettings = useCallback(async () => {
    try {
      const result = await controlsAPI.resetToDefaults(category);
      if (result.success) {
        setSettings(result.data.settings);
        setOriginalSettings(result.data.settings);
        setIsDirty(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [category]);

  const discardChanges = useCallback(() => {
    setSettings(originalSettings);
    setIsDirty(false);
  }, [originalSettings]);

  return {
    settings,
    loading,
    error,
    isDirty,
    refetch: fetchSettings,
    updateSetting,
    updateMultipleSettings,
    saveSettings,
    resetSettings,
    discardChanges,
  };
};

// Hook for permissions and role management
export const usePermissions = () => {
  const [permissions, setPermissions] = useState({
    roles: [],
    permissions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await controlsAPI.getPermissions();

      if (result.success) {
        setPermissions(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const updateRolePermissions = useCallback(async (roleId, newPermissions) => {
    try {
      const result = await controlsAPI.updateRolePermissions(
        roleId,
        newPermissions,
      );
      if (result.success) {
        // Update local state
        setPermissions((prev) => ({
          ...prev,
          roles: prev.roles.map((role) =>
            role.id === roleId
              ? { ...role, permissions: newPermissions }
              : role,
          ),
        }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Helper to check if a role has a specific permission
  const hasPermission = useCallback(
    (roleId, permission) => {
      const role = permissions.roles.find((r) => r.id === roleId);
      if (!role) return false;

      // Check for wildcard permission
      if (role.permissions.includes("*")) return true;

      return role.permissions.includes(permission);
    },
    [permissions.roles],
  );

  // Group permissions by category
  const permissionsByCategory = useMemo(() => {
    const grouped = {};
    permissions.permissions.forEach((perm) => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });
    return grouped;
  }, [permissions.permissions]);

  return {
    permissions: permissions.permissions,
    roles: permissions.roles,
    permissionsByCategory,
    loading,
    error,
    refetch: fetchPermissions,
    updateRolePermissions,
    hasPermission,
  };
};

// Hook for audit logs
export const useAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await controlsAPI.getAuditLogs(filters);

      if (result.success) {
        setLogs(result.data);
        setTotalCount(result.data.length);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    totalCount,
    loading,
    error,
    refetch: fetchLogs,
  };
};

// Hook for testing service connections
export const useConnectionTest = () => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState({});

  const testConnection = useCallback(async (service, config) => {
    try {
      setTesting((prev) => ({ ...prev, [service]: true }));

      const result = await controlsAPI.testConnection(service, config);

      const testResult = {
        success: result.success,
        data: result.data,
        error: result.error,
        testedAt: new Date().toISOString(),
      };

      setTestResults((prev) => ({ ...prev, [service]: testResult }));

      return testResult;
    } catch (err) {
      const testResult = {
        success: false,
        error: err.message,
        testedAt: new Date().toISOString(),
      };

      setTestResults((prev) => ({ ...prev, [service]: testResult }));

      return testResult;
    } finally {
      setTesting((prev) => ({ ...prev, [service]: false }));
    }
  }, []);

  const getTestResult = useCallback(
    (service) => {
      return testResults[service] || null;
    },
    [testResults],
  );

  const isTestingService = useCallback(
    (service) => {
      return testing[service] || false;
    },
    [testing],
  );

  const clearTestResult = useCallback((service) => {
    setTestResults((prev) => {
      const newResults = { ...prev };
      delete newResults[service];
      return newResults;
    });
  }, []);

  return {
    testConnection,
    getTestResult,
    isTestingService,
    clearTestResult,
    testResults,
    testing,
  };
};

// Helper hook for form validation
export const useSettingsValidation = (settingsSchema) => {
  const validateSetting = useCallback(
    (key, value) => {
      const schema = settingsSchema[key];
      if (!schema) return { valid: true };

      const errors = [];

      // Type validation
      if (schema.type && typeof value !== schema.type) {
        errors.push(`Expected ${schema.type}, got ${typeof value}`);
      }

      // Required validation
      if (
        schema.required &&
        (value === null || value === undefined || value === "")
      ) {
        errors.push("This field is required");
      }

      // Min/Max validation for numbers
      if (schema.type === "number" && typeof value === "number") {
        if (schema.min !== undefined && value < schema.min) {
          errors.push(`Minimum value is ${schema.min}`);
        }
        if (schema.max !== undefined && value > schema.max) {
          errors.push(`Maximum value is ${schema.max}`);
        }
      }

      // String length validation
      if (schema.type === "string" && typeof value === "string") {
        if (schema.minLength !== undefined && value.length < schema.minLength) {
          errors.push(`Minimum length is ${schema.minLength} characters`);
        }
        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
          errors.push(`Maximum length is ${schema.maxLength} characters`);
        }
      }

      // Pattern validation
      if (schema.pattern && typeof value === "string") {
        const regex = new RegExp(schema.pattern);
        if (!regex.test(value)) {
          errors.push(schema.patternMessage || "Invalid format");
        }
      }

      // Enum validation
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`Value must be one of: ${schema.enum.join(", ")}`);
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [settingsSchema],
  );

  const validateAllSettings = useCallback(
    (settings) => {
      const validationResults = {};
      let isValid = true;

      Object.keys(settings).forEach((key) => {
        const result = validateSetting(key, settings[key]);
        validationResults[key] = result;
        if (!result.valid) {
          isValid = false;
        }
      });

      return {
        valid: isValid,
        results: validationResults,
      };
    },
    [validateSetting],
  );

  return {
    validateSetting,
    validateAllSettings,
  };
};
