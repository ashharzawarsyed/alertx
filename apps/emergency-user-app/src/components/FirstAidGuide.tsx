import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmergencyType } from '../services/symptomAnalyzer';

interface FirstAidStep {
  step: number;
  title: string;
  description: string;
  warning?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface FirstAidGuideProps {
  emergencyType: EmergencyType;
  severity: string;
  visible: boolean;
  onClose: () => void;
  ambulanceETA?: number;
}

const firstAidData: Record<EmergencyType, FirstAidStep[]> = {
  cardiac: [
    {
      step: 1,
      title: 'Call Emergency Services',
      description: 'Ensure 911/emergency has been called. Ambulance is on the way.',
      icon: 'call',
    },
    {
      step: 2,
      title: 'Keep Person Calm',
      description: 'Help them sit down in a comfortable position. Loosen tight clothing.',
      icon: 'people',
    },
    {
      step: 3,
      title: 'Give Aspirin (If Available)',
      description: 'If conscious and not allergic, give 300mg aspirin to chew slowly.',
      warning: '⚠️ Do NOT give aspirin if person is allergic or has bleeding disorder',
      icon: 'medical',
    },
    {
      step: 4,
      title: 'Monitor Vital Signs',
      description: 'Check breathing and pulse. Be ready to perform CPR if they become unconscious.',
      icon: 'heart',
    },
    {
      step: 5,
      title: 'Stay Until Help Arrives',
      description: 'Do not leave the person alone. Keep them calm and reassured.',
      icon: 'time',
    },
  ],
  respiratory: [
    {
      step: 1,
      title: 'Help Them Sit Upright',
      description: 'Position them sitting up to make breathing easier. Do NOT lay them down.',
      icon: 'person',
    },
    {
      step: 2,
      title: 'Loosen Tight Clothing',
      description: 'Loosen collar, belt, or any restrictive clothing around neck and chest.',
      icon: 'shirt',
    },
    {
      step: 3,
      title: 'Use Inhaler (If Available)',
      description: 'If they have an inhaler for asthma, help them use it.',
      icon: 'medical',
    },
    {
      step: 4,
      title: 'Fresh Air',
      description: 'Open windows or move to fresh air if possible.',
      icon: 'sunny',
    },
    {
      step: 5,
      title: 'Encourage Slow Breathing',
      description: 'Tell them to breathe slowly and deeply. Stay calm to help them stay calm.',
      warning: '⚠️ If breathing stops, begin CPR immediately',
      icon: 'pulse',
    },
  ],
  bleeding: [
    {
      step: 1,
      title: 'Apply Direct Pressure',
      description: 'Press firmly on the wound with a clean cloth or bandage.',
      icon: 'hand-left',
    },
    {
      step: 2,
      title: 'Elevate the Wound',
      description: 'If possible, raise the injured area above heart level.',
      warning: '⚠️ Do NOT elevate if bone is broken',
      icon: 'arrow-up',
    },
    {
      step: 3,
      title: 'Maintain Pressure',
      description: 'Do NOT remove the cloth even if blood soaks through. Add more cloth on top.',
      icon: 'layers',
    },
    {
      step: 4,
      title: 'Bandage When Bleeding Stops',
      description: 'Once bleeding slows, wrap firmly (but not too tight) with bandage.',
      icon: 'medkit',
    },
    {
      step: 5,
      title: 'Monitor for Shock',
      description: 'Watch for pale skin, rapid breathing, confusion. Keep person warm.',
      icon: 'eye',
    },
  ],
  neurological: [
    {
      step: 1,
      title: 'Note Time of Symptoms',
      description: 'Remember when symptoms started. This is critical for stroke treatment.',
      icon: 'time',
    },
    {
      step: 2,
      title: 'Keep Person Still',
      description: 'Do not let them walk or move. Keep them calm and comfortable.',
      icon: 'bed',
    },
    {
      step: 3,
      title: 'Turn on Side (If Vomiting)',
      description: 'If unconscious or vomiting, turn them on their side to prevent choking.',
      icon: 'swap-horizontal',
    },
    {
      step: 4,
      title: 'Do NOT Give Food/Drink',
      description: 'Do not give anything to eat or drink, even water.',
      warning: '⚠️ Risk of choking if swallowing is affected',
      icon: 'close-circle',
    },
    {
      step: 5,
      title: 'Monitor Breathing',
      description: 'Check breathing every 2 minutes. Be ready to perform CPR if needed.',
      icon: 'pulse',
    },
  ],
  burn: [
    {
      step: 1,
      title: 'Stop the Burning',
      description: 'Remove person from heat source. Put out flames with water or blanket.',
      icon: 'flame',
    },
    {
      step: 2,
      title: 'Cool the Burn',
      description: 'Run cool (not ice cold) water over burn for 10-20 minutes.',
      warning: '⚠️ Do NOT use ice - can cause more damage',
      icon: 'water',
    },
    {
      step: 3,
      title: 'Remove Jewelry/Tight Items',
      description: 'Remove rings, watches, belts before swelling occurs.',
      icon: 'remove-circle',
    },
    {
      step: 4,
      title: 'Cover with Clean Cloth',
      description: 'Cover burn loosely with sterile, non-stick bandage or clean cloth.',
      warning: '⚠️ Do NOT apply ointments, butter, or ice',
      icon: 'bandage',
    },
    {
      step: 5,
      title: 'Elevate if Possible',
      description: 'Raise burned area above heart level to reduce swelling.',
      icon: 'arrow-up',
    },
  ],
  poisoning: [
    {
      step: 1,
      title: 'Call Poison Control',
      description: 'Call emergency services immediately. Have substance container ready.',
      icon: 'call',
    },
    {
      step: 2,
      title: 'Do NOT Induce Vomiting',
      description: 'Unless instructed by poison control, do not make person vomit.',
      warning: '⚠️ Vomiting can cause more harm with some poisons',
      icon: 'close-circle',
    },
    {
      step: 3,
      title: 'If on Skin/Eyes',
      description: 'Remove contaminated clothing. Rinse skin/eyes with water for 15-20 minutes.',
      icon: 'water',
    },
    {
      step: 4,
      title: 'Keep Person Calm',
      description: 'Have them sit or lie down. Keep them calm and still.',
      icon: 'people',
    },
    {
      step: 5,
      title: 'Save the Container',
      description: 'Keep the poison container to show to paramedics.',
      icon: 'flask',
    },
  ],
  allergic: [
    {
      step: 1,
      title: 'Use EpiPen (If Available)',
      description: 'If person has an epinephrine auto-injector (EpiPen), use it immediately.',
      icon: 'medical',
    },
    {
      step: 2,
      title: 'Call Emergency Services',
      description: 'Call 911 even if EpiPen was used. Ambulance is still needed.',
      icon: 'call',
    },
    {
      step: 3,
      title: 'Position Properly',
      description: 'Lay person flat. Elevate legs unless they have breathing difficulty.',
      icon: 'bed',
    },
    {
      step: 4,
      title: 'Monitor Breathing',
      description: 'Watch for breathing problems. Be ready to perform CPR.',
      warning: '⚠️ Symptoms can worsen rapidly',
      icon: 'pulse',
    },
    {
      step: 5,
      title: 'Second Dose (If Needed)',
      description: 'If no improvement after 5-15 minutes and second EpiPen available, use it.',
      icon: 'reload',
    },
  ],
  fracture: [
    {
      step: 1,
      title: 'Do NOT Move Injured Area',
      description: 'Keep the broken bone as still as possible. Do not try to realign.',
      icon: 'hand-left',
    },
    {
      step: 2,
      title: 'Immobilize with Splint',
      description: 'Use rigid material (cardboard, sticks) to splint above and below break.',
      icon: 'construct',
    },
    {
      step: 3,
      title: 'Apply Ice',
      description: 'Apply ice pack wrapped in cloth for 20 minutes to reduce swelling.',
      warning: '⚠️ Do NOT apply ice directly to skin',
      icon: 'snow',
    },
    {
      step: 4,
      title: 'Elevate if Possible',
      description: 'Raise injured area above heart level to reduce swelling.',
      icon: 'arrow-up',
    },
    {
      step: 5,
      title: 'Check Circulation',
      description: 'Check if area below fracture is warm, pink, and has feeling.',
      icon: 'finger-print',
    },
  ],
  trauma: [
    {
      step: 1,
      title: 'Do NOT Move Person',
      description: 'Keep person still unless in immediate danger. Spinal injury possible.',
      warning: '⚠️ Moving can cause permanent paralysis if spine is injured',
      icon: 'stop',
    },
    {
      step: 2,
      title: 'Control Bleeding',
      description: 'Apply direct pressure to any bleeding wounds with clean cloth.',
      icon: 'medkit',
    },
    {
      step: 3,
      title: 'Stabilize Head/Neck',
      description: 'Place hands on both sides of head to keep it still. Do not move neck.',
      icon: 'person',
    },
    {
      step: 4,
      title: 'Monitor Consciousness',
      description: 'Talk to person to keep them alert. Watch for loss of consciousness.',
      icon: 'eye',
    },
    {
      step: 5,
      title: 'Keep Warm',
      description: 'Cover with blanket to prevent shock. Do not give food or water.',
      icon: 'thermometer',
    },
  ],
  general: [
    {
      step: 1,
      title: 'Stay Calm',
      description: 'Take deep breaths. Help is on the way.',
      icon: 'heart',
    },
    {
      step: 2,
      title: 'Assess the Situation',
      description: 'Check for immediate dangers. Ensure scene is safe.',
      icon: 'eye',
    },
    {
      step: 3,
      title: 'Check Responsiveness',
      description: 'Talk to the person. Check if they respond to voice or touch.',
      icon: 'people',
    },
    {
      step: 4,
      title: 'Check Breathing',
      description: 'Look, listen, and feel for breathing. Be ready to perform CPR.',
      icon: 'pulse',
    },
    {
      step: 5,
      title: 'Keep Person Comfortable',
      description: 'Keep them warm and calm until ambulance arrives.',
      icon: 'checkmark-circle',
    },
  ],
};

export const FirstAidGuide: React.FC<FirstAidGuideProps> = ({
  emergencyType,
  severity,
  visible,
  onClose,
  ambulanceETA,
}) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = firstAidData[emergencyType] || firstAidData.general;

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical':
        return '#DC2626'; // red-600
      case 'high':
        return '#EA580C'; // orange-600
      case 'medium':
        return '#F59E0B'; // amber-500
      default:
        return '#10B981'; // green-500
    }
  };

  const getEmergencyTitle = () => {
    const titles: Record<EmergencyType, string> = {
      cardiac: '💔 Cardiac Emergency',
      respiratory: '🫁 Breathing Emergency',
      neurological: '🧠 Neurological Emergency',
      bleeding: '🩸 Bleeding Emergency',
      poisoning: '☠️ Poisoning Emergency',
      allergic: '🤧 Allergic Reaction',
      burn: '🔥 Burn Emergency',
      fracture: '🦴 Fracture',
      trauma: '🚨 Trauma',
      general: '🏥 General Emergency',
    };
    return titles[emergencyType] || titles.general;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: getSeverityColor() }]}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>{getEmergencyTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {ambulanceETA && (
            <View style={styles.etaBanner}>
              <Ionicons name="car" size={24} color="#fff" />
              <Text style={styles.etaText}>
                Ambulance arriving in ~{ambulanceETA} minutes
              </Text>
            </View>
          )}
        </View>

        {/* First Aid Steps */}
        <ScrollView style={styles.scrollView}>
          <View style={styles.stepsContainer}>
            {steps.map((step) => (
              <TouchableOpacity
                key={step.step}
                style={styles.stepCard}
                onPress={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                activeOpacity={0.7}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.step}</Text>
                  </View>
                  
                  <View style={styles.stepTitleContainer}>
                    {step.icon && (
                      <Ionicons 
                        name={step.icon} 
                        size={24} 
                        color="#1F2937" 
                        style={styles.stepIcon}
                      />
                    )}
                    <Text style={styles.stepTitle}>{step.title}</Text>
                  </View>

                  <Ionicons
                    name={expandedStep === step.step ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#6B7280"
                  />
                </View>

                {expandedStep === step.step && (
                  <View style={styles.stepContent}>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                    
                    {step.warning && (
                      <View style={styles.warningBox}>
                        <Ionicons name="warning" size={20} color="#DC2626" />
                        <Text style={styles.warningText}>{step.warning}</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Important Reminders */}
          <View style={styles.reminderBox}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Important Reminders:</Text>
              <Text style={styles.reminderText}>
                • Stay calm and reassure the patient{'\n'}
                • Do not move the person unless absolutely necessary{'\n'}
                • Monitor breathing and consciousness{'\n'}
                • Keep them warm and comfortable{'\n'}
                • Wait for professional medical help
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  etaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  etaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  stepsContainer: {
    padding: 16,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    marginRight: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  stepContent: {
    marginTop: 12,
    paddingLeft: 48,
  },
  stepDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#DC2626',
    marginLeft: 8,
    fontWeight: '500',
  },
  reminderBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
});
