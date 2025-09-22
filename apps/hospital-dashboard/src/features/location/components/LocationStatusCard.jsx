import { ArrowRight, X } from "phosphor-react";
import React from "react";

import { Alert, Button, Card } from "../../../shared/components/ui";

/**
 * Presentational component for displaying location status and actions
 */
const LocationStatusCard = ({
  locationError,
  manualEntry,
  loading,
  onToggleManualEntry,
  onNext,
  children,
}) => {
  return (
    <Card className="space-y-4">
      {locationError && (
        <Alert variant="error" className="mb-4">
          <strong>Location Error:</strong> {locationError}
        </Alert>
      )}

      {children}

      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          onClick={onToggleManualEntry}
          variant="outline"
          className="flex items-center"
        >
          {manualEntry ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel Manual Entry
            </>
          ) : (
            "Enter Manually"
          )}
        </Button>

        {onNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={loading}
            className="flex items-center"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default LocationStatusCard;
