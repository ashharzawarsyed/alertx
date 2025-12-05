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
    // SVG icon generator for Font Awesome-style icons
    function createMarkerIcon(iconName, color) {
      let iconPath = '';
      let viewBox = '0 0 512 512';
      
      switch(iconName) {
        case 'ambulance':
          // Ambulance icon path
          iconPath = 'M0 256C0 185.3 57.31 128 128 128H192V80C192 53.49 213.5 32 240 32H448C483.3 32 512 60.65 512 96V256C512 326.7 454.7 384 384 384H352C352 437 309 480 256 480C202.1 480 160 437 160 384H128C57.31 384 0 326.7 0 256zM256 432C282.5 432 304 410.5 304 384C304 357.5 282.5 336 256 336C229.5 336 208 357.5 208 384C208 410.5 229.5 432 256 432zM384 384C410.5 384 432 362.5 432 336C432 309.5 410.5 288 384 288C357.5 288 336 309.5 336 336C336 362.5 357.5 384 384 384zM208 256H176V224C176 210.7 165.3 200 152 200C138.7 200 128 210.7 128 224V256H96C82.75 256 72 266.7 72 280C72 293.3 82.75 304 96 304H128V336C128 349.3 138.7 360 152 360C165.3 360 176 349.3 176 336V304H208C221.3 304 232 293.3 232 280C232 266.7 221.3 256 208 256z';
          break;
        case 'user-injured':
          // User injured icon path
          iconPath = 'M240 96C258.2 96 274.6 102.4 288 112.5V88C288 57.07 313.1 32 344 32H368C398.9 32 424 57.07 424 88V112.5C437.4 102.4 453.8 96 472 96C508.4 96 538.9 121.6 546.4 155.8C549.7 170.7 544.7 186.1 533.1 196.7L492.7 233.9C507.8 245.7 520 261.9 526.8 280.9L574.6 408.9C586.3 437.2 573.7 469.9 545.4 481.6C517.2 493.3 484.5 480.7 472.8 452.4L456.6 414.1L422.5 422C410.9 424.9 398.1 422.4 388.8 414.5L320 355.4L251.2 414.5C241 422.4 229.1 424.9 217.5 422L183.4 414.1L167.2 452.4C155.5 480.7 122.8 493.3 94.58 481.6C66.35 469.9 53.75 437.2 65.45 408.9L113.2 280.9C119.1 261.9 132.2 245.7 147.3 233.9L106.9 196.7C95.33 186.1 90.33 170.7 93.6 155.8C101.1 121.6 131.6 96 168 96C186.2 96 202.6 102.4 216 112.5V88C216 57.07 241.1 32 272 32H296C326.9 32 352 57.07 352 88V112.5C365.4 102.4 381.8 96 400 96C436.4 96 466.9 121.6 474.4 155.8C477.7 170.7 472.7 186.1 461.1 196.7L420.7 233.9C435.8 245.7 448 261.9 454.8 280.9L502.6 408.9C514.3 437.2 501.7 469.9 473.4 481.6C445.2 493.3 412.5 480.7 400.8 452.4L384.6 414.1L350.5 422C338.9 424.9 326.1 422.4 316.8 414.5L248 355.4L179.2 414.5C169 422.4 157.1 424.9 145.5 422L111.4 414.1L95.23 452.4C83.53 480.7 50.82 493.3 22.58 481.6C-5.648 469.9 -18.25 437.2 -6.551 408.9L41.23 280.9C48.01 261.9 60.16 245.7 75.32 233.9L34.87 196.7C23.33 186.1 18.33 170.7 21.6 155.8C29.09 121.6 59.59 96 96 96C114.2 96 130.6 102.4 144 112.5V88C144 57.07 169.1 32 200 32H224C254.9 32 280 57.07 280 88V112.5C293.4 102.4 309.8 96 328 96z';
          viewBox = '0 0 512 512';
          break;
        case 'hospital':
          // Hospital icon path
          iconPath = 'M224 96V256H64V96H224zM64 32C28.7 32 0 60.7 0 96V256c0 35.3 28.7 64 64 64H224c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM448 96V256H288V96H448zM288 32c-35.3 0-64 28.7-64 64V256c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H288zM400 96c13.3 0 24 10.7 24 24v48h48c13.3 0 24 10.7 24 24s-10.7 24-24 24H424v48c0 13.3-10.7 24-24 24s-24-10.7-24-24V216H328c-13.3 0-24-10.7-24-24s10.7-24 24-24h48V120c0-13.3 10.7-24 24-24z';
          break;
        default:
          // Circle fallback
          iconPath = 'M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z';
      }
      
      const svg = \`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="\${viewBox}" width="32" height="32">
          <path fill="\${color}" d="\${iconPath}" stroke="#fff" stroke-width="20"/>
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
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
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
