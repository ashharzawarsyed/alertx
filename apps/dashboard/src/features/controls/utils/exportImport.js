// Utility functions for exporting and importing settings

export const exportSettingsToJSON = (settings) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0.0",
    settings: settings,
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `alertx-settings-${new Date().toISOString().split("T")[0]}.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};

export const exportSettingsToCSV = (settings) => {
  const csvRows = [];
  csvRows.push(["Category", "Setting", "Value", "Description"]);

  Object.entries(settings).forEach(([category, categorySettings]) => {
    Object.entries(categorySettings).forEach(([key, value]) => {
      csvRows.push([
        category,
        key,
        typeof value === "object" ? JSON.stringify(value) : value,
        "", // Description could be added from schema
      ]);
    });
  });

  const csvContent = csvRows
    .map((row) =>
      row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `alertx-settings-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.click();
};

export const importSettingsFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target.result;

        if (file.name.endsWith(".json")) {
          const importedData = JSON.parse(content);

          // Validate the imported data structure
          if (
            importedData.settings &&
            typeof importedData.settings === "object"
          ) {
            resolve({
              success: true,
              data: importedData.settings,
              metadata: {
                exportedAt: importedData.exportedAt,
                version: importedData.version,
              },
            });
          } else {
            reject(
              new Error("Invalid JSON structure. Expected settings object."),
            );
          }
        } else if (file.name.endsWith(".csv")) {
          // Simple CSV parsing for settings
          const lines = content.split("\n");
          // Skip headers line - we know the format
          const settings = {};

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(",").map((v) => v.replace(/"/g, ""));
            if (values.length >= 3) {
              const [category, setting, value] = values;
              if (!settings[category]) {
                settings[category] = {};
              }

              // Try to parse JSON values, otherwise use as string
              try {
                settings[category][setting] = JSON.parse(value);
              } catch {
                settings[category][setting] = value;
              }
            }
          }

          resolve({
            success: true,
            data: settings,
            metadata: {
              importedAt: new Date().toISOString(),
              format: "csv",
            },
          });
        } else {
          reject(
            new Error("Unsupported file format. Please use JSON or CSV files."),
          );
        }
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

export const validateSettingsData = (settings) => {
  const errors = [];
  const warnings = [];

  // Basic validation rules
  const requiredCategories = [
    "system",
    "users",
    "emergency",
    "notifications",
    "security",
  ];

  requiredCategories.forEach((category) => {
    if (!settings[category]) {
      warnings.push(`Missing ${category} settings category`);
    }
  });

  // Validate specific settings
  if (settings.system) {
    if (
      settings.system.serverPort &&
      (settings.system.serverPort < 1000 || settings.system.serverPort > 65535)
    ) {
      errors.push("Server port must be between 1000 and 65535");
    }

    if (
      settings.system.environment &&
      !["development", "staging", "production"].includes(
        settings.system.environment,
      )
    ) {
      errors.push("Environment must be development, staging, or production");
    }
  }

  if (settings.emergency) {
    const responseTimeFields = [
      "criticalResponseTime",
      "highResponseTime",
      "mediumResponseTime",
      "lowResponseTime",
    ];
    responseTimeFields.forEach((field) => {
      if (
        settings.emergency[field] &&
        (settings.emergency[field] < 1 || settings.emergency[field] > 1440)
      ) {
        errors.push(`${field} must be between 1 and 1440 minutes`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const generateSettingsBackup = (settings) => {
  return {
    ...settings,
    _backup: {
      createdAt: new Date().toISOString(),
      version: "1.0.0",
      checksum: btoa(JSON.stringify(settings)),
    },
  };
};

export const restoreFromBackup = (backupData) => {
  if (!backupData._backup) {
    throw new Error("Invalid backup data - missing backup metadata");
  }

  const { _backup, ...settings } = backupData;

  // Verify checksum
  const currentChecksum = btoa(JSON.stringify(settings));
  if (currentChecksum !== _backup.checksum) {
    throw new Error(
      "Backup data integrity check failed - data may be corrupted",
    );
  }

  return {
    settings,
    metadata: _backup,
  };
};
