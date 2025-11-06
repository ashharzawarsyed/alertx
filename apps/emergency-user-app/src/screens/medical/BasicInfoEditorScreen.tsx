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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  medicalProfileService,
  type BasicMedicalInfo,
} from "../../services/medicalProfileService";

const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];

export default function BasicInfoEditorScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bloodType, setBloodType] = useState<string>("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();

  useEffect(() => {
    fetchCurrentData();
  }, []);

  const fetchCurrentData = async () => {
    try {
      const response = await medicalProfileService.getMedicalProfile();
      if (response.success && response.data) {
        const profile = response.data;
        setBloodType(profile.bloodType || "");
        setHeightFeet(profile.height?.feet.toString() || "");
        setHeightInches(profile.height?.inches.toString() || "");
        setWeight(profile.weight?.value.toString() || "");
        if (profile.weight?.unit) {
          setWeightUnit(profile.weight.unit as "lbs" | "kg");
        }
        if (profile.dateOfBirth) {
          setDateOfBirth(new Date(profile.dateOfBirth));
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!bloodType) {
      Alert.alert("Missing Information", "Please select a blood type.");
      return;
    }

    const feet = parseInt(heightFeet);
    const inches = parseInt(heightInches);
    const weightValue = parseFloat(weight);

    if (heightFeet && (isNaN(feet) || feet < 1 || feet > 8)) {
      Alert.alert("Invalid Height", "Feet must be between 1 and 8.");
      return;
    }

    if (heightInches && (isNaN(inches) || inches < 0 || inches > 11)) {
      Alert.alert("Invalid Height", "Inches must be between 0 and 11.");
      return;
    }

    if (
      weight &&
      (isNaN(weightValue) || weightValue < 1 || weightValue > 1000)
    ) {
      Alert.alert("Invalid Weight", "Please enter a valid weight.");
      return;
    }

    setSaving(true);

    const data: BasicMedicalInfo = {
      bloodType: bloodType as BasicMedicalInfo["bloodType"],
      ...(heightFeet && heightInches
        ? {
            height: {
              feet,
              inches,
            },
          }
        : {}),
      ...(weight
        ? {
            weight: {
              value: weightValue,
              unit: weightUnit,
            },
          }
        : {}),
      ...(dateOfBirth
        ? {
            dateOfBirth: dateOfBirth.toISOString(),
          }
        : {}),
    };

    try {
      const response = await medicalProfileService.updateBasicInfo(data);
      if (response.success) {
        Alert.alert("Success", "Basic information updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to update information."
        );
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
          <Text style={styles.headerTitle}>Basic Information</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Blood Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Blood Type *</Text>
          <View style={styles.bloodTypeGrid}>
            {BLOOD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setBloodType(type)}
                style={[
                  styles.bloodTypeButton,
                  bloodType === type && styles.bloodTypeButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.bloodTypeText,
                    bloodType === type && styles.bloodTypeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Height */}
        <View style={styles.section}>
          <Text style={styles.label}>Height</Text>
          <View style={styles.heightContainer}>
            <View style={styles.heightInput}>
              <TextInput
                style={styles.input}
                value={heightFeet}
                onChangeText={setHeightFeet}
                placeholder="0"
                keyboardType="number-pad"
                maxLength={1}
              />
              <Text style={styles.heightUnit}>feet</Text>
            </View>
            <View style={styles.heightInput}>
              <TextInput
                style={styles.input}
                value={heightInches}
                onChangeText={setHeightInches}
                placeholder="0"
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.heightUnit}>inches</Text>
            </View>
          </View>
        </View>

        {/* Weight */}
        <View style={styles.section}>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.weightContainer}>
            <TextInput
              style={[styles.input, styles.weightInput]}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              keyboardType="decimal-pad"
            />
            <View style={styles.unitToggle}>
              <TouchableOpacity
                onPress={() => setWeightUnit("lbs")}
                style={[
                  styles.unitButton,
                  weightUnit === "lbs" && styles.unitButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    weightUnit === "lbs" && styles.unitButtonTextActive,
                  ]}
                >
                  lbs
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWeightUnit("kg")}
                style={[
                  styles.unitButton,
                  weightUnit === "kg" && styles.unitButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    weightUnit === "kg" && styles.unitButtonTextActive,
                  ]}
                >
                  kg
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.section}>
          <Text style={styles.label}>Date of Birth (Optional)</Text>
          <Text style={styles.helperText}>
            Current:{" "}
            {dateOfBirth ? dateOfBirth.toLocaleDateString() : "Not set"}
          </Text>
          <Text style={styles.note}>
            Note: Date picker will be added in next update
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Information</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  bloodTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  bloodTypeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  bloodTypeButtonActive: {
    borderColor: "#EF4444",
    backgroundColor: "#FEE2E2",
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  bloodTypeTextActive: {
    color: "#DC2626",
  },
  heightContainer: {
    flexDirection: "row",
    gap: 12,
  },
  heightInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  heightUnit: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  weightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weightInput: {
    flex: 1,
  },
  unitToggle: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  unitButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  unitButtonActive: {
    backgroundColor: "#3B82F6",
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  dateText: {
    fontSize: 16,
    color: "#111827",
  },
  helperText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 8,
  },
  note: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 4,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
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
});
