/**
 * Map Polyline Generator for Hospital Dashboard
 * 
 * Generates Google Maps JavaScript code for rendering polylines in WebView or HTML
 */

/**
 * Generate Google Maps Polyline JavaScript code
 * @param {Array} segments - Array of polyline segments with coordinates, colors, etc.
 * @returns {string} - JavaScript code to inject into map
 */
export function generatePolylineCode(segments) {
  if (!segments || segments.length === 0) {
    return '// No polylines to render';
  }

  let code = '// Ambulance Tracking Polylines\n';
  code += 'const polylines = [];\n\n';

  segments.forEach((segment, index) => {
    const { from, to, color, dashArray, zIndex = 100 } = segment;
    
    const coordinates = [
      { lat: from.lat, lng: from.lng },
      { lat: to.lat, lng: to.lng }
    ];

    if (dashArray) {
      // Dotted line (traversed path)
      code += `
// Dotted line segment ${index + 1}
polylines.push(new google.maps.Polyline({
  path: ${JSON.stringify(coordinates)},
  geodesic: true,
  strokeColor: '${color}',
  strokeOpacity: 0,
  strokeWeight: 4,
  icons: [{
    icon: {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      strokeWeight: 4,
      strokeColor: '${color}',
      scale: 2
    },
    offset: '0',
    repeat: '15px'
  }],
  zIndex: ${zIndex},
  map: map
}));
`;
    } else {
      // Solid line (remaining path)
      code += `
// Solid line segment ${index + 1}
polylines.push(new google.maps.Polyline({
  path: ${JSON.stringify(coordinates)},
  geodesic: true,
  strokeColor: '${color}',
  strokeOpacity: 1,
  strokeWeight: 4,
  zIndex: ${zIndex},
  map: map
}));
`;
    }
  });

  code += '\n// Polylines array available for updates\n';
  return code;
}

/**
 * Generate complete HTML map with tracking polylines
 * @param {Object} center - Center coordinates {lat, lng}
 * @param {Array} markers - Array of marker objects
 * @param {Array} segments - Tracking segments
 * @param {string} apiKey - Google Maps API key
 * @returns {string} - Complete HTML for map
 */
export function generateTrackingMapHTML(center, markers = [], segments = [], apiKey = '') {
  const polylineCode = generatePolylineCode(segments);
  
  const markersCode = markers.map((marker, index) => {
    const { position, title, icon, color = '#DC2626' } = marker;
    
    return `
new google.maps.Marker({
  position: ${JSON.stringify(position)},
  map: map,
  title: '${title || ''}',
  icon: {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 12,
    fillColor: '${color}',
    fillOpacity: 1,
    strokeColor: '#FFFFFF',
    strokeWeight: 3
  },
  zIndex: ${300 + index}
});
`;
  }).join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ambulance Tracking Map</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; }
    #map { height: 100%; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <script>
    let map;
    
    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: ${JSON.stringify(center)},
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      
      // Add markers
      ${markersCode}
      
      // Add tracking polylines
      ${polylineCode}
    }
  </script>
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap">
  </script>
</body>
</html>
`;
}
