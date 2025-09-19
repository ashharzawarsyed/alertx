# AlertX Maps Feature

A comprehensive real-time healthcare control tower for monitoring ambulances, hospitals, and emergency hotspots.

## Features

### 🚑 Ambulance Tracking

- **Real-time positioning** with custom ambulance icons
- **Pulsing animations** behind each ambulance marker
- **Dynamic status updates** (On Route, Idle, Busy)
- **ETA countdown** updates every 5 seconds
- **Live route visualization** with animated polylines
- **Crew information** with avatars and roles

### 🏥 Hospital Monitoring

- **Capacity indicators** with color-coded status (Green: beds available, Red: full)
- **Bed availability tracking** (General + ICU beds)
- **Occupancy percentage** calculations
- **Incoming emergency count**
- **Real-time status** (Online/Offline)
- **Hospital actions** (Approve transfers, Block admissions, View dashboard)

### 🔥 Emergency Hotspots

- **Heatmap visualization** with semi-transparent glowing circles
- **Emergency concentration areas** with live counts
- **Resource allocation suggestions**
- **Nearby hospital recommendations**
- **Dispatch coordination tools**

### 🗺️ Interactive Map

- **Dark theme** using Carto Dark tiles for professional healthcare look
- **Layer toggles** to show/hide ambulances, hospitals, and hotspots
- **Glassmorphism sidebar** with smooth animations
- **Dynamic content** updates when clicking any entity
- **Responsive design** for all screen sizes

## Technology Stack

- **React** - Component architecture
- **React Leaflet** - Interactive maps
- **Leaflet** - Core mapping library
- **Framer Motion** - Smooth animations
- **TailwindCSS** - Modern styling
- **Lucide React** - Healthcare icons

## Data Structure

### Ambulance Object

```javascript
{
  id: "AMB123",
  status: "On Route" | "Idle" | "Busy",
  eta: 12, // minutes
  coords: [latitude, longitude],
  route: [[lat1, lng1], [lat2, lng2]], // polyline coordinates
  crew: [
    {
      name: "Erin Vaccaro",
      role: "Nurse" | "Paramedic" | "Driver",
      avatar: "image_url"
    }
  ]
}
```

### Hospital Object

```javascript
{
  id: "HOSP42",
  name: "City General Hospital",
  address: "123 Medical Center Dr, New York, NY",
  coords: [latitude, longitude],
  beds: {
    available: 12,
    icu: 2,
    total: 50,
    icuTotal: 10
  },
  status: "Online" | "Offline",
  incomingEmergencies: 3
}
```

### Hotspot Object

```javascript
{
  id: "HS1",
  coords: [latitude, longitude],
  emergencies: 14,
  radius: 500 // meters
}
```

## Animations

- **Pulsing ambulance markers** - CSS keyframe animation with 2s duration
- **Sidebar slide transitions** - Framer Motion with spring physics
- **Live ETA updates** - 5-second intervals with smooth number transitions
- **Route polylines** - Dashed animation effect
- **Hotspot fade-in/out** - Opacity transitions when toggling layers

## Usage

1. **Navigate to Maps** - Click the Maps icon in the sidebar
2. **Toggle Layers** - Use the layer controls in the top-left to show/hide entities
3. **Click Entities** - Click any ambulance, hospital, or hotspot to view details
4. **View Details** - The sidebar will slide in with comprehensive information
5. **Take Actions** - Use action buttons in the sidebar for operations

## Real-time Features

- **ETA Countdown** - Updates every 5 seconds for active ambulances
- **Live Positioning** - Mock data simulation for ambulance movement
- **Dynamic Status** - Real-time status changes for all entities
- **Capacity Updates** - Hospital bed availability changes

## Customization

### Adding New Entities

1. Add to mock data arrays (`mockAmbulances`, `mockHospitals`, `mockHotspots`)
2. Implement real API integration by replacing mock data with API calls
3. Add new entity types by creating custom icons and detail components

### Styling

- **Dark Theme** - Configured for healthcare professional environment
- **Glassmorphism** - Semi-transparent cards with backdrop blur
- **Healthcare Colors** - Blue/green gradients for medical branding
- **Responsive Design** - Mobile-first approach with TailwindCSS

## Future Enhancements

- **Real-time WebSocket** integration for live data
- **Historical tracking** with playback controls
- **Weather overlay** for emergency planning
- **Traffic integration** for route optimization
- **Emergency alerts** with sound notifications
- **Multi-language support** for international deployment

## Performance

- **Optimized rendering** with React.memo where appropriate
- **Efficient updates** using state management
- **Lazy loading** for large datasets
- **Memory management** for long-running sessions

This Maps feature provides a comprehensive real-time view of the entire emergency healthcare system, enabling administrators to make informed decisions and coordinate resources effectively.
