import api from "./api";

export interface Hospital {
  _id: string;
  name: string;
  type: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contactNumber: string;
  email: string;
  emergencyContact: string;
  totalBeds: {
    general: number;
    icu: number;
    emergency: number;
    operation: number;
  };
  availableBeds: {
    general: number;
    icu: number;
    emergency: number;
    operation: number;
  };
  facilities: string[];
  operatingHours: {
    isOpen24x7: boolean;
    hours?: {
      [key: string]: { open: string; close: string };
    };
  };
  rating: {
    average: number;
    count: number;
  };
  distance?: number;
  totalAvailableBeds?: number;
  bedUtilization?: number;
}

export interface HealthTip {
  id: string;
  title: string;
  description: string;
  category: "general" | "emergency" | "prevention" | "wellness";
  icon: string;
  color: string;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  description: string;
  steps: string[];
  warnings?: string[];
  icon: string;
  category: string;
  priority: "high" | "medium" | "low";
}

export interface EmergencyPreparedness {
  id: string;
  title: string;
  description: string;
  checklist: string[];
  icon: string;
  category: string;
}

class ExploreService {
  /**
   * Get nearby hospitals based on user location
   */
  async getNearbyHospitals(
    lat: number,
    lng: number,
    radius: number = 50,
    facilities?: string[],
    availableBeds?: boolean
  ): Promise<{ success: boolean; data?: Hospital[]; message?: string }> {
    try {
      let queryParams = `lat=${lat}&lng=${lng}&radius=${radius}`;

      if (facilities && facilities.length > 0) {
        queryParams += `&facilities=${facilities.join(",")}`;
      }

      if (availableBeds) {
        queryParams += "&availableBeds=true";
      }

      const response = await api.getHospitals(queryParams);
      return {
        success: response.success,
        data: response.data as Hospital[],
        message: response.message,
      };
    } catch (error: any) {
      console.error("Error fetching nearby hospitals:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch hospitals",
      };
    }
  }

  /**
   * Get hospital by ID
   */
  async getHospitalById(
    id: string
  ): Promise<{ success: boolean; data?: Hospital; message?: string }> {
    try {
      const response = await api.getHospitalById(id);
      return {
        success: response.success,
        data: response.data as Hospital,
        message: response.message,
      };
    } catch (error: any) {
      console.error("Error fetching hospital:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch hospital",
      };
    }
  }

  /**
   * Get health tips
   */
  getHealthTips(): HealthTip[] {
    return [
      {
        id: "1",
        title: "Stay Hydrated",
        description:
          "Drink at least 8 glasses of water daily to maintain optimal health and body function.",
        category: "wellness",
        icon: "water",
        color: "#3B82F6",
      },
      {
        id: "2",
        title: "Know Emergency Numbers",
        description:
          "Save emergency contacts: 911 for emergencies, local hospital numbers, and poison control.",
        category: "emergency",
        icon: "call",
        color: "#EF4444",
      },
      {
        id: "3",
        title: "Regular Exercise",
        description:
          "Aim for 30 minutes of moderate exercise daily to boost immunity and cardiovascular health.",
        category: "wellness",
        icon: "fitness",
        color: "#10B981",
      },
      {
        id: "4",
        title: "First Aid Kit Ready",
        description:
          "Keep a stocked first aid kit at home with bandages, antiseptics, and essential medicines.",
        category: "prevention",
        icon: "medical",
        color: "#F59E0B",
      },
      {
        id: "5",
        title: "Mental Health Matters",
        description:
          "Take breaks, practice mindfulness, and don't hesitate to seek professional help when needed.",
        category: "wellness",
        icon: "happy",
        color: "#8B5CF6",
      },
      {
        id: "6",
        title: "Healthy Sleep",
        description:
          "Get 7-9 hours of quality sleep each night to support immune function and mental clarity.",
        category: "wellness",
        icon: "moon",
        color: "#6366F1",
      },
    ];
  }

  /**
   * Get first aid guides
   */
  getFirstAidGuides(): FirstAidGuide[] {
    return [
      {
        id: "cpr",
        title: "CPR (Cardiopulmonary Resuscitation)",
        description: "Life-saving technique for cardiac arrest",
        category: "Critical",
        priority: "high",
        icon: "heart",
        steps: [
          "Check if the person is responsive and breathing",
          "Call emergency services immediately (911)",
          "Place person on firm, flat surface on their back",
          "Place heel of hand on center of chest",
          "Place other hand on top, interlock fingers",
          "Push hard and fast at 100-120 compressions per minute",
          "Push down at least 2 inches deep",
          "Continue until help arrives or person starts breathing",
        ],
        warnings: [
          "Only perform if trained",
          "Do not stop compressions unless necessary",
          "Avoid pressing on ribs",
        ],
      },
      {
        id: "choking",
        title: "Choking (Heimlich Maneuver)",
        description: "Emergency response for airway obstruction",
        category: "Critical",
        priority: "high",
        icon: "warning",
        steps: [
          "Ask 'Are you choking?' - if they can't speak, act immediately",
          "Stand behind the person",
          "Make a fist with one hand, place above navel",
          "Grasp fist with other hand",
          "Perform quick upward thrusts",
          "Repeat until object is dislodged",
          "Call 911 if unsuccessful after several attempts",
        ],
        warnings: [
          "Don't perform on infants - use back blows instead",
          "Seek medical attention even if successful",
        ],
      },
      {
        id: "bleeding",
        title: "Severe Bleeding Control",
        description: "Stop life-threatening blood loss",
        category: "Critical",
        priority: "high",
        icon: "water",
        steps: [
          "Call 911 for severe bleeding",
          "Wash hands if possible",
          "Put on gloves if available",
          "Remove any visible dirt/debris (not embedded objects)",
          "Apply firm, direct pressure with clean cloth",
          "Maintain pressure for 10-15 minutes",
          "Add more cloth if blood soaks through",
          "Elevate injured area above heart if possible",
          "Apply pressure bandage once bleeding slows",
        ],
        warnings: [
          "Never remove embedded objects",
          "Don't use tourniquets unless trained",
          "Watch for shock symptoms",
        ],
      },
      {
        id: "burns",
        title: "Burn Treatment",
        description: "First aid for thermal burns",
        category: "Common",
        priority: "medium",
        icon: "flame",
        steps: [
          "Remove person from heat source",
          "Remove jewelry and tight clothing near burn",
          "Cool burn with cool (not cold) running water for 10-20 minutes",
          "Cover with sterile, non-stick bandage",
          "Take over-the-counter pain reliever if needed",
          "Keep burn elevated if possible",
          "Seek medical attention for severe burns",
        ],
        warnings: [
          "Don't use ice - can cause more damage",
          "Don't apply butter or oils",
          "Don't break blisters",
          "Seek immediate help for large or deep burns",
        ],
      },
      {
        id: "fracture",
        title: "Fracture/Broken Bone",
        description: "Immobilize and stabilize injured bone",
        category: "Common",
        priority: "medium",
        icon: "body",
        steps: [
          "Don't move the person unless necessary",
          "Call 911 for severe fractures",
          "Immobilize the injured area",
          "Apply ice packs to reduce swelling",
          "Treat for shock if necessary",
          "Don't try to realign the bone",
          "Create splint from rigid material if trained",
        ],
        warnings: [
          "Don't move injured area",
          "Watch for circulation below injury",
          "Seek immediate medical attention",
        ],
      },
      {
        id: "heatstroke",
        title: "Heat Stroke",
        description: "Emergency cooling for overheating",
        category: "Environmental",
        priority: "high",
        icon: "sunny",
        steps: [
          "Call 911 immediately",
          "Move person to cool, shaded area",
          "Remove excess clothing",
          "Cool person with whatever available:",
          "- Apply ice packs to neck, armpits, groin",
          "- Spray with cool water",
          "- Fan while spraying with water",
          "Give cool water if person is conscious",
          "Monitor temperature continuously",
        ],
        warnings: [
          "Heat stroke is life-threatening",
          "Don't give ice-cold water to drink",
          "Stay with person until help arrives",
        ],
      },
      {
        id: "allergic",
        title: "Allergic Reaction (Anaphylaxis)",
        description: "Severe allergic reaction response",
        category: "Critical",
        priority: "high",
        icon: "alert-circle",
        steps: [
          "Call 911 immediately",
          "Help person use epinephrine auto-injector (EpiPen) if available",
          "Inject into outer thigh, hold for 10 seconds",
          "Have person lie down with legs elevated",
          "Loosen tight clothing",
          "If breathing stops, start CPR",
          "Second dose may be needed after 5-15 minutes",
        ],
        warnings: [
          "Time is critical - act fast",
          "Don't wait to see if symptoms improve",
          "Person needs emergency medical care even after EpiPen",
        ],
      },
      {
        id: "seizure",
        title: "Seizure Response",
        description: "Protect person during seizure",
        category: "Medical",
        priority: "medium",
        icon: "pulse",
        steps: [
          "Stay calm and track time",
          "Clear area of hard or sharp objects",
          "Cushion head with something soft",
          "Turn person on their side if possible",
          "Loosen tight neckwear",
          "Don't restrain the person",
          "Don't put anything in their mouth",
          "Stay with them until seizure ends",
          "Call 911 if seizure lasts over 5 minutes",
        ],
        warnings: [
          "Never put objects in mouth",
          "Don't hold person down",
          "Call 911 for first-time seizure",
        ],
      },
    ];
  }

  /**
   * Get emergency preparedness guides
   */
  getEmergencyPreparedness(): EmergencyPreparedness[] {
    return [
      {
        id: "home-kit",
        title: "Home Emergency Kit",
        description: "Essential items for home emergencies",
        category: "Preparation",
        icon: "home",
        checklist: [
          "✓ First aid kit with bandages, gauze, tape",
          "✓ Prescription medications (7-day supply)",
          "✓ Over-the-counter pain relievers",
          "✓ Thermometer",
          "✓ Flashlight and extra batteries",
          "✓ Battery-powered radio",
          "✓ Bottled water (1 gallon per person per day)",
          "✓ Non-perishable food (3-day supply)",
          "✓ Manual can opener",
          "✓ Emergency contact list",
          "✓ Copies of important documents",
          "✓ Cash in small denominations",
          "✓ Phone chargers and power banks",
          "✓ Whistle to signal for help",
          "✓ Dust masks",
          "✓ Plastic sheeting and duct tape",
        ],
      },
      {
        id: "car-kit",
        title: "Vehicle Emergency Kit",
        description: "Be prepared on the road",
        category: "Travel",
        icon: "car",
        checklist: [
          "✓ Jumper cables",
          "✓ Tire repair kit and pump",
          "✓ Spare tire (properly inflated)",
          "✓ Basic tool kit",
          "✓ First aid kit",
          "✓ Bottled water",
          "✓ Non-perishable snacks",
          "✓ Flashlight with batteries",
          "✓ Emergency flares or reflectors",
          "✓ Blanket",
          "✓ Ice scraper",
          "✓ Phone charger (car adapter)",
          "✓ Emergency contact card",
        ],
      },
      {
        id: "natural-disaster",
        title: "Natural Disaster Plan",
        description: "Prepare for natural emergencies",
        category: "Safety",
        icon: "cloud",
        checklist: [
          "✓ Know your area's risks (floods, earthquakes, etc.)",
          "✓ Create evacuation plan with meeting points",
          "✓ Practice evacuation with family",
          "✓ Identify safe rooms in your home",
          "✓ Secure heavy furniture to walls",
          "✓ Know how to turn off utilities",
          "✓ Keep emergency kit accessible",
          "✓ Sign up for local emergency alerts",
          "✓ Document belongings with photos",
          "✓ Store documents in waterproof container",
          "✓ Plan for pets",
        ],
      },
      {
        id: "medical-info",
        title: "Medical Information Ready",
        description: "Keep medical details accessible",
        category: "Health",
        icon: "document",
        checklist: [
          "✓ List of current medications",
          "✓ Known allergies documented",
          "✓ Blood type information",
          "✓ Chronic conditions listed",
          "✓ Emergency contacts programmed",
          "✓ Primary doctor's contact info",
          "✓ Insurance information copies",
          "✓ Medical history summary",
          "✓ Recent test results",
          "✓ Advance directives if applicable",
        ],
      },
      {
        id: "family-plan",
        title: "Family Emergency Plan",
        description: "Coordinate family response",
        category: "Communication",
        icon: "people",
        checklist: [
          "✓ Designate out-of-town contact person",
          "✓ Ensure everyone knows contact numbers",
          "✓ Establish meeting locations",
          "✓ Practice communication plan",
          "✓ Keep school/work contact info",
          "✓ Plan for family members with special needs",
          "✓ Include pets in your plan",
          "✓ Update plan annually",
          "✓ Store copies of plan in multiple locations",
        ],
      },
      {
        id: "workplace",
        title: "Workplace Preparedness",
        description: "Stay safe at work",
        category: "Work",
        icon: "briefcase",
        checklist: [
          "✓ Know evacuation routes",
          "✓ Locate fire extinguishers",
          "✓ Find first aid kit location",
          "✓ Know emergency procedures",
          "✓ Keep emergency supplies at desk",
          "✓ Comfortable walking shoes stored",
          "✓ Snacks and water available",
          "✓ Flashlight in desk",
          "✓ Emergency contact list",
        ],
      },
    ];
  }

  /**
   * Search hospitals by name or type
   */
  searchHospitals(hospitals: Hospital[], query: string): Hospital[] {
    const lowerQuery = query.toLowerCase();
    return hospitals.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(lowerQuery) ||
        hospital.type.toLowerCase().includes(lowerQuery) ||
        hospital.address.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter hospitals by facility type
   */
  filterByFacility(hospitals: Hospital[], facility: string): Hospital[] {
    return hospitals.filter((hospital) =>
      hospital.facilities.includes(facility)
    );
  }

  /**
   * Sort hospitals by distance
   */
  sortByDistance(hospitals: Hospital[]): Hospital[] {
    return [...hospitals].sort((a, b) => {
      const distA = a.distance || Infinity;
      const distB = b.distance || Infinity;
      return distA - distB;
    });
  }

  /**
   * Sort hospitals by available beds
   */
  sortByAvailability(hospitals: Hospital[]): Hospital[] {
    return [...hospitals].sort((a, b) => {
      const availA =
        (a.availableBeds.general || 0) +
        (a.availableBeds.icu || 0) +
        (a.availableBeds.emergency || 0);
      const availB =
        (b.availableBeds.general || 0) +
        (b.availableBeds.icu || 0) +
        (b.availableBeds.emergency || 0);
      return availB - availA;
    });
  }
}

export default new ExploreService();
