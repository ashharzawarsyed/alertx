import React from "react";
import { Truck, Hospital, AlertTriangle, Eye, EyeOff } from "lucide-react";
import {
  useMapsState,
  useMapsDispatch,
  MAPS_ACTIONS,
} from "../context/MapsContext";

const LayerControls = () => {
  const { ambulances, hospitals, hotspots, layerVisibility } = useMapsState();
  const dispatch = useMapsDispatch();

  const toggleLayer = (layerType) => {
    dispatch({
      type: MAPS_ACTIONS.TOGGLE_LAYER,
      payload: layerType,
    });
  };

  const layers = [
    {
      key: "ambulances",
      name: "Ambulances",
      icon: Truck,
      count: ambulances.length,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      key: "hospitals",
      name: "Hospitals",
      icon: Hospital,
      count: hospitals.length,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      key: "hotspots",
      name: "Hotspots",
      icon: AlertTriangle,
      count: hotspots.length,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="min-w-[200px] rounded-xl border border-gray-200 bg-white/90 p-4 shadow-lg backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">Map Layers</h3>
      <div className="space-y-2">
        {layers.map((layer) => {
          const IconComponent = layer.icon;
          const isVisible = layerVisibility[layer.key];

          return (
            <button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all duration-200 ${
                isVisible
                  ? `${layer.bgColor} ${layer.borderColor} ${layer.color}`
                  : "border-gray-200 bg-gray-50 text-gray-400"
              } hover:shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {layer.name} ({layer.count})
                </span>
              </div>
              {isVisible ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LayerControls;
