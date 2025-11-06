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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  medicalProfileService,
  type MedicalCondition,
} from "../../services/medicalProfileService";

const SEVERITY_LEVELS = [
  { value: "mild", label: "Mild", icon: "ellipse", color: "#10B981" },
  {
    value: "moderate",
    label: "Moderate",
    icon: "alert-circle",
    color: "#F59E0B",
  },
  { value: "severe", label: "Severe", icon: "warning", color: "#EF4444" },
];

export default function MedicalConditionsManagerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [condition, setCondition] = useState("");
  const [severity, setSeverity] =
    useState<MedicalCondition["severity"]>("mild");
  const [diagnosedDate, setDiagnosedDate] = useState("");
  const [treatingPhysician, setTreatingPhysician] = useState("");

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const response = await medicalProfileService.getMedicalProfile();
      if (response.success && response.data?.medicalConditions) {
        setConditions(response.data.medicalConditions);
      }
    } catch (error) {
      console.error("Error fetching medical conditions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingIndex(null);
    setCondition("");
    setSeverity("mild");
    setDiagnosedDate("");
    setTreatingPhysician("");
    setShowModal(true);
  };

  const handleEdit = (index: number) => {
    const cond = conditions[index];
    setEditingIndex(index);
    setCondition(cond.condition);
    setSeverity(cond.severity || "mild");
    setDiagnosedDate(cond.diagnosedDate || "");
    setTreatingPhysician(cond.treatingPhysician || "");
    setShowModal(true);
  };

  const handleDelete = (index: number) => {
    Alert.alert(
      "Delete Condition",
      "Are you sure you want to remove this medical condition?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = conditions.filter((_, i) => i !== index);
            setConditions(updated);
          },
        },
      ]
    );
  };

  const handleSaveCondition = () => {
    if (!condition.trim()) {
      Alert.alert("Missing Information", "Please enter the condition name.");
      return;
    }

    const newCondition: MedicalCondition = {
      condition: condition.trim(),
      severity,
      diagnosedDate: diagnosedDate.trim() || undefined,
      treatingPhysician: treatingPhysician.trim() || undefined,
    };

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...conditions];
      updated[editingIndex] = newCondition;
      setConditions(updated);
    } else {
      // Add new
      setConditions([...conditions, newCondition]);
    }

    setShowModal(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);

    try {
      const response =
        await medicalProfileService.updateMedicalConditions(conditions);
      if (response.success) {
        Alert.alert("Success", "Medical conditions updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to update medical conditions."
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    const level = SEVERITY_LEVELS.find((s) => s.value === sev);
    return level?.color || "#10B981";
  };

  const getSeverityIcon = (sev: string) => {
    const level = SEVERITY_LEVELS.find((s) => s.value === sev);
    return level?.icon || "ellipse";
  };

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
        colors={["#8B5CF6", "#7C3AED"]}
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
          <Text style={styles.headerTitle}>Medical Conditions</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="clipboard" size={24} color="#6D28D9" />
          <Text style={styles.infoText}>
            Document your medical conditions to ensure appropriate emergency
            care and treatment.
          </Text>
        </View>

        {/* Conditions List */}
        {conditions.length > 0 ? (
          <View style={styles.conditionsList}>
            {conditions.map((cond, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleEdit(index)}
                style={styles.conditionCard}
              >
                <View style={styles.conditionHeader}>
                  <View style={styles.conditionTitleRow}>
                    <Ionicons
                      name={getSeverityIcon(cond.severity || "mild") as any}
                      size={20}
                      color={getSeverityColor(cond.severity || "mild")}
                    />
                    <Text style={styles.conditionName}>{cond.condition}</Text>
                  </View>
                  <View style={styles.conditionActions}>
                    <View
                      style={[
                        styles.severityBadge,
                        {
                          backgroundColor:
                            getSeverityColor(cond.severity || "mild") + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityBadgeText,
                          { color: getSeverityColor(cond.severity || "mild") },
                        ]}
                      >
                        {cond.severity?.toUpperCase() || "MILD"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(index)}
                      style={styles.deleteButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {(cond.diagnosedDate || cond.treatingPhysician) && (
                  <View style={styles.conditionDetails}>
                    {cond.diagnosedDate && (
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color="#6B7280"
                        />
                        <Text style={styles.detailText}>
                          Diagnosed: {cond.diagnosedDate}
                        </Text>
                      </View>
                    )}
                    {cond.treatingPhysician && (
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color="#6B7280"
                        />
                        <Text style={styles.detailText}>
                          Doctor: {cond.treatingPhysician}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Medical Conditions</Text>
            <Text style={styles.emptySubtitle}>
              Add any chronic conditions or diagnoses
            </Text>
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#8B5CF6" />
          <Text style={styles.addButtonText}>Add Medical Condition</Text>
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
                {editingIndex !== null
                  ? "Edit Condition"
                  : "Add Medical Condition"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Condition Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Condition Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={condition}
                  onChangeText={setCondition}
                  placeholder="e.g., Type 2 Diabetes, Asthma, Hypertension"
                  autoFocus
                />
              </View>

              {/* Severity Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Severity *</Text>
                <View style={styles.severityButtons}>
                  {SEVERITY_LEVELS.map((level) => (
                    <TouchableOpacity
                      key={level.value}
                      onPress={() =>
                        setSeverity(level.value as MedicalCondition["severity"])
                      }
                      style={[
                        styles.severityButton,
                        severity === level.value && {
                          backgroundColor: level.color + "20",
                          borderColor: level.color,
                        },
                      ]}
                    >
                      <Ionicons
                        name={level.icon as any}
                        size={20}
                        color={
                          severity === level.value ? level.color : "#9CA3AF"
                        }
                      />
                      <Text
                        style={[
                          styles.severityButtonText,
                          severity === level.value && { color: level.color },
                        ]}
                      >
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Diagnosed Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Diagnosed Date (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={diagnosedDate}
                  onChangeText={setDiagnosedDate}
                  placeholder="e.g., January 2020, 2020"
                />
                <Text style={styles.helperText}>
                  Enter approximate date or year of diagnosis
                </Text>
              </View>

              {/* Treating Physician */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Treating Physician (Optional)
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={treatingPhysician}
                  onChangeText={setTreatingPhysician}
                  placeholder="e.g., Dr. Sarah Johnson"
                />
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
                onPress={handleSaveCondition}
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
    backgroundColor: "#F5F3FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9D5FF",
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#5B21B6",
    lineHeight: 20,
  },
  conditionsList: {
    marginBottom: 24,
  },
  conditionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  conditionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  conditionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  conditionActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  deleteButton: {
    padding: 4,
  },
  conditionDetails: {
    gap: 6,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: "#6B7280",
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
    borderColor: "#8B5CF6",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#8B5CF6",
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
  helperText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  severityButtons: {
    gap: 8,
  },
  severityButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  severityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9CA3AF",
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
    backgroundColor: "#8B5CF6",
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
