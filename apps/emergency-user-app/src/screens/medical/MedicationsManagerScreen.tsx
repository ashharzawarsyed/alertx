import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MedicationItem } from "../../components/medical/MedicationItem";
import {
  medicalProfileService,
  type Medication,
} from "../../services/medicalProfileService";

export default function MedicationsManagerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await medicalProfileService.getMedicalProfile();
      if (response.success && response.data?.medications) {
        setMedications(response.data.medications);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingIndex(null);
    setName("");
    setDosage("");
    setFrequency("");
    setPrescribedBy("");
    setIsActive(true);
    setShowModal(true);
  };

  const handleEdit = (index: number) => {
    const medication = medications[index];
    setEditingIndex(index);
    setName(medication.name);
    setDosage(medication.dosage || "");
    setFrequency(medication.frequency || "");
    setPrescribedBy(medication.prescribedBy || "");
    setIsActive(medication.isActive ?? true);
    setShowModal(true);
  };

  const handleDelete = (index: number) => {
    Alert.alert(
      "Delete Medication",
      "Are you sure you want to remove this medication?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = medications.filter((_, i) => i !== index);
            setMedications(updated);
          },
        },
      ]
    );
  };

  const handleSaveMedication = () => {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter the medication name.");
      return;
    }

    const newMedication: Medication = {
      name: name.trim(),
      dosage: dosage.trim() || undefined,
      frequency: frequency.trim() || undefined,
      prescribedBy: prescribedBy.trim() || undefined,
      isActive,
    };

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...medications];
      updated[editingIndex] = newMedication;
      setMedications(updated);
    } else {
      // Add new
      setMedications([...medications, newMedication]);
    }

    setShowModal(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);

    try {
      const response =
        await medicalProfileService.updateMedications(medications);
      if (response.success) {
        Alert.alert("Success", "Medications updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to update medications."
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const activeMedications = medications.filter((m) => m.isActive !== false);
  const inactiveMedications = medications.filter((m) => m.isActive === false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medications</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#1D4ED8" />
          <Text style={styles.infoText}>
            Keep your medication list current to help healthcare providers avoid
            dangerous interactions.
          </Text>
        </View>

        {/* Active Medications */}
        {activeMedications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Medications</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeMedications.length}</Text>
              </View>
            </View>
            {activeMedications.map((medication, index) => {
              const actualIndex = medications.findIndex(
                (m) => m === medication
              );
              return (
                <MedicationItem
                  key={actualIndex}
                  name={medication.name}
                  dosage={medication.dosage}
                  frequency={medication.frequency}
                  isActive={medication.isActive}
                  onPress={() => handleEdit(actualIndex)}
                  showDelete
                  onDelete={() => handleDelete(actualIndex)}
                />
              );
            })}
          </View>
        )}

        {/* Inactive Medications */}
        {inactiveMedications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Inactive Medications</Text>
              <View style={[styles.badge, styles.badgeInactive]}>
                <Text style={styles.badgeText}>
                  {inactiveMedications.length}
                </Text>
              </View>
            </View>
            {inactiveMedications.map((medication, index) => {
              const actualIndex = medications.findIndex(
                (m) => m === medication
              );
              return (
                <MedicationItem
                  key={actualIndex}
                  name={medication.name}
                  dosage={medication.dosage}
                  frequency={medication.frequency}
                  isActive={medication.isActive}
                  onPress={() => handleEdit(actualIndex)}
                  showDelete
                  onDelete={() => handleDelete(actualIndex)}
                />
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Medications Recorded</Text>
            <Text style={styles.emptySubtitle}>
              Add your current and past medications for better care
            </Text>
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#3B82F6" />
          <Text style={styles.addButtonText}>Add Medication</Text>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveAll}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingIndex !== null ? "Edit Medication" : "Add Medication"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Medication Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Medication Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Lisinopril, Metformin"
                  autoFocus
                />
              </View>

              {/* Dosage */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dosage</Text>
                <TextInput
                  style={styles.formInput}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="e.g., 10mg, 500mg"
                />
              </View>

              {/* Frequency */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency</Text>
                <TextInput
                  style={styles.formInput}
                  value={frequency}
                  onChangeText={setFrequency}
                  placeholder="e.g., Once daily, Twice a day"
                />
              </View>

              {/* Prescribed By */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Prescribed By</Text>
                <TextInput
                  style={styles.formInput}
                  value={prescribedBy}
                  onChangeText={setPrescribedBy}
                  placeholder="Doctor's name"
                />
              </View>

              {/* Active Status */}
              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <View style={styles.switchLabel}>
                    <Text style={styles.formLabel}>Currently Taking</Text>
                    <Text style={styles.switchHint}>
                      Toggle off if you&apos;ve stopped taking this medication
                    </Text>
                  </View>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                    thumbColor={isActive ? "#3B82F6" : "#F3F4F6"}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.modalButton, styles.modalButtonSecondary]}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveMedication}
                style={[styles.modalButton, styles.modalButtonPrimary]}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {editingIndex !== null ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeInactive: {
    backgroundColor: "#9CA3AF",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  formInput: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    flex: 1,
  },
  switchHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalButtonPrimary: {
    backgroundColor: "#3B82F6",
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
