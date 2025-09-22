import { MapPin } from "phosphor-react";
import React from "react";

import { Button, Input } from "../../../shared/components/ui";

/**
 * Presentational component for manual address entry
 */
const AddressInput = ({
  address,
  onAddressChange,
  onSubmit,
  loading,
  disabled = false,
}) => {
  const handleSubmit = () => {
    if (onSubmit && address.trim()) {
      onSubmit(address);
    }
  };

  return (
    <div>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Input
            id="hospital-address"
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Enter hospital address"
            icon={MapPin}
            disabled={disabled}
          />
        </div>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !address.trim() || disabled}
          isLoading={loading}
          className="whitespace-nowrap"
        >
          {loading ? "Locating..." : "Get Location"}
        </Button>
      </div>
    </div>
  );
};

export default AddressInput;
