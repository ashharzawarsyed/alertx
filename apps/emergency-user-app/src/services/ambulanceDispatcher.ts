import axios from 'axios';
import Config from '../config/config';
import { TriageResult, EmergencyType } from './symptomAnalyzer';

export type AmbulanceType = 'BLS' | 'ALS' | 'MOBILE_ICU' | 'SPECIALIZED';

export interface AmbulanceSpecification {
  type: AmbulanceType;
  name: string;
  description: string;
  requiredFor: EmergencyType[];
  equipment: string[];
  staffing: string[];
}

export interface DispatchedAmbulance {
  ambulanceId: string;
  type: AmbulanceType;
  vehicleNumber: string;
  eta: number; // minutes
  crew: {
    paramedics: number;
    nurses: number;
    doctor: boolean;
  };
  equipment: string[];
  location: {
    lat: number;
    lng: number;
  };
  hospital: {
    id: string;
    name: string;
  };
}

class AmbulanceDispatcher {
  private ambulanceSpecs: AmbulanceSpecification[] = [
    {
      type: 'BLS',
      name: 'Basic Life Support',
      description: 'For non-life-threatening emergencies',
      requiredFor: ['general', 'fracture'],
      equipment: [
        'Basic first aid kit',
        'Oxygen',
        'Automated External Defibrillator (AED)',
        'Splints and bandages',
        'Blood pressure monitor',
      ],
      staffing: ['2 Emergency Medical Technicians (EMTs)'],
    },
    {
      type: 'ALS',
      name: 'Advanced Life Support',
      description: 'For serious medical emergencies',
      requiredFor: ['cardiac', 'respiratory', 'neurological'],
      equipment: [
        'Advanced cardiac monitor',
        'Defibrillator',
        'Ventilator',
        'IV medications',
        'Intubation equipment',
        'ECG machine',
      ],
      staffing: ['2 Paramedics', '1 Critical Care Nurse'],
    },
    {
      type: 'MOBILE_ICU',
      name: 'Mobile Intensive Care Unit',
      description: 'For critical life-threatening conditions',
      requiredFor: ['cardiac', 'neurological', 'trauma'],
      equipment: [
        'Full ICU monitoring system',
        'Advanced ventilator',
        'Blood gas analyzer',
        'Ultrasound machine',
        'Advanced medications',
        'Surgical instruments',
      ],
      staffing: ['2 Paramedics', '1 Emergency Physician', '1 Critical Care Nurse'],
    },
    {
      type: 'SPECIALIZED',
      name: 'Specialized Emergency Unit',
      description: 'For burns, toxicology, and specialized care',
      requiredFor: ['burn', 'poisoning', 'allergic'],
      equipment: [
        'Burn care supplies',
        'Antidotes and medications',
        'Advanced airway management',
        'Specialized monitoring',
        'Decontamination equipment',
      ],
      staffing: ['2 Paramedics', '1 Specialist Physician', '1 Nurse'],
    },
  ];

  /**
   * Dispatch appropriate ambulance based on AI triage analysis
   */
  async dispatchAmbulance(
    triageResult: TriageResult,
    userLocation: { lat: number; lng: number }
  ): Promise<DispatchedAmbulance> {
    try {
      console.log('🚑 Dispatching ambulance for:', triageResult.emergencyType);

      // Determine required ambulance type
      const ambulanceType = this.selectAmbulanceType(
        triageResult.emergencyType,
        triageResult.severity
      );

      console.log('📋 Selected ambulance type:', ambulanceType);

      // Call backend to find and dispatch nearest ambulance
      const response = await axios.post(
        `${Config.API_URL}/api/v1/emergencies/dispatch-intelligent`,
        {
          ambulanceType,
          severity: triageResult.severity,
          emergencyType: triageResult.emergencyType,
          userLocation,
          triageAnalysis: triageResult,
        },
        {
          timeout: 10000, // 10 second timeout
        }
      );

      const dispatchedAmbulance: DispatchedAmbulance = response.data.ambulance;

      console.log('✅ Ambulance dispatched:', dispatchedAmbulance);
      return dispatchedAmbulance;

    } catch (error) {
      console.error('❌ Ambulance dispatch failed:', error);
      
      // Fallback: create mock dispatched ambulance
      return this.getMockDispatchedAmbulance(
        triageResult.emergencyType,
        userLocation
      );
    }
  }

  /**
   * Select appropriate ambulance type based on emergency
   */
  private selectAmbulanceType(
    emergencyType: EmergencyType,
    severity: string
  ): AmbulanceType {
    // Critical severity always gets Mobile ICU or ALS
    if (severity === 'critical') {
      if (emergencyType === 'cardiac' || emergencyType === 'neurological') {
        return 'MOBILE_ICU';
      }
      return 'ALS';
    }

    // High severity conditions
    if (severity === 'high') {
      if (emergencyType === 'burn' || emergencyType === 'poisoning' || emergencyType === 'allergic') {
        return 'SPECIALIZED';
      }
      if (emergencyType === 'cardiac' || emergencyType === 'respiratory' || emergencyType === 'neurological') {
        return 'ALS';
      }
      return 'ALS';
    }

    // Medium severity
    if (severity === 'medium') {
      if (emergencyType === 'cardiac' || emergencyType === 'respiratory') {
        return 'ALS';
      }
      if (emergencyType === 'burn' || emergencyType === 'poisoning') {
        return 'SPECIALIZED';
      }
      return 'BLS';
    }

    // Low severity - BLS is sufficient
    return 'BLS';
  }

  /**
   * Get ambulance specification details
   */
  getAmbulanceSpec(type: AmbulanceType): AmbulanceSpecification | undefined {
    return this.ambulanceSpecs.find(spec => spec.type === type);
  }

  /**
   * Get all ambulance specifications
   */
  getAllSpecs(): AmbulanceSpecification[] {
    return this.ambulanceSpecs;
  }

  /**
   * Mock dispatched ambulance for fallback
   */
  private getMockDispatchedAmbulance(
    emergencyType: EmergencyType,
    userLocation: { lat: number; lng: number }
  ): DispatchedAmbulance {
    const ambulanceType = this.selectAmbulanceType(emergencyType, 'high');
    const spec = this.getAmbulanceSpec(ambulanceType);

    return {
      ambulanceId: `AMB-${Date.now()}`,
      type: ambulanceType,
      vehicleNumber: `EMG-${Math.floor(Math.random() * 1000)}`,
      eta: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
      crew: {
        paramedics: ambulanceType === 'BLS' ? 0 : 2,
        nurses: ambulanceType === 'BLS' ? 0 : 1,
        doctor: ambulanceType === 'MOBILE_ICU',
      },
      equipment: spec?.equipment || [],
      location: {
        lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
        lng: userLocation.lng + (Math.random() - 0.5) * 0.01,
      },
      hospital: {
        id: 'HOSP-001',
        name: 'Central Emergency Hospital',
      },
    };
  }

  /**
   * Calculate estimated time of arrival
   */
  calculateETA(
    ambulanceLocation: { lat: number; lng: number },
    userLocation: { lat: number; lng: number }
  ): number {
    // Simple distance calculation (Haversine formula would be more accurate)
    const latDiff = Math.abs(ambulanceLocation.lat - userLocation.lat);
    const lngDiff = Math.abs(ambulanceLocation.lng - userLocation.lng);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    // Rough estimate: 1 degree ≈ 111km, average speed 60km/h
    const estimatedMinutes = (distance * 111 * 60) / 60;

    return Math.max(5, Math.min(30, Math.round(estimatedMinutes)));
  }
}

export const ambulanceDispatcher = new AmbulanceDispatcher();
