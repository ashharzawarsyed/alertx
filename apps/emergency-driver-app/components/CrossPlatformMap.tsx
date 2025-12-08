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
    const webViewRef = useRef<any>(null);
    const prevMarkersRef = useRef<MapMarker[]>([]);
    
    // Get Google Maps API key from env
    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || Constants.expoConfig?.extra?.googleMapsApiKey || "";

    // Create stable markers key to prevent unnecessary re-renders
    const markersKey = useMemo(() => 
      JSON.stringify(markers.map(m => `${m.latitude},${m.longitude},${m.icon}`)),
      [markers]
    );

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
    // SVG icon generator with improved compact icons
    function createMarkerIcon(iconName, color) {
      let svg = '';
      
      switch(iconName) {
        case 'ambulance':
          svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20">
            <circle cx="16" cy="16" r="15" fill="\${color}" stroke="white" stroke-width="2"/>
            <path d="M16 10v12M10 16h12" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M19 12h2l2 3h-4z" fill="white"/>
          </svg>\`;
          break;
        case 'user-injured':
        case 'patient':
          svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18">
            <circle cx="16" cy="16" r="15" fill="\${color}" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="12" r="3" fill="white"/>
            <path d="M11 20c0-2.5 2-4 5-4s5 1.5 5 4v2H11z" fill="white"/>
          </svg>\`;
          break;
        case 'hospital':
          svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="15" fill="\${color}" stroke="white" stroke-width="2"/>
            <path d="M16 10v12M10 16h12" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>\`;
          break;
        case 'pickup-point':
          svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16">
            <circle cx="16" cy="16" r="14" fill="\${color}" stroke="white" stroke-width="2.5" opacity="0.7"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>\`;
          break;
        default:
          svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="18" height="18">
            <circle cx="16" cy="16" r="14" fill="\${color}" stroke="white" stroke-width="2"/>
          </svg>\`;
      }
      
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
    }, [markersKey, polylineCode, GOOGLE_MAPS_API_KEY]); // Only regenerate when these change

    // Update markers dynamically without reloading entire map
    React.useEffect(() => {
      if (hasInitialized.current && webViewRef.current) {
        const markersChanged = JSON.stringify(prevMarkersRef.current) !== JSON.stringify(markers);
        if (markersChanged) {
          const markersJS = JSON.stringify(markers.map(m => ({
            lat: m.latitude,
            lng: m.longitude,
            title: m.title,
            color: m.color || '#dc2626',
            icon: m.icon || 'circle'
          })));
          
          webViewRef.current.injectJavaScript(`
            if (window.updateMarkers) {
              window.updateMarkers(${markersJS});
            }
            true;
          `);
          prevMarkersRef.current = markers;
        }
      }
    }, [markers]);

    // Use WebView for interactive map
    return (
      <View style={[{ flex: 1 }, style]}>
        <WebView
          ref={(r) => {
            webViewRef.current = r;
            if (typeof ref === 'function') ref(r);
            else if (ref) ref.current = r;
          }}
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
