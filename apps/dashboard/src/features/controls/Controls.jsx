import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CogIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ShieldCheckIcon,
  TruckIcon,
  PuzzlePieceIcon,
  DocumentChartBarIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import SystemSettings from "./components/SystemSettings";
import UserSettings from "./components/UserSettings";
import EmergencySettings from "./components/EmergencySettings";
import {
  NotificationSettings,
  SecuritySettings,
  FleetSettings,
  IntegrationSettings,
  ReportSettings,
} from "./components/RemainingSettings";

import {
  exportSettingsToJSON,
  exportSettingsToCSV,
  importSettingsFromFile,
  validateSettingsData,
} from "./utils/exportImport";

const Controls = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Helper to get query params
  const getQuery = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
  // Set initial tab from query param, fallback to 'system'
  const initialTab = getQuery().get("section") || "system";
  const [activeTab, setActiveTab] = useState(initialTab);
  // Sync activeTab with URL query param changes
  useEffect(() => {
    const section = getQuery().get("section");
    if (section && section !== activeTab) {
      setActiveTab(section);
    }
  }, [location.search, activeTab, getQuery]);

  // When tab changes, update URL query param
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(location.search);
    params.set("section", tabId);
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true },
    );
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Mock settings data for export/import
  const mockSettings = {
    system: {
      serverName: "AlertX Production",
      serverPort: 3000,
      environment: "production",
      debugMode: false,
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
    },
    users: {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireTwoFactor: true,
      emailNotifications: true,
    },
    emergency: {
      criticalResponseTime: 5,
      highResponseTime: 15,
      mediumResponseTime: 30,
      lowResponseTime: 60,
      autoAssignment: true,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: true,
      auditLogging: true,
    },
  };

  const handleExportJSON = () => {
    exportSettingsToJSON(mockSettings);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportSettingsToCSV(mockSettings);
    setShowExportMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setImportStatus({ type: "loading", message: "Importing settings..." });

      const result = await importSettingsFromFile(file);
      const validation = validateSettingsData(result.data);

      if (validation.isValid) {
        setImportStatus({
          type: "success",
          message: `Settings imported successfully! ${validation.warnings.length > 0 ? `${validation.warnings.length} warnings found.` : ""}`,
        });
        // Here you would actually apply the imported settings
      } else {
        setImportStatus({
          type: "error",
          message: `Import failed: ${validation.errors.join(", ")}`,
        });
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `Import failed: ${error.message}`,
      });
    }

    // Clear the file input
    event.target.value = "";

    // Clear status after 5 seconds
    setTimeout(() => setImportStatus(null), 5000);
  };

  const controlCategories = [
    {
      id: "system",
      name: "System",
      description: "Server configuration and general settings",
      icon: CogIcon,
      color: "blue",
      count: 12,
    },
    {
      id: "users",
      name: "Users",
      description: "User management and permissions",
      icon: UsersIcon,
      color: "green",
      count: 8,
    },
    {
      id: "emergency",
      name: "Emergency",
      description: "Emergency response configuration",
      icon: ExclamationTriangleIcon,
      color: "red",
      count: 15,
    },
    {
      id: "notifications",
      name: "Notifications",
      description: "Alert and notification settings",
      icon: BellIcon,
      color: "yellow",
      count: 6,
    },
    {
      id: "security",
      name: "Security",
      description: "Security and authentication settings",
      icon: ShieldCheckIcon,
      color: "purple",
      count: 10,
    },
    {
      id: "fleet",
      name: "Fleet",
      description: "Vehicle and driver management",
      icon: TruckIcon,
      color: "indigo",
      count: 7,
    },
    {
      id: "integrations",
      name: "Integrations",
      description: "Third-party integrations and APIs",
      icon: PuzzlePieceIcon,
      color: "pink",
      count: 4,
    },
    {
      id: "reports",
      name: "Reports",
      description: "Reporting and analytics configuration",
      icon: DocumentChartBarIcon,
      color: "orange",
      count: 9,
    },
  ];

  const getColorClasses = (color, active = false) => {
    const colors = {
      blue: {
        bg: active ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-blue-50",
        icon: "bg-blue-100 text-blue-600",
        badge: "bg-blue-100 text-blue-800",
      },
      green: {
        bg: active
          ? "bg-green-50 border-green-200"
          : "bg-white hover:bg-green-50",
        icon: "bg-green-100 text-green-600",
        badge: "bg-green-100 text-green-800",
      },
      red: {
        bg: active ? "bg-red-50 border-red-200" : "bg-white hover:bg-red-50",
        icon: "bg-red-100 text-red-600",
        badge: "bg-red-100 text-red-800",
      },
      yellow: {
        bg: active
          ? "bg-yellow-50 border-yellow-200"
          : "bg-white hover:bg-yellow-50",
        icon: "bg-yellow-100 text-yellow-600",
        badge: "bg-yellow-100 text-yellow-800",
      },
      purple: {
        bg: active
          ? "bg-purple-50 border-purple-200"
          : "bg-white hover:bg-purple-50",
        icon: "bg-purple-100 text-purple-600",
        badge: "bg-purple-100 text-purple-800",
      },
      indigo: {
        bg: active
          ? "bg-indigo-50 border-indigo-200"
          : "bg-white hover:bg-indigo-50",
        icon: "bg-indigo-100 text-indigo-600",
        badge: "bg-indigo-100 text-indigo-800",
      },
      pink: {
        bg: active ? "bg-pink-50 border-pink-200" : "bg-white hover:bg-pink-50",
        icon: "bg-pink-100 text-pink-600",
        badge: "bg-pink-100 text-pink-800",
      },
      orange: {
        bg: active
          ? "bg-orange-50 border-orange-200"
          : "bg-white hover:bg-orange-50",
        icon: "bg-orange-100 text-orange-600",
        badge: "bg-orange-100 text-orange-800",
      },
    };
    return colors[color] || colors.blue;
  };

  const activeCategory = controlCategories.find((cat) => cat.id === activeTab);

  const filteredCategories = controlCategories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Controls & Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage system configuration and administrative settings
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Import Status */}
              {importStatus && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium ${importStatus.type === "success" ? "bg-green-100 text-green-800" : ""} ${importStatus.type === "error" ? "bg-red-100 text-red-800" : ""} ${importStatus.type === "loading" ? "bg-blue-100 text-blue-800" : ""} `}
                >
                  {importStatus.type === "success" && (
                    <CheckCircleIcon className="mr-2 h-4 w-4" />
                  )}
                  {importStatus.type === "error" && (
                    <ExclamationCircleIcon className="mr-2 h-4 w-4" />
                  )}
                  {importStatus.type === "loading" && (
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {importStatus.message}
                </motion.div>
              )}

              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                  Export Settings
                </button>

                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black"
                  >
                    <div className="py-1">
                      <button
                        onClick={handleExportJSON}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export as JSON
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export as CSV
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleImportClick}
                className="flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
                Import Settings
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 pl-10 leading-5 placeholder-gray-500 focus:border-blue-500 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="min-h-screen w-80 border-r border-gray-200 bg-white">
          <div className="p-6">
            <div className="space-y-2">
              {filteredCategories.map((category) => {
                const isActive = activeTab === category.id;
                const colorClasses = getColorClasses(category.color, isActive);
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    onClick={() => handleTabChange(category.id)}
                    className={`w-full rounded-lg border p-4 text-left transition-all duration-200 ${colorClasses.bg} ${isActive ? "shadow-md" : "shadow-sm hover:shadow-md"} `}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`rounded-lg p-2 ${colorClasses.icon}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {category.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.description}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${colorClasses.badge}`}
                      >
                        {category.count}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeCategory && (
                <div className="mb-6">
                  <div className="mb-2 flex items-center space-x-3">
                    <div
                      className={`rounded-lg p-3 ${getColorClasses(activeCategory.color).icon}`}
                    >
                      <activeCategory.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {activeCategory.name} Settings
                      </h2>
                      <p className="text-sm text-gray-500">
                        {activeCategory.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Content */}
              <div className="space-y-6">
                {activeTab === "system" && <SystemSettings />}
                {activeTab === "users" && <UserSettings />}
                {activeTab === "emergency" && <EmergencySettings />}
                {activeTab === "notifications" && <NotificationSettings />}
                {activeTab === "security" && <SecuritySettings />}
                {activeTab === "fleet" && <FleetSettings />}
                {activeTab === "integrations" && <IntegrationSettings />}
                {activeTab === "reports" && <ReportSettings />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Controls;
