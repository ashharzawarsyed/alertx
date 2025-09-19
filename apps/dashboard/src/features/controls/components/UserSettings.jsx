import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UsersIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  KeyIcon,
  AdjustmentsHorizontalIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

import {
  SettingsSection,
  ConfigForm,
  ToggleSwitch,
  SettingCard,
} from "./index";
import AdminApprovals from "./AdminApprovals";
import { useSettings } from "../hooks/useControls";

const UserSettings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const getQuery = useCallback(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const initialTab = getQuery().get("tab") || "pending";
  const { userSettings, updateUserSetting, loading } = useSettings("users");
  const [activeSection, setActiveSection] = useState(initialTab);
  const [showCreateUser, setShowCreateUser] = useState(false);

  // Sync activeSection with tab param
  useEffect(() => {
    const tab = getQuery().get("tab");
    if (tab && tab !== activeSection) {
      setActiveSection(tab);
    }
  }, [location.search, activeSection, getQuery]);

  // When section changes, update tab param in URL
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    const params = new URLSearchParams(location.search);
    params.set("tab", sectionId);
    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true },
    );
  };

  // Mock user data
  const users = [
    {
      id: 1,
      name: "John Admin",
      email: "john@alertx.com",
      role: "Administrator",
      status: "active",
      lastLogin: "2024-01-15T10:30:00Z",
      avatar: null,
    },
    {
      id: 2,
      name: "Sarah Manager",
      email: "sarah@alertx.com",
      role: "Manager",
      status: "active",
      lastLogin: "2024-01-15T09:15:00Z",
      avatar: null,
    },
    {
      id: 3,
      name: "Mike Operator",
      email: "mike@alertx.com",
      role: "Operator",
      status: "inactive",
      lastLogin: "2024-01-10T14:22:00Z",
      avatar: null,
    },
  ];

  const userSections = [
    {
      id: "pending",
      title: "Pending Approvals",
      description: "Review and approve admin account requests",
      icon: UserPlusIcon,
      count: 0, // Will be updated with real data
      priority: true,
    },
    {
      id: "accounts",
      title: "User Accounts",
      description: "Manage user accounts and basic information",
      icon: UsersIcon,
      count: users.length,
    },
    {
      id: "roles",
      title: "Roles & Permissions",
      description: "Configure user roles and access permissions",
      icon: ShieldCheckIcon,
      count: 4,
    },
    {
      id: "authentication",
      title: "Authentication",
      description: "Configure login settings and security",
      icon: KeyIcon,
      count: 6,
    },
    {
      id: "preferences",
      title: "User Preferences",
      description: "Default user settings and preferences",
      icon: AdjustmentsHorizontalIcon,
      count: 8,
    },
  ];

  const createUserFields = [
    {
      key: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter first name",
    },
    {
      key: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Enter last name",
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      required: true,
      placeholder: "user@example.com",
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      required: true,
      options: [
        { value: "administrator", label: "Administrator" },
        { value: "manager", label: "Manager" },
        { value: "operator", label: "Operator" },
        { value: "viewer", label: "Viewer" },
      ],
    },
    {
      key: "sendWelcomeEmail",
      label: "Send Welcome Email",
      type: "checkbox",
      helperText: "Send login credentials and welcome information",
    },
  ];

  const authSettingsFields = [
    {
      key: "sessionTimeout",
      label: "Session Timeout (minutes)",
      type: "number",
      placeholder: "60",
      helperText: "Automatic logout after inactivity",
    },
    {
      key: "maxLoginAttempts",
      label: "Max Login Attempts",
      type: "number",
      placeholder: "5",
      helperText: "Lock account after failed attempts",
    },
    {
      key: "passwordMinLength",
      label: "Minimum Password Length",
      type: "number",
      placeholder: "8",
    },
    {
      key: "requireTwoFactor",
      label: "Require Two-Factor Authentication",
      type: "checkbox",
      helperText: "Mandatory 2FA for all users",
    },
    {
      key: "allowSocialLogin",
      label: "Allow Social Login",
      type: "checkbox",
      helperText: "Enable Google/Microsoft login",
    },
  ];

  const handleUserAction = (action, userData) => {
    // Handle user actions like view, edit, delete
    // eslint-disable-next-line no-unused-vars
    const userId = userData.id;

    switch (action) {
      case "view":
        // Show user details
        break;
      case "edit":
        // Open edit form
        break;
      case "delete":
        // Show delete confirmation
        break;
      default:
        break;
    }
  };

  const renderUserAccounts = () => (
    <div className="space-y-6">
      {/* Create User Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">User Accounts</h3>
          <p className="text-sm text-gray-500">
            Manage user accounts and access
          </p>
        </div>
        <button
          onClick={() => setShowCreateUser(true)}
          className="flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlusIcon className="mr-2 h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Users List */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              All Users ({users.length})
            </h4>
            <div className="flex items-center space-x-2">
              <select className="rounded-md border-gray-300 text-sm">
                <option>All Roles</option>
                <option>Administrator</option>
                <option>Manager</option>
                <option>Operator</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <motion.div
              key={user.id}
              className="px-6 py-4 hover:bg-gray-50"
              whileHover={{ backgroundColor: "#f9fafb" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        } `}
                      >
                        {user.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Role: {user.role} • Last login:{" "}
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUserAction("view", user)}
                    className="rounded p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleUserAction("edit", user)}
                    className="rounded p-2 text-gray-400 hover:bg-green-50 hover:text-green-600"
                    title="Edit User"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleUserAction("delete", user)}
                    className="rounded p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete User"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create User Form */}
      {showCreateUser && (
        <SettingsSection
          title="Create New User"
          description="Add a new user to the system"
          icon={UserPlusIcon}
        >
          <ConfigForm
            fields={createUserFields}
            values={{}}
            onChange={() => {}}
            onSubmit={() => setShowCreateUser(false)}
            onReset={() => setShowCreateUser(false)}
            loading={loading}
          />
        </SettingsSection>
      )}
    </div>
  );

  const renderRolesPermissions = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Roles */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="mb-4 text-lg font-medium text-gray-900">
            System Roles
          </h4>
          <div className="space-y-3">
            {["Administrator", "Manager", "Operator", "Viewer"].map((role) => (
              <SettingCard
                key={role}
                title={role}
                description={`${role.toLowerCase()} permissions and access`}
                icon={ShieldCheckIcon}
                onClick={() => {
                  // Configure role permissions
                }}
              />
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="mb-4 text-lg font-medium text-gray-900">
            Permission Categories
          </h4>
          <div className="space-y-4">
            {[
              {
                name: "Emergency Management",
                description: "Create, update, close emergencies",
              },
              {
                name: "User Management",
                description: "Manage user accounts and roles",
              },
              {
                name: "Fleet Management",
                description: "Manage vehicles and drivers",
              },
              {
                name: "System Configuration",
                description: "Access system settings",
              },
              {
                name: "Reports & Analytics",
                description: "View and generate reports",
              },
            ].map((permission) => (
              <div
                key={permission.name}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {permission.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {permission.description}
                  </div>
                </div>
                <ToggleSwitch enabled={true} onChange={() => {}} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userSections.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              onClick={() => handleSectionChange(section.id)}
              className={`rounded-lg border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-green-200 bg-green-50 shadow-md"
                  : "border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:shadow-md"
              } `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`rounded-lg p-2 ${isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"} `}
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
        {activeSection === "pending" && <AdminApprovals />}

        {activeSection === "accounts" && renderUserAccounts()}

        {activeSection === "roles" && renderRolesPermissions()}

        {activeSection === "authentication" && (
          <SettingsSection
            title="Authentication Settings"
            description="Configure login security and authentication methods"
            icon={KeyIcon}
          >
            <ConfigForm
              fields={authSettingsFields}
              values={userSettings || {}}
              onChange={updateUserSetting}
              onSubmit={() => {}}
              loading={loading}
            />
          </SettingsSection>
        )}

        {activeSection === "preferences" && (
          <SettingsSection
            title="User Preferences"
            description="Configure default user settings and preferences"
            icon={AdjustmentsHorizontalIcon}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SettingCard
                title="Email Notifications"
                description="Send email notifications to users"
                rightElement={
                  <ToggleSwitch
                    enabled={userSettings?.emailNotifications || false}
                    onChange={(enabled) =>
                      updateUserSetting("emailNotifications", enabled)
                    }
                  />
                }
              />
              <SettingCard
                title="Dark Mode Default"
                description="Enable dark mode by default for new users"
                rightElement={
                  <ToggleSwitch
                    enabled={userSettings?.darkModeDefault || false}
                    onChange={(enabled) =>
                      updateUserSetting("darkModeDefault", enabled)
                    }
                  />
                }
              />
            </div>
          </SettingsSection>
        )}
      </motion.div>
    </div>
  );
};

export default UserSettings;
