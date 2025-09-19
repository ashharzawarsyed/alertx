import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  BellIcon,
  UserGroupIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldExclamationIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

import {
  SettingsSection,
  ConfigForm,
  ToggleSwitch,
  SettingCard,
} from "./index";
import { useSettings } from "../hooks/useControls";

const EmergencySettings = () => {
  const { emergencySettings, updateEmergencySetting, loading } =
    useSettings("emergency");
  const [activeSection, setActiveSection] = useState("response");

  const emergencySections = [
    {
      id: "response",
      title: "Response Configuration",
      description: "Emergency response times and priorities",
      icon: ClockIcon,
      count: 8,
    },
    {
      id: "notifications",
      title: "Alert Systems",
      description: "Emergency notification and alert settings",
      icon: BellIcon,
      count: 12,
    },
    {
      id: "teams",
      title: "Response Teams",
      description: "Emergency response team configuration",
      icon: UserGroupIcon,
      count: 6,
    },
    {
      id: "protocols",
      title: "Emergency Protocols",
      description: "Standard operating procedures and workflows",
      icon: ShieldExclamationIcon,
      count: 10,
    },
  ];

  const responseConfigFields = [
    {
      key: "criticalResponseTime",
      label: "Critical Response Time (minutes)",
      type: "number",
      placeholder: "5",
      required: true,
      helperText: "Maximum response time for critical emergencies",
    },
    {
      key: "highResponseTime",
      label: "High Priority Response Time (minutes)",
      type: "number",
      placeholder: "15",
      required: true,
      helperText: "Maximum response time for high priority emergencies",
    },
    {
      key: "mediumResponseTime",
      label: "Medium Priority Response Time (minutes)",
      type: "number",
      placeholder: "30",
      required: true,
    },
    {
      key: "lowResponseTime",
      label: "Low Priority Response Time (minutes)",
      type: "number",
      placeholder: "60",
      required: true,
    },
    {
      key: "autoAssignment",
      label: "Auto-assign Nearest Available Unit",
      type: "checkbox",
      helperText: "Automatically assign the closest available emergency unit",
    },
    {
      key: "escalationEnabled",
      label: "Enable Escalation Protocols",
      type: "checkbox",
      helperText: "Automatically escalate unresponded emergencies",
    },
  ];

  const alertSystemFields = [
    {
      key: "smsAlerts",
      label: "SMS Alert Recipients",
      type: "textarea",
      placeholder: "Enter phone numbers, one per line",
      helperText: "Phone numbers to receive emergency SMS alerts",
    },
    {
      key: "emailAlerts",
      label: "Email Alert Recipients",
      type: "textarea",
      placeholder: "Enter email addresses, one per line",
      helperText: "Email addresses to receive emergency notifications",
    },
    {
      key: "alertInterval",
      label: "Re-alert Interval (minutes)",
      type: "number",
      placeholder: "5",
      helperText: "How often to re-send alerts for unacknowledged emergencies",
    },
    {
      key: "maxAlerts",
      label: "Maximum Alert Attempts",
      type: "number",
      placeholder: "5",
      helperText: "Maximum number of alert attempts before escalation",
    },
  ];

  const priorityLevels = [
    {
      level: "Critical",
      description: "Life-threatening emergencies requiring immediate response",
      color: "red",
      responseTime: emergencySettings?.criticalResponseTime || 5,
      examples: ["Cardiac arrest", "Severe trauma", "Respiratory failure"],
    },
    {
      level: "High",
      description: "Serious emergencies requiring urgent response",
      color: "orange",
      responseTime: emergencySettings?.highResponseTime || 15,
      examples: ["Chest pain", "Stroke symptoms", "Severe allergic reaction"],
    },
    {
      level: "Medium",
      description: "Moderate emergencies requiring timely response",
      color: "yellow",
      responseTime: emergencySettings?.mediumResponseTime || 30,
      examples: ["Minor injuries", "Anxiety attacks", "Non-urgent transport"],
    },
    {
      level: "Low",
      description: "Non-urgent situations requiring standard response",
      color: "green",
      responseTime: emergencySettings?.lowResponseTime || 60,
      examples: [
        "Routine checkups",
        "Medication requests",
        "Information queries",
      ],
    },
  ];

  const responseTeams = [
    {
      id: 1,
      name: "Alpha Team",
      type: "Primary Response",
      members: 12,
      status: "active",
      specialties: ["Trauma", "Cardiac", "Respiratory"],
    },
    {
      id: 2,
      name: "Bravo Team",
      type: "Secondary Response",
      members: 8,
      status: "active",
      specialties: ["Transport", "Non-critical"],
    },
    {
      id: 3,
      name: "Charlie Team",
      type: "Specialized Response",
      members: 6,
      status: "standby",
      specialties: ["Pediatric", "Psychiatric", "Hazmat"],
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      red: "bg-red-50 border-red-200 text-red-800",
      orange: "bg-orange-50 border-orange-200 text-orange-800",
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
      green: "bg-green-50 border-green-200 text-green-800",
    };
    return colors[color] || colors.green;
  };

  const renderResponseConfiguration = () => (
    <div className="space-y-6">
      {/* Priority Levels Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {priorityLevels.map((priority) => (
          <motion.div
            key={priority.level}
            className={`rounded-lg border-2 p-6 ${getColorClasses(priority.color)}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-lg font-semibold">
                {priority.level} Priority
              </h4>
              <span className="text-2xl font-bold">
                {priority.responseTime}m
              </span>
            </div>
            <p className="mb-3 text-sm">{priority.description}</p>
            <div className="space-y-1">
              <p className="text-xs font-medium">Examples:</p>
              {priority.examples.map((example, index) => (
                <span
                  key={index}
                  className="bg-opacity-50 mr-1 mb-1 inline-block rounded bg-white px-2 py-1 text-xs"
                >
                  {example}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Response Configuration Form */}
      <SettingsSection
        title="Response Time Configuration"
        description="Configure maximum response times for different emergency priorities"
        icon={ClockIcon}
      >
        <ConfigForm
          fields={responseConfigFields}
          values={emergencySettings || {}}
          onChange={updateEmergencySetting}
          onSubmit={() => {}}
          loading={loading}
        />
      </SettingsSection>
    </div>
  );

  const renderAlertSystems = () => (
    <div className="space-y-6">
      {/* Alert Toggles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingCard
          title="SMS Alerts"
          description="Send SMS notifications for emergencies"
          icon={PhoneIcon}
          rightElement={
            <ToggleSwitch
              enabled={emergencySettings?.smsEnabled || false}
              onChange={(enabled) =>
                updateEmergencySetting("smsEnabled", enabled)
              }
              variant="primary"
            />
          }
        />

        <SettingCard
          title="Email Alerts"
          description="Send email notifications for emergencies"
          icon={BellIcon}
          rightElement={
            <ToggleSwitch
              enabled={emergencySettings?.emailEnabled || false}
              onChange={(enabled) =>
                updateEmergencySetting("emailEnabled", enabled)
              }
              variant="primary"
            />
          }
        />

        <SettingCard
          title="Push Notifications"
          description="Send push notifications to mobile devices"
          icon={BellIcon}
          rightElement={
            <ToggleSwitch
              enabled={emergencySettings?.pushEnabled || false}
              onChange={(enabled) =>
                updateEmergencySetting("pushEnabled", enabled)
              }
              variant="primary"
            />
          }
        />

        <SettingCard
          title="Location Tracking"
          description="Track emergency location in real-time"
          icon={MapPinIcon}
          rightElement={
            <ToggleSwitch
              enabled={emergencySettings?.locationTracking || false}
              onChange={(enabled) =>
                updateEmergencySetting("locationTracking", enabled)
              }
              variant="warning"
            />
          }
        />
      </div>

      {/* Alert Configuration Form */}
      <SettingsSection
        title="Alert Configuration"
        description="Configure emergency alert recipients and settings"
        icon={BellIcon}
      >
        <ConfigForm
          fields={alertSystemFields}
          values={emergencySettings || {}}
          onChange={updateEmergencySetting}
          onSubmit={() => {}}
          loading={loading}
        />
      </SettingsSection>
    </div>
  );

  const renderResponseTeams = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Response Teams</h3>
          <p className="text-sm text-gray-500">
            Manage emergency response teams and their assignments
          </p>
        </div>
        <button className="flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <UserGroupIcon className="mr-2 h-4 w-4" />
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {responseTeams.map((team) => (
          <motion.div
            key={team.id}
            className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            whileHover={{ y: -2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">
                {team.name}
              </h4>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  team.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                } `}
              >
                {team.status}
              </span>
            </div>

            <div className="mb-4 space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {team.type}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Members:</span> {team.members}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Specialties:</span>
                <div className="mt-1">
                  {team.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="mr-1 mb-1 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Edit
              </button>
              <button className="flex-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                View
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {emergencySections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;

          return (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-red-200 bg-red-50 shadow-md"
                  : "border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md"
              } `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`rounded-lg p-2 ${isActive ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"} `}
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
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  {section.count}
                </span>
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
        {activeSection === "response" && renderResponseConfiguration()}
        {activeSection === "notifications" && renderAlertSystems()}
        {activeSection === "teams" && renderResponseTeams()}

        {activeSection === "protocols" && (
          <SettingsSection
            title="Emergency Protocols"
            description="Configure standard operating procedures and emergency workflows"
            icon={ShieldExclamationIcon}
          >
            <div className="text-gray-500">
              Emergency protocols configuration will be implemented...
            </div>
          </SettingsSection>
        )}
      </motion.div>
    </div>
  );
};

export default EmergencySettings;
