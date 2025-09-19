/**
 * Controls & Settings API Service
 * Handles all administrative settings and controls for the emergency alert system
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const API_ENDPOINTS = {
  systemSettings: "/admin/settings/system",
  userSettings: "/admin/settings/users",
  emergencySettings: "/admin/settings/emergency",
  notificationSettings: "/admin/settings/notifications",
  securitySettings: "/admin/settings/security",
  fleetSettings: "/admin/settings/fleet",
  integrationSettings: "/admin/settings/integrations",
  reportSettings: "/admin/settings/reports",
  permissions: "/admin/permissions",
  auditLogs: "/admin/audit-logs",
};

// Mock data for development
const generateMockSettings = () => {
  return {
    system: {
      id: "system_config",
      name: "System Configuration",
      settings: {
        apiTimeout: 30000,
        maxConcurrentRequests: 100,
        emergencyResponseTime: 300, // 5 minutes in seconds
        systemMaintenanceMode: false,
        debugMode: false,
        logLevel: "info",
        dataRetentionDays: 90,
        backupFrequency: "daily",
        healthCheckInterval: 60,
      },
      lastModified: "2024-01-20T10:30:00Z",
      modifiedBy: "admin@alertx.com",
    },
    users: {
      id: "user_management",
      name: "User Management",
      settings: {
        maxUsers: 1000,
        sessionTimeout: 3600, // 1 hour
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        accountLockoutAttempts: 5,
        accountLockoutDuration: 1800, // 30 minutes
        twoFactorRequired: false,
        emailVerificationRequired: true,
        defaultUserRole: "user",
      },
      lastModified: "2024-01-19T14:20:00Z",
      modifiedBy: "admin@alertx.com",
    },
    emergency: {
      id: "emergency_config",
      name: "Emergency Response",
      settings: {
        autoDispatchEnabled: true,
        emergencyPriorityLevels: ["low", "medium", "high", "critical"],
        responseTimeTargets: {
          critical: 180, // 3 minutes
          high: 300, // 5 minutes
          medium: 600, // 10 minutes
          low: 1200, // 20 minutes
        },
        escalationEnabled: true,
        escalationTimeouts: {
          level1: 300, // 5 minutes
          level2: 600, // 10 minutes
          level3: 900, // 15 minutes
        },
        geoFencingEnabled: true,
        geoFenceRadius: 50000, // 50km in meters
        emergencyContactLimit: 5,
      },
      lastModified: "2024-01-18T16:45:00Z",
      modifiedBy: "admin@alertx.com",
    },
    notifications: {
      id: "notification_config",
      name: "Notification Settings",
      settings: {
        smsEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        voiceCallEnabled: false,
        emergencyBroadcastEnabled: true,
        smsProvider: "twilio",
        emailProvider: "sendgrid",
        pushProvider: "firebase",
        templateCustomization: true,
        deliveryRetryAttempts: 3,
        deliveryTimeout: 30000,
        batchNotificationLimit: 1000,
        rateLimitPerMinute: 100,
      },
      lastModified: "2024-01-17T09:15:00Z",
      modifiedBy: "admin@alertx.com",
    },
    security: {
      id: "security_config",
      name: "Security Settings",
      settings: {
        jwtExpirationTime: 86400, // 24 hours
        refreshTokenExpiration: 604800, // 7 days
        corsEnabled: true,
        corsOrigins: ["https://alertx.com", "https://dashboard.alertx.com"],
        rateLimitingEnabled: true,
        rateLimitRequests: 1000,
        rateLimitWindow: 3600, // 1 hour
        encryptionEnabled: true,
        encryptionAlgorithm: "AES-256-GCM",
        auditLoggingEnabled: true,
        failedLoginThreshold: 5,
        ipWhitelistEnabled: false,
        ipWhitelist: [],
      },
      lastModified: "2024-01-16T11:30:00Z",
      modifiedBy: "admin@alertx.com",
    },
    fleet: {
      id: "fleet_config",
      name: "Fleet Management",
      settings: {
        realTimeTrackingEnabled: true,
        trackingInterval: 30000, // 30 seconds
        geofencingEnabled: true,
        driverStatusUpdateInterval: 60000, // 1 minute
        ambulanceCapacityTracking: true,
        maintenanceAlertsEnabled: true,
        fuelTrackingEnabled: true,
        routeOptimizationEnabled: true,
        emergencyOverrideEnabled: true,
        maxDriverShiftHours: 12,
        driverBreakRequirements: true,
        vehicleInspectionReminders: true,
      },
      lastModified: "2024-01-15T13:20:00Z",
      modifiedBy: "admin@alertx.com",
    },
    integrations: {
      id: "integration_config",
      name: "Third-party Integrations",
      settings: {
        googleMapsEnabled: true,
        googleMapsApiKey: "AIza***hidden***",
        twilioEnabled: true,
        twilioAccountSid: "AC***hidden***",
        sendgridEnabled: true,
        sendgridApiKey: "SG.***hidden***",
        firebaseEnabled: true,
        firebaseProjectId: "alertx-***hidden***",
        webhooksEnabled: true,
        webhookEndpoints: [
          {
            name: "Emergency Created",
            url: "https://api.partner.com/emergency/created",
            events: ["emergency.created"],
            active: true,
          },
          {
            name: "Driver Assigned",
            url: "https://api.partner.com/driver/assigned",
            events: ["driver.assigned"],
            active: true,
          },
        ],
        apiVersioning: "v1",
        apiDocumentationEnabled: true,
      },
      lastModified: "2024-01-14T08:45:00Z",
      modifiedBy: "admin@alertx.com",
    },
    reports: {
      id: "report_config",
      name: "Reports & Analytics",
      settings: {
        analyticsEnabled: true,
        dataRetentionPeriod: 365, // days
        reportGenerationEnabled: true,
        scheduledReportsEnabled: true,
        exportFormats: ["pdf", "excel", "csv"],
        realtimeDashboard: true,
        performanceMetrics: true,
        customReportsEnabled: true,
        dataAnonymization: false,
        complianceReporting: true,
        auditTrailEnabled: true,
        reportCacheEnabled: true,
        reportCacheDuration: 3600, // 1 hour
      },
      lastModified: "2024-01-13T15:10:00Z",
      modifiedBy: "admin@alertx.com",
    },
  };
};

// Mock permissions data
const generateMockPermissions = () => {
  return {
    roles: [
      {
        id: "super_admin",
        name: "Super Administrator",
        description: "Full system access with all permissions",
        permissions: ["*"], // Wildcard for all permissions
        userCount: 2,
        isSystemRole: true,
      },
      {
        id: "admin",
        name: "Administrator",
        description: "Administrative access with most permissions",
        permissions: [
          "users.read",
          "users.write",
          "users.delete",
          "emergencies.read",
          "emergencies.write",
          "emergencies.manage",
          "drivers.read",
          "drivers.write",
          "drivers.approve",
          "settings.read",
          "settings.write",
          "reports.read",
          "reports.generate",
        ],
        userCount: 5,
        isSystemRole: true,
      },
      {
        id: "dispatcher",
        name: "Emergency Dispatcher",
        description: "Can manage emergencies and dispatch ambulances",
        permissions: [
          "emergencies.read",
          "emergencies.write",
          "emergencies.dispatch",
          "drivers.read",
          "drivers.assign",
          "ambulances.read",
          "ambulances.track",
          "reports.read",
        ],
        userCount: 15,
        isSystemRole: false,
      },
      {
        id: "supervisor",
        name: "Supervisor",
        description: "Can oversee operations and generate reports",
        permissions: [
          "emergencies.read",
          "drivers.read",
          "ambulances.read",
          "reports.read",
          "reports.generate",
          "users.read",
        ],
        userCount: 8,
        isSystemRole: false,
      },
      {
        id: "driver",
        name: "Ambulance Driver",
        description: "Limited access for ambulance drivers",
        permissions: [
          "emergencies.read",
          "driver.profile.read",
          "driver.profile.write",
          "driver.status.update",
          "driver.location.update",
        ],
        userCount: 45,
        isSystemRole: true,
      },
    ],
    permissions: [
      { id: "users.read", name: "View Users", category: "User Management" },
      {
        id: "users.write",
        name: "Create/Edit Users",
        category: "User Management",
      },
      { id: "users.delete", name: "Delete Users", category: "User Management" },
      {
        id: "emergencies.read",
        name: "View Emergencies",
        category: "Emergency Management",
      },
      {
        id: "emergencies.write",
        name: "Create/Edit Emergencies",
        category: "Emergency Management",
      },
      {
        id: "emergencies.manage",
        name: "Manage Emergency Status",
        category: "Emergency Management",
      },
      {
        id: "emergencies.dispatch",
        name: "Dispatch Ambulances",
        category: "Emergency Management",
      },
      {
        id: "drivers.read",
        name: "View Drivers",
        category: "Driver Management",
      },
      {
        id: "drivers.write",
        name: "Create/Edit Drivers",
        category: "Driver Management",
      },
      {
        id: "drivers.approve",
        name: "Approve/Reject Drivers",
        category: "Driver Management",
      },
      {
        id: "drivers.assign",
        name: "Assign Drivers",
        category: "Driver Management",
      },
      {
        id: "ambulances.read",
        name: "View Ambulances",
        category: "Fleet Management",
      },
      {
        id: "ambulances.track",
        name: "Track Ambulances",
        category: "Fleet Management",
      },
      {
        id: "settings.read",
        name: "View Settings",
        category: "System Administration",
      },
      {
        id: "settings.write",
        name: "Modify Settings",
        category: "System Administration",
      },
      {
        id: "reports.read",
        name: "View Reports",
        category: "Reports & Analytics",
      },
      {
        id: "reports.generate",
        name: "Generate Reports",
        category: "Reports & Analytics",
      },
      {
        id: "driver.profile.read",
        name: "View Own Profile",
        category: "Driver Self-Service",
      },
      {
        id: "driver.profile.write",
        name: "Edit Own Profile",
        category: "Driver Self-Service",
      },
      {
        id: "driver.status.update",
        name: "Update Own Status",
        category: "Driver Self-Service",
      },
      {
        id: "driver.location.update",
        name: "Update Own Location",
        category: "Driver Self-Service",
      },
    ],
  };
};

// Utility function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Network request failed");
  }
};

// Controls API Service
export const controlsAPI = {
  // Get all settings
  getAllSettings: async () => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const mockSettings = generateMockSettings();
        return { success: true, data: mockSettings };
      }

      const result = await apiCall("/admin/settings");
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get specific setting category
  getSettings: async (category) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const mockSettings = generateMockSettings();
        const categorySettings = mockSettings[category];

        if (!categorySettings) {
          throw new Error(`Settings category '${category}' not found`);
        }

        return { success: true, data: categorySettings };
      }

      const endpoint = API_ENDPOINTS[`${category}Settings`];
      if (!endpoint) {
        throw new Error(`Invalid settings category: ${category}`);
      }

      const result = await apiCall(endpoint);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update settings
  updateSettings: async (category, settings) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Simulate validation
        if (!category || !settings) {
          throw new Error("Category and settings are required");
        }

        // Simulate updated response
        const updatedSettings = {
          id: `${category}_config`,
          name:
            category.charAt(0).toUpperCase() + category.slice(1) + " Settings",
          settings: settings,
          lastModified: new Date().toISOString(),
          modifiedBy: "admin@alertx.com",
        };

        return { success: true, data: updatedSettings };
      }

      const endpoint = API_ENDPOINTS[`${category}Settings`];
      if (!endpoint) {
        throw new Error(`Invalid settings category: ${category}`);
      }

      const result = await apiCall(endpoint, {
        method: "PUT",
        body: JSON.stringify({ settings }),
      });

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get permissions and roles
  getPermissions: async () => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockPermissions = generateMockPermissions();
        return { success: true, data: mockPermissions };
      }

      const result = await apiCall(API_ENDPOINTS.permissions);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update role permissions
  updateRolePermissions: async (roleId, permissions) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const updatedRole = {
          id: roleId,
          permissions: permissions,
          lastModified: new Date().toISOString(),
          modifiedBy: "admin@alertx.com",
        };

        return { success: true, data: updatedRole };
      }

      const result = await apiCall(
        `${API_ENDPOINTS.permissions}/roles/${roleId}`,
        {
          method: "PUT",
          body: JSON.stringify({ permissions }),
        },
      );

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get audit logs
  getAuditLogs: async (filters = {}) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 600));

        // Mock audit logs
        const mockLogs = [
          {
            id: "audit_001",
            timestamp: "2024-01-20T10:30:00Z",
            user: "admin@alertx.com",
            action: "settings.update",
            resource: "system.emergencyResponseTime",
            oldValue: "600",
            newValue: "300",
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0...",
            success: true,
          },
          {
            id: "audit_002",
            timestamp: "2024-01-20T09:15:00Z",
            user: "supervisor@alertx.com",
            action: "driver.approve",
            resource: "driver.USR005",
            oldValue: "pending",
            newValue: "approved",
            ipAddress: "192.168.1.101",
            userAgent: "Mozilla/5.0...",
            success: true,
          },
        ];

        return { success: true, data: mockLogs };
      }

      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.auditLogs}${queryParams ? `?${queryParams}` : ""}`;
      const result = await apiCall(endpoint);
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Test API connection
  testConnection: async (service, config) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulate connection test
        const success = Math.random() > 0.2; // 80% success rate

        if (success) {
          return {
            success: true,
            data: {
              service,
              status: "connected",
              responseTime: Math.floor(Math.random() * 200) + 50,
              lastTested: new Date().toISOString(),
            },
          };
        } else {
          throw new Error(
            `Failed to connect to ${service}. Please check your configuration.`,
          );
        }
      }

      const result = await apiCall("/admin/test-connection", {
        method: "POST",
        body: JSON.stringify({ service, config }),
      });

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset settings to default
  resetToDefaults: async (category) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const defaultSettings = generateMockSettings();
        const categoryDefaults = defaultSettings[category];

        if (!categoryDefaults) {
          throw new Error(`Settings category '${category}' not found`);
        }

        return { success: true, data: categoryDefaults };
      }

      const endpoint = API_ENDPOINTS[`${category}Settings`];
      const result = await apiCall(`${endpoint}/reset`, {
        method: "POST",
      });

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Export settings
  exportSettings: async (categories = []) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const allSettings = generateMockSettings();
        const exportData =
          categories.length > 0
            ? Object.fromEntries(
                categories.map((cat) => [cat, allSettings[cat]]),
              )
            : allSettings;

        return {
          success: true,
          data: {
            settings: exportData,
            exportedAt: new Date().toISOString(),
            version: "1.0.0",
          },
        };
      }

      const result = await apiCall("/admin/settings/export", {
        method: "POST",
        body: JSON.stringify({ categories }),
      });

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Import settings
  importSettings: async (settingsData) => {
    try {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Simulate import validation
        if (!settingsData || typeof settingsData !== "object") {
          throw new Error("Invalid settings data format");
        }

        return {
          success: true,
          data: {
            importedCategories: Object.keys(settingsData),
            importedAt: new Date().toISOString(),
            importedBy: "admin@alertx.com",
          },
        };
      }

      const result = await apiCall("/admin/settings/import", {
        method: "POST",
        body: JSON.stringify({ settings: settingsData }),
      });

      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

// Named exports for specific setting categories
export const systemAPI = {
  get: () => controlsAPI.getSettings("system"),
  update: (settings) => controlsAPI.updateSettings("system", settings),
  reset: () => controlsAPI.resetToDefaults("system"),
};

export const securityAPI = {
  get: () => controlsAPI.getSettings("security"),
  update: (settings) => controlsAPI.updateSettings("security", settings),
  reset: () => controlsAPI.resetToDefaults("security"),
};

export const notificationAPI = {
  get: () => controlsAPI.getSettings("notifications"),
  update: (settings) => controlsAPI.updateSettings("notifications", settings),
  reset: () => controlsAPI.resetToDefaults("notifications"),
  test: (config) => controlsAPI.testConnection("notifications", config),
};

export default controlsAPI;
