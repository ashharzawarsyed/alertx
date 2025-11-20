import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { symptomAnalyzer, SymptomInput } from '../services/symptomAnalyzer';

interface EmergencySymptomModalProps {
  visible: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: any) => void;
  userLocation: { lat: number; lng: number };
}

export const EmergencySymptomModal: React.FC<EmergencySymptomModalProps> = ({
  visible,
  onClose,
  onAnalysisComplete,
  userLocation,
}) => {
  const [selectedQuickSymptoms, setSelectedQuickSymptoms] = useState<string[]>([]);
  const [symptomDescription, setSymptomDescription] = useState('');
  const [urgency, setUrgency] = useState<'immediate' | 'urgent' | 'moderate'>('urgent');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const quickSymptoms = symptomAnalyzer.getQuickSymptomOptions();

  const handleQuickSymptomToggle = (symptom: string) => {
    if (selectedQuickSymptoms.includes(symptom)) {
      setSelectedQuickSymptoms(selectedQuickSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedQuickSymptoms([...selectedQuickSymptoms, symptom]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedQuickSymptoms.length === 0 && !symptomDescription.trim()) {
      alert('Please select symptoms or describe the emergency');
      return;
    }

    setIsAnalyzing(true);

    try {
      const input: SymptomInput = {
        description: symptomDescription,
        quickSymptoms: selectedQuickSymptoms,
        urgency,
      };

      const analysis = await symptomAnalyzer.analyzeSymptoms(input);

      console.log('✅ Analysis result:', analysis);
      
      onAnalysisComplete(analysis);
      
      // Reset form
      setSelectedQuickSymptoms([]);
      setSymptomDescription('');
      setUrgency('urgent');

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      alert('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    setSelectedQuickSymptoms([]);
    setSymptomDescription('');
    setUrgency('urgent');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚨 Emergency Details</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Urgency Level */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How urgent is this?</Text>
            <View style={styles.urgencyButtons}>
              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'immediate' && styles.urgencyButtonActive,
                  { borderColor: '#DC2626' },
                ]}
                onPress={() => setUrgency('immediate')}
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    urgency === 'immediate' && styles.urgencyButtonTextActive,
                  ]}
                >
                  🚨 Immediate
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'urgent' && styles.urgencyButtonActive,
                  { borderColor: '#F59E0B' },
                ]}
                onPress={() => setUrgency('urgent')}
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    urgency === 'urgent' && styles.urgencyButtonTextActive,
                  ]}
                >
                  ⚠️ Urgent
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'moderate' && styles.urgencyButtonActive,
                  { borderColor: '#10B981' },
                ]}
                onPress={() => setUrgency('moderate')}
              >
                <Text
                  style={[
                    styles.urgencyButtonText,
                    urgency === 'moderate' && styles.urgencyButtonTextActive,
                  ]}
                >
                  📋 Moderate
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Symptoms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select symptoms (tap all that apply)</Text>
            <View style={styles.quickSymptomsGrid}>
              {quickSymptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.quickSymptomChip,
                    selectedQuickSymptoms.includes(symptom) && styles.quickSymptomChipActive,
                  ]}
                  onPress={() => handleQuickSymptomToggle(symptom)}
                >
                  <Text
                    style={[
                      styles.quickSymptomText,
                      selectedQuickSymptoms.includes(symptom) && styles.quickSymptomTextActive,
                    ]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Detailed Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional details (optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what happened... (e.g., 'Fell from ladder', 'Sudden chest pain', 'Difficulty breathing')"
              multiline
              numberOfLines={4}
              value={symptomDescription}
              onChangeText={setSymptomDescription}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>AI-Powered Analysis</Text>
              <Text style={styles.infoText}>
                Our AI will analyze your symptoms using natural language processing to:
                {'\n'}• Determine severity level
                {'\n'}• Select appropriate ambulance type
                {'\n'}• Provide first aid instructions
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isAnalyzing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="flash" size={20} color="#fff" />
                <Text style={styles.analyzeButtonText}>Analyze & Dispatch</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  urgencyButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  urgencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  urgencyButtonTextActive: {
    color: '#fff',
  },
  quickSymptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSymptomChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  quickSymptomChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  quickSymptomText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  quickSymptomTextActive: {
    color: '#fff',
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  analyzeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    gap: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
