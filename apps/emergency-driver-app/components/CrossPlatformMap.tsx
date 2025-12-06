import React, { useState, useMemo, useRef } from "react";
import { Platform, View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";

export interface MapMarker {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
  icon?: string; // Font Awesome icon name: 'ambulance', 'user-injured', 'hospital'
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
    const hasInitialized = useRef(false);
    
    // Get Google Maps API key from env
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || Constants.expoConfig?.extra?.googleMapsApiKey || "";

    // Build markers parameter for Google Maps Static API
    const markerParams = markers
      .map(
        (marker, index) =>
          `markers=color:${marker.color || "red"}%7Clabel:${index + 1}%7C${marker.latitude},${marker.longitude}`
      )
      .join("&");

    // Generate HTML for interactive Google Maps using WebView - Memoized to prevent re-renders
    const mapHTML = useMemo(() => {
      const markersJS = markers
        .map(
          (marker, index) => `
        {
          position: { lat: ${marker.latitude}, lng: ${marker.longitude} },
          title: "${marker.title || `Marker ${index + 1}`}",
          color: "${marker.color || '#dc2626'}",
          icon: "${marker.icon || 'circle'}"
        }`
        )
        .join(",");

      return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { height: 100%; width: 100%; }
  </style>
  <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
</head>
<body>
  <div id="map"></div>
  <script>
    // SVG icon generator with improved icons
    function createMarkerIcon(iconName, color) {
      let iconPath = '';
      let viewBox = '0 0 24 24';
      
      switch(iconName) {
        case 'ambulance':
          // Simplified ambulance icon
          iconPath = 'M18 18.5C18 19.33 17.33 20 16.5 20S15 19.33 15 18.5 15.67 17 16.5 17 18 17.67 18 18.5M19.5 9.5L21.46 12H17V9.5H19.5M6 18.5C6 19.33 5.33 20 4.5 20S3 19.33 3 18.5 3.67 17 4.5 17 6 17.67 6 18.5M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20S9 18.66 9 17H15C15 18.66 16.34 20 18 20S21 18.66 21 17H23V12L20 8M8 13H5V10H8V13Z';
          break;
        case 'user-injured':
          // Person with medical cross
          iconPath = 'M12 2C13.1 2 14 2.9 14 4S13.1 6 12 6 10 5.1 10 4 10.9 2 12 2M15.89 8.11C15.5 7.72 14.83 7 13.53 7H10.47C9.17 7 8.5 7.72 8.11 8.11C7.86 8.36 7.73 8.69 7.73 9.03V20C7.73 21.1 8.63 22 9.73 22S11.73 21.1 11.73 20V16H12.27V20C12.27 21.1 13.17 22 14.27 22S16.27 21.1 16.27 20V9.03C16.27 8.69 16.14 8.36 15.89 8.11M17 2V5H19V7H17V10H15V7H13V5H15V2H17Z';
          break;
        case 'hospital':
          // Hospital building with cross
          iconPath = 'M2 22V6L12 2L22 6V22H14V17H10V22H2M12 8C12.55 8 13 8.45 13 9V10H14C14.55 10 15 10.45 15 11C15 11.55 14.55 12 14 12H13V13C13 13.55 12.55 14 12 14C11.45 14 11 13.55 11 13V12H10C9.45 12 9 11.55 9 11C9 10.45 9.45 10 10 10H11V9C11 8.45 11.45 8 12 8Z';
          break;
        default:
          // Circle fallback
          iconPath = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z';
      }
      
      const svg = \`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="\${viewBox}" width="28" height="28">
          <path fill="\${color}" d="\${iconPath}" stroke="#fff" stroke-width="1.5"/>
        </svg>
      \`;
      
      return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }
    
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

        // Add custom markers with Font Awesome-style icons
        const markers = [${markersJS}];
        markers.forEach((markerData) => {
          new google.maps.Marker({
            position: markerData.position,
            map: map,
            title: markerData.title,
            icon: {
              url: createMarkerIcon(markerData.icon, markerData.color),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            },
          });
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
    }, [initialRegion, markers, polylineCode, GOOGLE_MAPS_API_KEY]); // Only regenerate when these change

    // Use WebView for interactive map
    return (
      <View style={[{ flex: 1 }, style]}>
        <WebView
          ref={ref}
          source={{ html: mapHTML }}
          style={{ flex: 1 }}
          onLoadEnd={() => {
            if (!hasInitialized.current) {
              console.log('✅ Map WebView loaded');
              hasInitialized.current = true;
              setIsLoading(false);
              onMapReady?.();
            }
          }}
          onError={(error) => {
            console.error("❌ Map WebView error:", error);
            setIsLoading(false);
          }}
          onMessage={(event) => {
            const msg = event.nativeEvent.data;
            if (msg.startsWith('map-error:')) {
              console.error('❌ Map error:', msg.replace('map-error:', ''));
            } else if (msg === 'map-loaded') {
              // Only log once when first loaded
              if (!hasInitialized.current) {
                console.log('✅ Map initialized successfully');
              }
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
