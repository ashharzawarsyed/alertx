import React from 'react';

export interface PolylineSegment {
  coordinates: Array<{ lat: number; lng: number }>;
  color: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  zIndex?: number;
}

/**
 * Generate Google Maps Polyline code for WebView injection
 * Supports solid and dotted lines with custom colors
 */
export const generatePolylineCode = (segments: PolylineSegment[]): string => {
  if (!segments || segments.length === 0) {
    return '';
  }

  const polylinesCode = segments
    .map((segment, index) => {
      const coordinates = segment.coordinates
        .map((coord) => `{lat: ${coord.lat}, lng: ${coord.lng}}`)
        .join(',\n          ');

      const isDashed = !!segment.dashArray;
      const iconConfig = isDashed
        ? `
        icons: [{
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 2
          },
          offset: '0',
          repeat: '15px'
        }],`
        : '';

      return `
      const polyline${index} = new google.maps.Polyline({
        path: [
          ${coordinates}
        ],
        geodesic: true,
        strokeColor: '${segment.color}',
        strokeOpacity: ${isDashed ? 0 : segment.opacity || 1},
        strokeWeight: ${segment.weight || 4},
        zIndex: ${segment.zIndex || 1},${iconConfig}
      });
      polyline${index}.setMap(map);`;
    })
    .join('\n');

  return polylinesCode;
};

/**
 * MapPolyline Component (placeholder for React Native)
 * Actual rendering happens via WebView injection in CrossPlatformMap
 */
interface MapPolylineProps {
  segments: PolylineSegment[];
  onSegmentPress?: (segmentIndex: number) => void;
}

export const MapPolyline: React.FC<MapPolylineProps> = ({ segments }) => {
  // This component is mainly for type checking
  // Actual rendering is done via CrossPlatformMap's WebView
  return null;
};

export default MapPolyline;
