import React, { useState } from "react";
import { Platform, View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

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
  polylineCode?: string;
  style?: any;
  onMapReady?: () => void;
  children?: React.ReactNode;
}

const CrossPlatformMap = React.forwardRef<any, CrossPlatformMapProps>(
  ({ initialRegion, markers = [], polylineCode = '', style, onMapReady }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    
    // Get Google Maps API key from env
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || Constants.expoConfig?.extra?.googleMapsApiKey || "";

    // Build markers parameter for Google Maps Static API
    const markerParams = markers
      .map(
        (marker, index) =>
          `markers=color:${marker.color || "red"}%7Clabel:${index + 1}%7C${marker.latitude},${marker.longitude}`
      )
      .join("&");

    // Generate HTML for interactive Google Maps using WebView
    const generateMapHTML = () => {
      const markersJS = markers
        .map(
          (marker, index) => `
        {
          position: { lat: ${marker.latitude}, lng: ${marker.longitude} },
          title: "${marker.title || `Marker ${index + 1}`}",
          label: "${index + 1}"
        }`
        )
        .join(",");

      return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { height: 100%; width: 100%; }
  </style>
  <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
</head>
<body>
  <div id="map"></div>
  <script>
    function initMap() {
      try {
        console.log('🗺️ Initializing map...');
        const center = { lat: ${initialRegion.latitude}, lng: ${initialRegion.longitude} };
        const map = new google.maps.Map(document.getElementById("map"), {
          center: center,
          zoom: ${Math.round(Math.log2(360 / initialRegion.latitudeDelta))},
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
        });

        console.log('🗺️ Map created successfully');

        // Add markers
        const markers = [${markersJS}];
        markers.forEach((markerData) => {
          new google.maps.Marker({
            position: markerData.position,
            map: map,
            title: markerData.title,
            label: markerData.label,
          });
        });

        // Center marker (current location)
        new google.maps.Marker({
          position: center,
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#10b981",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        
        // Add polylines if provided
        ${polylineCode}
        
        console.log('\ud83d\uddfa\ufe0f Markers added successfully');
        window.ReactNativeWebView?.postMessage('map-loaded');
      } catch (error) {
        console.error('❌ Map initialization error:', error);
        window.ReactNativeWebView?.postMessage('map-error:' + error.message);
      }
    }
    
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      console.error('❌ Global error:', msg);
      window.ReactNativeWebView?.postMessage('error:' + msg);
      return false;
    };
  </script>
</body>
</html>
      `;
    };

    // Use WebView for interactive map
    return (
      <View style={[{ flex: 1 }, style]}>
        <WebView
          ref={ref}
          source={{ html: generateMapHTML() }}
          style={{ flex: 1 }}
          onLoadEnd={() => {
            console.log('✅ Map WebView loaded');
            setIsLoading(false);
            onMapReady?.();
          }}
          onError={(error) => {
            console.error("❌ Map WebView error:", error);
            setIsLoading(false);
          }}
          onMessage={(event) => {
            const msg = event.nativeEvent.data;
            console.log('📨 Map message:', msg);
            if (msg.startsWith('map-error:')) {
              console.error('❌ Map error:', msg.replace('map-error:', ''));
            } else if (msg === 'map-loaded') {
              console.log('✅ Map initialized successfully');
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EF4444" />
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          )}
        />
        {!GOOGLE_MAPS_API_KEY && (
          <View style={styles.warningOverlay}>
            <Text style={styles.warningText}>
              ⚠️ Add Google Maps API key to .env file
            </Text>
          </View>
        )}
      </View>
    );
  }
);

CrossPlatformMap.displayName = "CrossPlatformMap";

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  warningOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F59E0B",
  },
  warningText: {
    fontSize: 12,
    color: "#92400E",
    textAlign: "center",
    fontWeight: "600",
  },
});

// Dummy exports for compatibility
const DummyMarker: React.FC<any> = () => null;

export { CrossPlatformMap as MapView, DummyMarker as Marker };
export const PROVIDER_GOOGLE = null;
export default CrossPlatformMap;
