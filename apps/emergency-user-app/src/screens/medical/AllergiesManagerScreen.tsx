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
import { AllergyBadge } from "../../components/medical/AllergyBadge";
import {
  medicalProfileService,
  type Allergy,
} from "../../services/medicalProfileService";

const SEVERITY_LEVELS = [
  { value: "mild", label: "Mild", color: "#FEF3C7" },
  { value: "moderate", label: "Moderate", color: "#FED7AA" },
  { value: "severe", label: "Severe", color: "#FECACA" },
  { value: "life-threatening", label: "Life-Threatening", color: "#FEE2E2" },
];

export default function AllergiesManagerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState<Allergy["severity"]>("mild");
  const [reaction, setReaction] = useState("");

  useEffect(() => {
    fetchAllergies();
  }, []);

  const fetchAllergies = async () => {
    try {
      const response = await medicalProfileService.getMedicalProfile();
      if (response.success && response.data?.allergies) {
        setAllergies(response.data.allergies);
      }
    } catch (error) {
      console.error("Error fetching allergies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingIndex(null);
    setAllergen("");
    setSeverity("mild");
    setReaction("");
    setShowModal(true);
  };

  const handleEdit = (index: number) => {
    const allergy = allergies[index];
    setEditingIndex(index);
    setAllergen(allergy.allergen);
    setSeverity(allergy.severity);
    setReaction(allergy.reaction || "");
    setShowModal(true);
  };

  const handleDelete = (index: number) => {
    Alert.alert(
      "Delete Allergy",
      "Are you sure you want to remove this allergy?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = allergies.filter((_, i) => i !== index);
            setAllergies(updated);
          },
        },
      ]
    );
  };

  const handleSaveAllergy = () => {
    if (!allergen.trim()) {
      Alert.alert("Missing Information", "Please enter the allergen name.");
      return;
    }

    const newAllergy: Allergy = {
      allergen: allergen.trim(),
      severity,
      reaction: reaction.trim() || undefined,
    };

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...allergies];
      updated[editingIndex] = newAllergy;
      setAllergies(updated);
    } else {
      // Add new
      setAllergies([...allergies, newAllergy]);
    }

    setShowModal(false);
  };

  const handleSaveAll = async () => {
    setSaving(true);

    try {
      const response = await medicalProfileService.updateAllergies(allergies);
      if (response.success) {
        Alert.alert("Success", "Allergies updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to update allergies.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
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
        colors={["#F59E0B", "#D97706"]}
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
          <Text style={styles.headerTitle}>Allergies</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Warning Box */}
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={24} color="#DC2626" />
          <Text style={styles.warningText}>
            Accurate allergy information is critical for emergency care. Please
            keep this list up to date.
          </Text>
        </View>

        {/* Allergies List */}
        {allergies.length > 0 ? (
          <View style={styles.allergiesList}>
            {allergies.map((allergy, index) => (
              <AllergyBadge
                key={index}
                allergen={allergy.allergen}
                severity={allergy.severity}
                reaction={allergy.reaction}
                onPress={() => handleEdit(index)}
                showDelete
                onDelete={() => handleDelete(index)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="shield-checkmark-outline"
              size={64}
              color="#D1D5DB"
            />
            <Text style={styles.emptyTitle}>No Allergies Recorded</Text>
            <Text style={styles.emptySubtitle}>
              Tap the button below to add your first allergy
            </Text>
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
          <Ionicons name="add-circle" size={24} color="#F59E0B" />
          <Text style={styles.addButtonText}>Add Allergy</Text>
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
                {editingIndex !== null ? "Edit Allergy" : "Add Allergy"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Allergen Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Allergen *</Text>
              <TextInput
                style={styles.formInput}
                value={allergen}
                onChangeText={setAllergen}
                placeholder="e.g., Peanuts, Penicillin, Latex"
                autoFocus
              />
            </View>

            {/* Severity Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Severity *</Text>
              <View style={styles.severityGrid}>
                {SEVERITY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    onPress={() =>
                      setSeverity(level.value as Allergy["severity"])
                    }
                    style={[
                      styles.severityButton,
                      severity === level.value && styles.severityButtonActive,
                      { borderColor: level.color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityButtonText,
                        severity === level.value &&
                          styles.severityButtonTextActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reaction Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Reaction (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={reaction}
                onChangeText={setReaction}
                placeholder="Describe the reaction symptoms..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.modalButton, styles.modalButtonSecondary]}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveAllergy}
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
  warningBox: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
  },
  allergiesList: {
    marginBottom: 24,
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
    borderColor: "#F59E0B",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F59E0B",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F59E0B",
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
    maxHeight: "80%",
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
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: "top",
  },
  severityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  severityButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    minWidth: "48%",
    alignItems: "center",
  },
  severityButtonActive: {
    backgroundColor: "#FEF3C7",
  },
  severityButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  severityButtonTextActive: {
    color: "#92400E",
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
    backgroundColor: "#F59E0B",
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
