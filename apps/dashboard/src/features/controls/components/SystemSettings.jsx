import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ServerIcon,
  CircleStackIcon,
  CogIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import {
  SettingsSection,
  ConfigForm,
  ToggleSwitch,
  SettingCard,
} from "./index";
import { useSettings } from "../hooks/useControls";

const SystemSettings = () => {
  const {
    systemSettings,
    updateSystemSetting,
    loading,
    saveSystemSettings,
    resetSystemSettings,
  } = useSettings("system");

  const [activeSection, setActiveSection] = useState("server");

  // Server Configuration Fields
  const serverConfigFields = [
    {
      key: "serverName",
      label: "Server Name",
      type: "text",
      placeholder: "Enter server name",
      required: true,
      helperText: "Friendly name for this server instance",
    },
    {
      key: "serverPort",
      label: "Server Port",
      type: "number",
      placeholder: "3000",
      required: true,
      helperText: "Port number for the application server",
    },
    {
      key: "environment",
      label: "Environment",
      type: "select",
      options: [
        { value: "development", label: "Development" },
        { value: "staging", label: "Staging" },
        { value: "production", label: "Production" },
      ],
      required: true,
    },
    {
      key: "debugMode",
      label: "Debug Mode",
      type: "checkbox",
      helperText: "Enable detailed logging and error reporting",
    },
  ];

  // Database Configuration Fields
  const databaseConfigFields = [
    {
      key: "databaseHost",
      label: "Database Host",
      type: "text",
      placeholder: "localhost",
      required: true,
    },
    {
      key: "databasePort",
      label: "Database Port",
      type: "number",
      placeholder: "5432",
      required: true,
    },
    {
      key: "databaseName",
      label: "Database Name",
      type: "text",
      placeholder: "alertx_db",
      required: true,
    },
    {
      key: "connectionPoolSize",
      label: "Connection Pool Size",
      type: "number",
      placeholder: "10",
      helperText: "Maximum number of database connections",
    },
    {
      key: "enableSsl",
      label: "Enable SSL",
      type: "checkbox",
      helperText: "Use SSL for database connections",
    },
  ];

  // Timezone and Localization Fields
  const localizationFields = [
    {
      key: "timezone",
      label: "Default Timezone",
      type: "select",
      options: [
        { value: "UTC", label: "UTC" },
        { value: "America/New_York", label: "Eastern Time" },
        { value: "America/Chicago", label: "Central Time" },
        { value: "America/Denver", label: "Mountain Time" },
        { value: "America/Los_Angeles", label: "Pacific Time" },
      ],
      required: true,
    },
    {
      key: "dateFormat",
      label: "Date Format",
      type: "select",
      options: [
        { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
        { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
        { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
      ],
      required: true,
    },
    {
      key: "timeFormat",
      label: "Time Format",
      type: "select",
      options: [
        { value: "12h", label: "12 Hour" },
        { value: "24h", label: "24 Hour" },
      ],
      required: true,
    },
    {
      key: "language",
      label: "Default Language",
      type: "select",
      options: [
        { value: "en", label: "English" },
        { value: "es", label: "Spanish" },
        { value: "fr", label: "French" },
      ],
      required: true,
    },
  ];

  const systemSections = [
    {
      id: "server",
      title: "Server Configuration",
      description: "Basic server and application settings",
      icon: ServerIcon,
      color: "blue",
    },
    {
      id: "database",
      title: "Database Configuration",
      description: "Database connection and performance settings",
      icon: CircleStackIcon,
      color: "green",
    },
    {
      id: "localization",
      title: "Timezone & Localization",
      description: "Regional settings and time zone configuration",
      icon: GlobeAltIcon,
      color: "purple",
    },
    {
      id: "maintenance",
      title: "Maintenance & Backup",
      description: "System maintenance and backup settings",
      icon: ShieldCheckIcon,
      color: "orange",
    },
  ];

  const handleSettingChange = (key, value) => {
    updateSystemSetting(key, value);
  };

  const handleFormSubmit = async (values) => {
    await saveSystemSettings(values);
  };

  const handleFormReset = () => {
    resetSystemSettings();
  };

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingCard
          title="Auto Backup"
          description="Automatically backup database daily"
          icon={CircleStackIcon}
          rightElement={
            <ToggleSwitch
              enabled={systemSettings?.autoBackup || false}
              onChange={(enabled) => handleSettingChange("autoBackup", enabled)}
              variant="success"
            />
          }
        />

        <SettingCard
          title="Maintenance Mode"
          description="Enable maintenance mode for updates"
          icon={CogIcon}
          rightElement={
            <ToggleSwitch
              enabled={systemSettings?.maintenanceMode || false}
              onChange={(enabled) =>
                handleSettingChange("maintenanceMode", enabled)
              }
              variant="warning"
            />
          }
        />
      </div>

      <ConfigForm
        title="Backup Configuration"
        fields={[
          {
            key: "backupRetentionDays",
            label: "Backup Retention (Days)",
            type: "number",
            placeholder: "30",
            helperText: "Number of days to keep backup files",
          },
          {
            key: "backupLocation",
            label: "Backup Location",
            type: "text",
            placeholder: "/backups",
            helperText: "Directory path for backup storage",
          },
        ]}
        values={systemSettings || {}}
        onChange={handleSettingChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        loading={loading}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemSections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;

          return (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-blue-200 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md"
              } `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`rounded-lg p-2 ${isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"} `}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {section.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {section.description}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Section Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeSection === "server" && (
          <SettingsSection
            title="Server Configuration"
            description="Configure basic server and application settings"
            icon={ServerIcon}
          >
            <ConfigForm
              fields={serverConfigFields}
              values={systemSettings || {}}
              onChange={handleSettingChange}
              onSubmit={handleFormSubmit}
              onReset={handleFormReset}
              loading={loading}
            />
          </SettingsSection>
        )}

        {activeSection === "database" && (
          <SettingsSection
            title="Database Configuration"
            description="Configure database connection and performance settings"
            icon={CircleStackIcon}
          >
            <ConfigForm
              fields={databaseConfigFields}
              values={systemSettings || {}}
              onChange={handleSettingChange}
              onSubmit={handleFormSubmit}
              onReset={handleFormReset}
              loading={loading}
            />
          </SettingsSection>
        )}

        {activeSection === "localization" && (
          <SettingsSection
            title="Timezone & Localization"
            description="Configure regional settings and time zone"
            icon={GlobeAltIcon}
          >
            <ConfigForm
              fields={localizationFields}
              values={systemSettings || {}}
              onChange={handleSettingChange}
              onSubmit={handleFormSubmit}
              onReset={handleFormReset}
              loading={loading}
            />
          </SettingsSection>
        )}

        {activeSection === "maintenance" && (
          <SettingsSection
            title="Maintenance & Backup"
            description="Configure system maintenance and backup settings"
            icon={ShieldCheckIcon}
          >
            {renderMaintenanceSettings()}
          </SettingsSection>
        )}
      </motion.div>
    </div>
  );
};

export default SystemSettings;
