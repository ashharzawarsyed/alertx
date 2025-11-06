# Medical Profile Management - System Architecture

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALERTX MEDICAL PROFILE SYSTEM                 │
│                                                                   │
│  User Interface → Service Layer → Backend API → MongoDB          │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture Layers

### Layer 1: User Interface (React Native Screens)

```
┌────────────────────────────────────────────────────────────────┐
│                         PROFILE TAB                             │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  "Medical Profile" Button → /medical                      │ │
│  │  "Emergency Contacts" Button → /medical/emergency-contacts│ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│              MEDICAL PROFILE OVERVIEW (/medical)                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  📊 Basic Info     → /medical/basic-info                  │ │
│  │  ⚠️ Allergies      → /medical/allergies                   │ │
│  │  💊 Medications    → /medical/medications                 │ │
│  │  🏥 Conditions     → /medical/conditions                  │ │
│  │  📞 Contacts       → /medical/emergency-contacts          │ │
│  │  🔪 Surgeries      → /medical/surgeries (pending)         │ │
│  │  👨‍⚕️ Providers     → /medical/providers (pending)          │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────────┐
│                    EDITOR SCREENS (Modals)                      │
│  ┌──────────────┬──────────────┬──────────────┬─────────────┐ │
│  │ Basic Info   │ Allergies    │ Medications  │ Conditions  │ │
│  │  - Blood     │  - Name      │  - Name      │  - Name     │ │
│  │  - Height    │  - Severity  │  - Dosage    │  - Severity │ │
│  │  - Weight    │  - Reaction  │  - Frequency │  - Date     │ │
│  │  - DOB       │              │  - Active    │  - Doctor   │ │
│  └──────────────┴──────────────┴──────────────┴─────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Emergency Contacts                                       │  │
│  │  - Name, Relationship, Phone, Email, Primary            │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Layer 2: Component Library

```
┌────────────────────────────────────────────────────────────────┐
│                      REUSABLE COMPONENTS                        │
│  ┌────────────────┬────────────────┬───────────────────────┐  │
│  │ MedicalInfoCard│  AllergyBadge  │   MedicationItem      │  │
│  │                │                │                       │  │
│  │  ┌──────────┐ │   ┌─────────┐  │    ┌──────────────┐  │  │
│  │  │ Title ✏️ │ │   │ALLERGEN │  │    │💊 Medicine   │  │  │
│  │  ├──────────┤ │   │Reaction │  │    │  Dosage      │  │  │
│  │  │ Content  │ │   │ SEVERE  │  │    │  Frequency   │  │  │
│  │  └──────────┘ │   └─────────┘  │    └──────────────┘  │  │
│  └────────────────┴────────────────┴───────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Layer 3: Service Layer

```
┌────────────────────────────────────────────────────────────────┐
│              MEDICAL PROFILE SERVICE (TypeScript)               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  medicalProfileService.ts                                 │ │
│  │                                                            │ │
│  │  [Axios Instance] + [JWT Interceptors]                    │ │
│  │                                                            │ │
│  │  Methods:                                                  │ │
│  │  • getMedicalProfile()          → GET /medical-profile/   │ │
│  │  • updateBasicInfo(data)        → PUT /basic-info         │ │
│  │  • updateAllergies(data)        → PUT /allergies          │ │
│  │  • updateMedications(data)      → PUT /medications        │ │
│  │  • updateMedicalConditions(data)→ PUT /medical-conditions │ │
│  │  • updateEmergencyContacts(data)→ PUT /emergency-contacts │ │
│  │  • updateSurgeries(data)        → PUT /surgeries          │ │
│  │  • updateHealthcareProviders()  → PUT /healthcare-providers│ │
│  │  • updateInsurance(data)        → PUT /insurance          │ │
│  │  • updateEmergencyInstructions()→ PUT /emergency-instructions│ │
│  │  • uploadDocument(data)         → POST /documents         │ │
│  │  • deleteDocument(id)           → DELETE /documents/:id   │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Layer 4: Backend API

```
┌────────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS BACKEND (Node.js)                   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Route: /api/v1/medical-profile/*                         │ │
│  │                                                            │ │
│  │  Controllers:                                              │ │
│  │  • medicalProfileController.js                            │ │
│  │                                                            │ │
│  │  Middleware:                                               │ │
│  │  • auth.js (JWT verification)                             │ │
│  │  • validation.js (input validation)                       │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Layer 5: Database

```
┌────────────────────────────────────────────────────────────────┐
│                         MONGODB DATABASE                        │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  User Model (with medicalProfile embedded)                │ │
│  │                                                            │ │
│  │  medicalProfile: {                                         │ │
│  │    bloodType: String                                       │ │
│  │    height: { value, unit }                                 │ │
│  │    weight: { value, unit }                                 │ │
│  │    dateOfBirth: Date                                       │ │
│  │    allergies: [{ allergen, severity, reaction }]          │ │
│  │    medications: [{ name, dosage, frequency, isActive }]   │ │
│  │    medicalConditions: [{ condition, severity, date }]     │ │
│  │    surgeries: [{ procedure, date, hospital }]             │ │
│  │    emergencyContacts: [{ name, phone, isPrimary }]        │ │
│  │    healthcareProviders: [{ name, specialty, phone }]      │ │
│  │    insurance: { provider, policyNumber }                  │ │
│  │    documents: [{ filename, url, uploadDate }]             │ │
│  │  }                                                         │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

### Read Flow (Loading Medical Profile)

```
User opens app
     ↓
Navigate to /medical
     ↓
MedicalProfileScreen.tsx
     ↓
useEffect → fetchProfile()
     ↓
medicalProfileService.getMedicalProfile()
     ↓
Axios GET request + JWT token
     ↓
Backend: /api/v1/medical-profile/ (GET)
     ↓
auth.js middleware (verify token)
     ↓
medicalProfileController.getMedicalProfile()
     ↓
MongoDB: User.findById(userId).select('medicalProfile')
     ↓
Return JSON data
     ↓
Service returns ApiResponse<MedicalProfile>
     ↓
Screen setState with data
     ↓
UI renders with data
```

### Write Flow (Saving Allergies)

```
User taps "Add Allergy"
     ↓
Modal opens with form
     ↓
User fills: Allergen, Severity, Reaction
     ↓
User taps "Add"
     ↓
Form validation (client-side)
     ↓
Add to local state array
     ↓
User taps "Save Changes"
     ↓
AllergiesManagerScreen calls save()
     ↓
medicalProfileService.updateAllergies(allergiesArray)
     ↓
Axios PUT request + JWT token + data
     ↓
Backend: /api/v1/medical-profile/allergies (PUT)
     ↓
auth.js middleware (verify token)
     ↓
validation.js (validate allergy data)
     ↓
medicalProfileController.updateAllergies()
     ↓
MongoDB: User.findByIdAndUpdate(
  userId,
  { 'medicalProfile.allergies': allergiesArray }
)
     ↓
Return updated document
     ↓
Service returns success response
     ↓
Alert "Success" + navigate back
     ↓
Overview screen refreshes
     ↓
New allergies displayed
```

## 🎨 Color Coding System

```
┌─────────────────────────────────────────────────────────────┐
│  SCREEN THEME COLORS (Header Gradients)                     │
├─────────────────────────────────────────────────────────────┤
│  Medical Profile Overview    │  Red Gradient    │ #EF4444   │
│  Basic Info Editor           │  Red Gradient    │ #EF4444   │
│  Allergies Manager           │  Orange Gradient │ #F59E0B   │
│  Medications Manager         │  Blue Gradient   │ #3B82F6   │
│  Conditions Manager          │  Purple Gradient │ #8B5CF6   │
│  Emergency Contacts Manager  │  Red Gradient    │ #EF4444   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ALLERGY SEVERITY COLORS                                     │
├─────────────────────────────────────────────────────────────┤
│  Mild              │ Yellow       │ #FEF3C7 (bg) #92400E    │
│  Moderate          │ Orange       │ #FED7AA (bg) #9A3412    │
│  Severe            │ Light Red    │ #FECACA (bg) #991B1B    │
│  Life-Threatening  │ Dark Red     │ #FEE2E2 (bg) #7F1D1D    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MEDICAL CONDITION SEVERITY COLORS                           │
├─────────────────────────────────────────────────────────────┤
│  Mild              │ Green        │ #10B981 + ellipse icon  │
│  Moderate          │ Orange       │ #F59E0B + alert icon    │
│  Severe            │ Red          │ #EF4444 + warning icon  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  STATUS INDICATORS                                           │
├─────────────────────────────────────────────────────────────┤
│  Active Medication    │ Blue badge    │ #3B82F6 │ Opaque   │
│  Inactive Medication  │ Gray badge    │ #9CA3AF │ 50% opacity│
│  Primary Contact      │ Star icon     │ #EAB308 │ Gold star │
│  Other Contact        │ No indicator  │ -       │ -         │
└─────────────────────────────────────────────────────────────┘
```

## 📂 File Structure

```
apps/emergency-user-app/
├── src/
│   ├── services/
│   │   └── medicalProfileService.ts          (416 lines, API client)
│   │
│   ├── components/
│   │   └── medical/
│   │       ├── MedicalInfoCard.tsx            (139 lines)
│   │       ├── AllergyBadge.tsx               (138 lines)
│   │       └── MedicationItem.tsx             (144 lines)
│   │
│   └── screens/
│       ├── main/
│       │   └── ProfileScreen.tsx              (Modified: +navigation links)
│       │
│       └── medical/
│           ├── MedicalProfileScreen.tsx       (608 lines, overview)
│           ├── BasicInfoEditorScreen.tsx      (345 lines)
│           ├── AllergiesManagerScreen.tsx     (~400 lines)
│           ├── MedicationsManagerScreen.tsx   (~500 lines)
│           ├── EmergencyContactsManagerScreen.tsx (~500 lines)
│           └── MedicalConditionsManagerScreen.tsx (~450 lines)
│
└── app/
    └── medical/
        ├── index.tsx                          (Route: /medical)
        ├── basic-info.tsx                     (Route: /medical/basic-info)
        ├── allergies.tsx                      (Route: /medical/allergies)
        ├── medications.tsx                    (Route: /medical/medications)
        ├── conditions.tsx                     (Route: /medical/conditions)
        └── emergency-contacts.tsx             (Route: /medical/emergency-contacts)
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User Signs In                                            │
│     └→ JWT token stored in AsyncStorage ('auth-token')      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. API Request Made                                         │
│     └→ Axios interceptor reads token from AsyncStorage      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Token Added to Header                                    │
│     └→ headers: { Authorization: 'Bearer <token>' }         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Backend Validates Token                                  │
│     └→ auth.js middleware decodes JWT                       │
│     └→ Extracts userId                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Database Query with User ID                              │
│     └→ Find/Update medical profile for authenticated user   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Response Sent Back                                       │
│     └→ Medical profile data or success message              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Component Reusability Map

```
MedicalInfoCard
    ├── Used in MedicalProfileScreen
    │   ├── Basic Information section
    │   ├── Allergies section
    │   ├── Current Medications section
    │   ├── Medical Conditions section
    │   ├── Emergency Contacts section
    │   ├── Surgeries section
    │   ├── Healthcare Providers section
    │   └── Profile Completion section
    └── Can be reused in future screens

AllergyBadge
    ├── Used in MedicalProfileScreen (overview)
    ├── Used in AllergiesManagerScreen (list)
    └── Standalone component for allergy display

MedicationItem
    ├── Used in MedicalProfileScreen (overview)
    ├── Used in MedicationsManagerScreen (list)
    └── Standalone component for medication display
```

## 🧩 TypeScript Interface Hierarchy

```
ApiResponse<T>
    └── Generic wrapper for all API responses
        ├── success: boolean
        ├── message?: string
        └── data?: T

MedicalProfile
    ├── BasicMedicalInfo
    │   ├── bloodType?: string
    │   ├── height?: { value: number, unit: string }
    │   ├── weight?: { value: number, unit: string }
    │   └── dateOfBirth?: Date
    │
    ├── allergies?: Allergy[]
    │   └── { allergen, severity, reaction? }
    │
    ├── medications?: Medication[]
    │   └── { name, dosage?, frequency?, prescribedBy?, isActive? }
    │
    ├── medicalConditions?: MedicalCondition[]
    │   └── { condition, severity?, diagnosedDate?, treatingPhysician? }
    │
    ├── surgeries?: Surgery[]
    │   └── { procedure, date, hospital?, surgeon?, complications? }
    │
    ├── emergencyContacts?: EmergencyContact[]
    │   └── { name, relationship, phone, email?, isPrimary? }
    │
    ├── healthcareProviders?: HealthcareProvider[]
    │   └── { name, specialty?, phone?, address?, type }
    │
    ├── insurance?: Insurance
    │   └── { provider?, policyNumber?, groupNumber?, expirationDate? }
    │
    ├── emergencyInstructions?: EmergencyInstructions
    │   └── { instructions?: string }
    │
    └── documents?: MedicalDocument[]
        └── { filename, url, uploadDate, type? }
```

## 🚀 Performance Optimizations

1. **Lazy Loading**: Routes loaded on-demand via expo-router
2. **Component Memoization**: Reusable components prevent re-renders
3. **Async Storage Caching**: JWT token cached locally
4. **Conditional Rendering**: Empty sections not rendered
5. **Optimistic Updates**: Local state updates before API confirmation
6. **Pull-to-Refresh**: Manual refresh instead of constant polling
7. **Form Validation**: Client-side validation before API calls
8. **Debounced Inputs**: Text inputs don't trigger on every keystroke

## 🔒 Security Features

1. **JWT Authentication**: All requests require valid token
2. **User-Scoped Data**: Each user can only access their own medical profile
3. **Input Validation**: Both client and server-side validation
4. **Secure Storage**: Tokens stored in AsyncStorage (encrypted on iOS)
5. **HTTPS Ready**: Service layer configured for production HTTPS
6. **No Sensitive Data in URLs**: All data in request body, not query params
7. **Error Messages**: Generic errors don't expose system details

## 📊 State Management

```
Local Component State (useState)
    ├── Form inputs (allergy name, medication dosage, etc.)
    ├── Modal visibility
    ├── Loading states
    ├── Editing index
    └── Local arrays before save

Global State (useAuthStore - Zustand)
    ├── User object
    ├── Authentication token
    └── Sign in/out methods

Persistent Storage (AsyncStorage)
    └── 'auth-token': JWT token

API State (React hooks + medicalProfileService)
    └── Medical profile data fetched on mount
```

## 🎬 User Journey Map

```
1. NEW USER JOURNEY
   └→ Sign up → Sign in → Profile tab → "Medical Profile" (empty)
      └→ "Add Allergy" → Fill form → Save → See red badge
      └→ "Add Medication" → Fill form → Save → See in active list
      └→ "Add Emergency Contact" → Fill form → Mark primary → Save
      └→ Profile complete! → Ready for emergencies

2. EXISTING USER JOURNEY
   └→ Sign in → Profile tab → "Medical Profile" (populated)
      └→ Review information → Edit allergy severity → Update
      └→ Mark medication inactive → Save → See move to inactive
      └→ Change primary contact → Save → Star moves to new contact

3. EMERGENCY SCENARIO
   └→ User has accident → Emergency responder opens app
      └→ Medical Profile visible → See life-threatening allergies
      └→ See active medications → See emergency contacts
      └→ Call primary contact → Avoid dangerous drug interactions
      └→ Life saved! 🎉
```

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: ✅ Production Ready
