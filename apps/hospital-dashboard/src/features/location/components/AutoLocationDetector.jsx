import { NavigationArrow } from "phosphor-react";
import React from "react";

import { Button, Card } from "../../../shared/components/ui";

/**
 * Presentational component for auto-location detection
 */
const AutoLocationDetector = ({ onAutoDetect, loading, disabled = false }) => {
  return (
    <Card
      className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"
      padding="md"
    >
      <Button
        type="button"
        onClick={onAutoDetect}
        disabled={loading || disabled}
        isLoading={loading}
        variant="success"
        className="inline-flex items-center"
      >
        <NavigationArrow className="w-5 h-5 mr-2" />
        {loading ? "Detecting Location..." : "Auto-Detect Location"}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        Uses your device&apos;s GPS to detect current location
      </p>
    </Card>
  );
};

export default AutoLocationDetector;
