import React from "react";
import { Platform, View, StyleSheet, Text } from "react-native";

// Conditionally import react-native-maps
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

// Try to import react-native-maps for native platforms
if (Platform.OS !== "web") {
  try {
    const ReactNativeMaps = require("react-native-maps");
    MapView = ReactNativeMaps.default || ReactNativeMaps;
    Marker = ReactNativeMaps.Marker;
    PROVIDER_GOOGLE = ReactNativeMaps.PROVIDER_GOOGLE;
  } catch (error) {
    console.warn("react-native-maps not available:", error);
  }
}

// Fallback Marker component for web and when maps aren't available
const FallbackMarker: React.FC<any> = () => null;

export interface MapMarker {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
  icon?: React.ReactNode;
}

export interface CrossPlatformMapProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: MapMarker[];
  style?: any;
  onMapReady?: () => void;
  children?: React.ReactNode;
}

const CrossPlatformMap = React.forwardRef<any, CrossPlatformMapProps>(
  ({ initialRegion, markers = [], style, onMapReady, children }, ref) => {
    if (Platform.OS === "web") {
      // Web: Show a simple placeholder or use a web-compatible map
      return (
        <View style={[styles.webMapContainer, style]}>
          <iframe
            src={`https://maps.google.com/maps?q=${initialRegion.latitude},${initialRegion.longitude}&z=14&output=embed`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            loading="lazy"
          />
        </View>
      );
    }

    // Mobile: Use react-native-maps if available
    if (!MapView) {
      return (
        <View style={[styles.fallbackContainer, style]}>
          <Text style={styles.fallbackText}>
            Map view not available. Please install react-native-maps.
          </Text>
        </View>
      );
    }

    return (
      <MapView
        ref={ref}
        provider={PROVIDER_GOOGLE}
        style={style}
        initialRegion={initialRegion}
        onMapReady={onMapReady}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color}
          >
            {marker.icon}
          </Marker>
        ))}
        {children}
      </MapView>
    );
  }
);

CrossPlatformMap.displayName = "CrossPlatformMap";

const styles = StyleSheet.create({
  webMapContainer: {
    flex: 1,
    overflow: "hidden",
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  fallbackText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

// Export the appropriate Marker component
const ExportedMarker = Marker || FallbackMarker;

export { MapView, ExportedMarker as Marker, PROVIDER_GOOGLE };
export default CrossPlatformMap;
