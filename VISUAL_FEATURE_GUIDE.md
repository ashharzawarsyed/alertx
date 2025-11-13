# Visual Feature Guide

## Emergencies Screen - Before vs After

### BEFORE (Old Implementation)
```
┌─────────────────────────────────┐
│  Emergencies        [Filter]   │
├─────────────────────────────────┤
│  [All] [Active] [Done] [Cancel] │
│                                 │
│  ┌──────────────────────────┐  │
│  │ [Status]  1h ago         │  │
│  │                          │  │
│  │ CRITICAL Score: 8/10     │  │
│  │ Chest pain, Difficulty   │  │
│  │ 123 Main St              │  │
│  │                          │  │
│  │ ID: abc12345       >     │  │
│  └──────────────────────────┘  │
│                                 │
│  Plain Alert Dialog on Tap     │
└─────────────────────────────────┘
```

### AFTER (Enhanced Implementation)
```
┌─────────────────────────────────┐
│  Emergencies        [Refresh]   │
│  3 total requests               │
├─────────────────────────────────┤
│  [All] [Active] [Done] [Cancel] │
│  [List] [Map]  ← View Toggle    │
│                                 │
│  LIST VIEW:                     │
│  ┌──────────────────────────┐  │
│  │ [ACTIVE] 🔴  1h ago      │  │
│  │                          │  │
│  │ 🔴 CRITICAL  Score: 8/10 │  │
│  │ ⏰ ETA: 15 min • 8.2 km  │ ← NEW!
│  │                          │  │
│  │ Symptoms:                │  │
│  │ Chest pain, Difficulty   │  │
│  │ 📍 123 Main Street       │  │
│  │                          │  │
│  │ ID: abc12345       >     │  │
│  └──────────────────────────┘  │
│                                 │
│  MAP VIEW:                      │
│  ┌──────────────────────────┐  │
│  │ ┌────────────────────┐   │  │
│  │ │ 2 Active Emergencies│   │  │
│  │ │ Tap markers details │   │  │
│  │ └────────────────────┘   │  │
│  │                          │  │
│  │    🔵 ← You              │  │
│  │         \                │  │
│  │          \               │  │
│  │           🔴 ← Ambulance │  │
│  │                          │  │
│  └──────────────────────────┘  │
│                                 │
│  TAP CARD → Stylized Modal     │
│  ╔════════════════════════════╗│
│  ║ ━━━━━━━━━━━━━━━━━━━━━━━━━ ║│
│  ║ Emergency Details          ║│
│  ║ ID: abc123456789           ║│
│  ║                   [X]      ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │  🟢 AMBULANCE EN ROUTE │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ ⏰ Estimated Arrival    │ ║│
│  ║ │                         │ ║│
│  ║ │      15 min             │ ║│
│  ║ │  Distance: 8.23 km      │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ 💊 Triage Assessment   │ ║│
│  ║ │ [CRITICAL] Score: 8/10  │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ 📋 Symptoms            │ ║│
│  ║ │ • Chest pain           │ ║│
│  ║ │ • Difficulty breathing │ ║│
│  ║ │ • Dizziness            │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ 📍 Location            │ ║│
│  ║ │ 123 Main Street...     │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ 🚑 Ambulance           │ ║│
│  ║ │ AMB-1234               │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ 👤 Driver              │ ║│
│  ║ │ John Smith             │ ║│
│  ║ │ +1 234-567-8900        │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ 🏥 Hospital            │ ║│
│  ║ │ City General Hospital  │ ║│
│  ║ │ 456 Hospital Ave       │ ║│
│  ║ │ +1 234-567-0000        │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ ⏱️ Timeline            │ ║│
│  ║ │ Created: 2:30 PM       │ ║│
│  ║ │ Responded: 2:32 PM     │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ 🗺️  Track on Map       │ ║│
│  ║ └────────────────────────┘ ║│
│  ║                            ║│
│  ║ ┌────────────────────────┐ ║│
│  ║ │ ❌ Cancel Emergency    │ ║│
│  ║ └────────────────────────┘ ║│
│  ╚════════════════════════════╝│
└─────────────────────────────────┘
```

## Explore Tab - Before vs After

### BEFORE
```
┌─────────────────────────────────┐
│  NO TAB IN NAVIGATION ❌        │
└─────────────────────────────────┘
```

### AFTER
```
┌─────────────────────────────────┐
│  Explore        🚨              │
│  Health resources near you      │
├─────────────────────────────────┤
│  [🔍 Search hospitals...]       │
│                                 │
│  [🏥 Hospitals] [❤️ Health]     │
│  [🩹 First Aid] [🛡️ Prepared]   │
│                                 │
│  [List] [Map]  ← View Toggle    │
│                                 │
│  LIST VIEW:                     │
│  ┌──────────────────────────┐  │
│  │ 🏥 City Hospital         │  │
│  │ 2.3 km • Open 24/7       │  │
│  │ 📍 123 Medical Plaza     │  │
│  │ ⭐ ER | ICU | Surgery    │  │
│  └──────────────────────────┘  │
│                                 │
│  MAP VIEW:                      │
│  ┌──────────────────────────┐  │
│  │ ┌────────────────────┐   │  │
│  │ │ 5 Hospitals Nearby │   │  │
│  │ │ Tap markers detail │   │  │
│  │ └────────────────────┘   │  │
│  │                          │  │
│  │    📍 ← You              │  │
│  │                          │  │
│  │  🏥        🏥             │  │
│  │        🏥                │  │
│  │  🏥        🏥             │  │
│  │                          │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘

BOTTOM NAV:
[🏠 Home] [🚨 Emergencies] [🧭 Explore] [👤 Profile]
                              ↑ NEW!
```

## Key Improvements Visualization

### 1. ETA Display
```
OLD: No ETA shown in list
NEW: ⏰ ETA: 15 min • 8.2 km (visible at a glance)
```

### 2. Map View
```
OLD: List only
NEW: Toggle between list and map
     - See all locations at once
     - Visual distance perception
     - Tap markers for quick info
```

### 3. Detail Modal
```
OLD: Plain Alert with text
     ┌─────────────────┐
     │ Emergency Info  │
     │                 │
     │ ID: abc123      │
     │ Status: Active  │
     │ Symptoms: ...   │
     │                 │
     │     [OK]        │
     └─────────────────┘

NEW: Beautiful Bottom Sheet
     ╔═════════════════╗
     ║ ━━━━━━━━━━━━━━━ ║ ← Handle
     ║                 ║
     ║ [STATUS BANNER] ║ ← Color-coded
     ║                 ║
     ║ [ETA CARD]      ║ ← Large time
     ║ [TRIAGE CARD]   ║ ← Severity
     ║ [SYMPTOMS CARD] ║ ← Bullets
     ║ [LOCATION CARD] ║ ← Map pin
     ║ [AMBULANCE]     ║ ← Vehicle info
     ║ [DRIVER]        ║ ← Contact
     ║ [HOSPITAL]      ║ ← Destination
     ║ [TIMELINE]      ║ ← History
     ║                 ║
     ║ [Track on Map]  ║ ← Blue button
     ║ [Cancel]        ║ ← Red button
     ╚═════════════════╝
```

### 4. Cancel Emergency
```
OLD: No cancel option
NEW: 
  1. Tap emergency card
  2. Scroll to bottom of modal
  3. Tap "Cancel Emergency" (red)
  4. Confirm in dialog:
     ┌─────────────────────────┐
     │ Cancel Emergency        │
     │                         │
     │ Are you sure you want   │
     │ to cancel this request? │
     │                         │
     │  [No]  [Yes, Cancel] 🔴 │
     └─────────────────────────┘
  5. Emergency status → Cancelled
  6. List refreshes automatically
```

### 5. Map Markers
```
Patient Location:
  ┌─────┐
  │  👤 │ Blue circle
  └─────┘ Person icon
           48x48px

Ambulance Location:
  ┌─────┐
  │  🚑 │ Red circle
  └─────┘ Medical icon
           52x52px
           Pulsing animation

Hospital Location:
  ┌─────┐
  │  🏥 │ Red circle
  └─────┘ Medical icon
           48x48px
```

## Color System

### Status Colors
```
🟠 Pending      #F59E0B (Orange)
🔵 Active       #3B82F6 (Blue)
🟢 Completed    #10B981 (Green)
🔴 Cancelled    #EF4444 (Red)
```

### Severity Colors
```
🔴 Critical     #DC2626 (Dark Red)
🟠 High         #EF4444 (Red)
🟡 Medium       #F59E0B (Orange)
🟢 Low          #10B981 (Green)
```

### UI Elements
```
Primary:     #EF4444 (Red - Emergency brand)
Background:  #FFFFFF (White)
Card BG:     #F9FAFB (Light Gray)
Text Dark:   #111827 (Almost Black)
Text Medium: #6B7280 (Gray)
Text Light:  #9CA3AF (Light Gray)
Border:      #F3F4F6 (Very Light Gray)
```

## Animation Flows

### Modal Open
```
1. User taps emergency card
2. Modal slides up from bottom (300ms spring)
3. Backdrop fades in (300ms)
4. Content visible
```

### Modal Close
```
1. User taps backdrop OR swipes down OR taps X
2. Modal slides down (300ms ease-out)
3. Backdrop fades out (300ms)
4. Modal hidden
```

### View Mode Switch
```
1. User taps [List] or [Map]
2. Immediate switch (no animation)
3. Active button: black bg, white text
4. Inactive button: gray bg, gray text
```

### Map Marker Tap
```
1. User taps marker
2. Info callout appears above marker
3. User taps callout
4. Detail modal opens
```

## Responsive Design

### Card Heights
```
Emergency Card:  ~180px
Hospital Card:   ~140px
ETA Card:        ~120px
Detail Cards:    ~100-150px
Modal:           Up to 90% screen height
Map:             60% screen height (explore)
                 100% available (emergencies map view)
```

### Text Sizes
```
Header:     28px
Title:      24px
Subtitle:   18px
Body:       14-16px
Label:      11-13px
Badge:      11px
```

### Spacing
```
Screen Padding:  20-24px
Card Padding:    16px
Card Margin:     12px
Section Gap:     16-20px
Button Height:   48px
Icon Size:       20-24px
```

## User Interaction Patterns

### Emergency Card Tap
```
Tap anywhere on card → Detail modal opens
```

### Map Marker Tap
```
Tap marker → Info callout
Tap callout → Detail modal
```

### Filter Chip Tap
```
Tap filter → Filter applied
             List updates
             Chip turns black
```

### View Mode Toggle
```
Tap List → Shows list view
Tap Map → Shows map view
Toggle persists per tab
```

### Pull to Refresh
```
Pull down list → Spinner appears
                 Data refreshes
                 List updates
```

### Swipe to Dismiss Modal
```
Swipe down on modal → Modal slides down
                      Returns to list/map
```

---

*Visual guide for understanding the enhanced emergency-user-app features*
