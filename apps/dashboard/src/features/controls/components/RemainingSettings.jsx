import React from "react";
import {
  BellIcon,
  ShieldCheckIcon,
  TruckIcon,
  PuzzlePieceIcon,
  DocumentChartBarIcon,
} from "@heroicons/react/24/outline";
import { SettingsSection, ToggleSwitch, SettingCard } from "./index";

// Notification Settings Component
export const NotificationSettings = () => (
  <div className="space-y-6">
    <SettingsSection
      title="Notification Preferences"
      description="Configure how and when notifications are sent"
      icon={BellIcon}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingCard
          title="Email Notifications"
          description="Receive notifications via email"
          icon={BellIcon}
          rightElement={<ToggleSwitch enabled={true} onChange={() => {}} />}
        />
        <SettingCard
          title="SMS Notifications"
          description="Receive notifications via SMS"
          icon={BellIcon}
          rightElement={<ToggleSwitch enabled={false} onChange={() => {}} />}
        />
        <SettingCard
          title="Push Notifications"
          description="Receive push notifications on mobile"
          icon={BellIcon}
          rightElement={<ToggleSwitch enabled={true} onChange={() => {}} />}
        />
        <SettingCard
          title="Desktop Notifications"
          description="Show desktop notifications"
          icon={BellIcon}
          rightElement={<ToggleSwitch enabled={true} onChange={() => {}} />}
        />
      </div>
    </SettingsSection>
  </div>
);

// Security Settings Component
export const SecuritySettings = () => (
  <div className="space-y-6">
    <SettingsSection
      title="Security Configuration"
      description="Configure security policies and authentication"
      icon={ShieldCheckIcon}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingCard
          title="Two-Factor Authentication"
          description="Require 2FA for all users"
          icon={ShieldCheckIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="success"
            />
          }
        />
        <SettingCard
          title="Session Timeout"
          description="Auto-logout after inactivity"
          icon={ShieldCheckIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="warning"
            />
          }
        />
        <SettingCard
          title="IP Whitelist"
          description="Restrict access to specific IP addresses"
          icon={ShieldCheckIcon}
          rightElement={
            <ToggleSwitch
              enabled={false}
              onChange={() => {}}
              variant="danger"
            />
          }
        />
        <SettingCard
          title="Audit Logging"
          description="Log all user actions and system events"
          icon={ShieldCheckIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="success"
            />
          }
        />
      </div>
    </SettingsSection>
  </div>
);

// Fleet Settings Component
export const FleetSettings = () => (
  <div className="space-y-6">
    <SettingsSection
      title="Fleet Management"
      description="Configure vehicle and driver settings"
      icon={TruckIcon}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingCard
          title="GPS Tracking"
          description="Track vehicle locations in real-time"
          icon={TruckIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="primary"
            />
          }
        />
        <SettingCard
          title="Route Optimization"
          description="Automatically optimize routes"
          icon={TruckIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="success"
            />
          }
        />
        <SettingCard
          title="Maintenance Alerts"
          description="Alert when vehicles need maintenance"
          icon={TruckIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="warning"
            />
          }
        />
        <SettingCard
          title="Driver Performance"
          description="Monitor driver performance metrics"
          icon={TruckIcon}
          rightElement={<ToggleSwitch enabled={false} onChange={() => {}} />}
        />
      </div>
    </SettingsSection>
  </div>
);

// Integration Settings Component
export const IntegrationSettings = () => (
  <div className="space-y-6">
    <SettingsSection
      title="Third-Party Integrations"
      description="Configure external service integrations"
      icon={PuzzlePieceIcon}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingCard
          title="Google Maps API"
          description="Enable Google Maps integration"
          icon={PuzzlePieceIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="success"
            />
          }
        />
        <SettingCard
          title="Twilio SMS"
          description="SMS notifications via Twilio"
          icon={PuzzlePieceIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="primary"
            />
          }
        />
        <SettingCard
          title="Slack Integration"
          description="Send alerts to Slack channels"
          icon={PuzzlePieceIcon}
          rightElement={<ToggleSwitch enabled={false} onChange={() => {}} />}
        />
        <SettingCard
          title="Webhook Notifications"
          description="Send data to external webhooks"
          icon={PuzzlePieceIcon}
          rightElement={<ToggleSwitch enabled={false} onChange={() => {}} />}
        />
      </div>
    </SettingsSection>
  </div>
);

// Report Settings Component
export const ReportSettings = () => (
  <div className="space-y-6">
    <SettingsSection
      title="Reporting & Analytics"
      description="Configure reports and analytics settings"
      icon={DocumentChartBarIcon}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SettingCard
          title="Auto-Generated Reports"
          description="Automatically generate daily reports"
          icon={DocumentChartBarIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="success"
            />
          }
        />
        <SettingCard
          title="Performance Metrics"
          description="Track system performance metrics"
          icon={DocumentChartBarIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="primary"
            />
          }
        />
        <SettingCard
          title="Custom Dashboard"
          description="Enable custom dashboard widgets"
          icon={DocumentChartBarIcon}
          rightElement={<ToggleSwitch enabled={false} onChange={() => {}} />}
        />
        <SettingCard
          title="Data Export"
          description="Allow data export to CSV/PDF"
          icon={DocumentChartBarIcon}
          rightElement={
            <ToggleSwitch
              enabled={true}
              onChange={() => {}}
              variant="warning"
            />
          }
        />
      </div>
    </SettingsSection>
  </div>
);
