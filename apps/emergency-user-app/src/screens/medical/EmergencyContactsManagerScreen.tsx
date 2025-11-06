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
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  medicalProfileService,
  type EmergencyContact,
} from "../../services/medicalProfileService";

export default function EmergencyContactsManagerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await medicalProfileService.getMedicalProfile();
      if (response.success && response.data?.emergencyContacts) {
        setContacts(response.data.emergencyContacts);
      }
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingIndex(null);
    setName("");
    setRelationship("");
    setPhone("");
    setEmail("");
    setIsPrimary(false);
    setShowModal(true);
  };

  const handleEdit = (index: number) => {
    const contact = contacts[index];
    setEditingIndex(index);
    setName(contact.name);
    setRelationship(contact.relationship);
    setPhone(contact.phone);
    setEmail(contact.email || "");
    setIsPrimary(contact.isPrimary || false);
    setShowModal(true);
  };

  const handleDelete = (index: number) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to remove this emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = contacts.filter((_, i) => i !== index);
            setContacts(updated);
          },
        },
      ]
    );
  };

  const handleSaveContact = () => {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Please enter the contact's name.");
      return;
    }
    if (!relationship.trim()) {
      Alert.alert("Missing Information", "Please enter the relationship.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Missing Information", "Please enter a phone number.");
      return;
    }

    const newContact: EmergencyContact = {
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      isPrimary,
    };

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...contacts];
      updated[editingIndex] = newContact;
      setContacts(updated);
    } else {
      // Add new
      setContacts([...contacts, newContact]);
    }

    setShowModal(false);
  };

  const handleSaveAll = async () => {
    // Ensure only one primary contact
    const primaryCount = contacts.filter((c) => c.isPrimary).length;
    if (primaryCount > 1) {
      Alert.alert(
        "Multiple Primary Contacts",
        "Only one contact can be marked as primary."
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await medicalProfileService.updateEmergencyContacts(contacts);
      if (response.success) {
        Alert.alert("Success", "Emergency contacts updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to update emergency contacts."
        );
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const primaryContact = contacts.find((c) => c.isPrimary);
  const otherContacts = contacts.filter((c) => !c.isPrimary);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Modern Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Emergency Contacts</Text>
          <Text style={styles.topBarSubtitle}>
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="heart-circle" size={24} color="#DC2626" />
          <Text style={styles.infoText}>
            These contacts will be notified in case of an emergency. Keep this
            information current.
          </Text>
        </View>

        {/* Primary Contact */}
        {primaryContact && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={20} color="#EAB308" />
              <Text style={styles.sectionTitle}>Primary Contact</Text>
            </View>
            <View style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View style={[styles.avatar, styles.avatarPrimary]}>
                  <Text style={styles.avatarText}>
                    {getInitials(primaryContact.name)}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{primaryContact.name}</Text>
                  <Text style={styles.contactRelationship}>
                    {primaryContact.relationship}
                  </Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    onPress={() =>
                      handleEdit(
                        contacts.findIndex((c) => c === primaryContact)
                      )
                    }
                    style={styles.iconButton}
                  >
                    <Ionicons name="create-outline" size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleDelete(
                        contacts.findIndex((c) => c === primaryContact)
                      )
                    }
                    style={styles.iconButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.contactDetails}>
                <TouchableOpacity
                  onPress={() => handleCall(primaryContact.phone)}
                  style={styles.detailRow}
                >
                  <Ionicons name="call" size={20} color="#10B981" />
                  <Text style={styles.detailText}>{primaryContact.phone}</Text>
                </TouchableOpacity>
                {primaryContact.email && (
                  <View style={styles.detailRow}>
                    <Ionicons name="mail" size={20} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {primaryContact.email}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Other Contacts */}
        {otherContacts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Other Contacts</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{otherContacts.length}</Text>
              </View>
            </View>
            {otherContacts.map((contact, idx) => {
              const actualIndex = contacts.findIndex((c) => c === contact);
              return (
                <View key={actualIndex} style={styles.contactCard}>
                  <View style={styles.contactHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(contact.name)}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactRelationship}>
                        {contact.relationship}
                      </Text>
                    </View>
                    <View style={styles.contactActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(actualIndex)}
                        style={styles.iconButton}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color="#3B82F6"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(actualIndex)}
                        style={styles.iconButton}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.contactDetails}>
                    <TouchableOpacity
                      onPress={() => handleCall(contact.phone)}
                      style={styles.detailRow}
                    >
                      <Ionicons name="call" size={20} color="#10B981" />
                      <Text style={styles.detailText}>{contact.phone}</Text>
                    </TouchableOpacity>
                    {contact.email && (
                      <View style={styles.detailRow}>
                        <Ionicons name="mail" size={20} color="#6B7280" />
                        <Text style={styles.detailText}>{contact.email}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {contacts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
            <Text style={styles.emptySubtitle}>
              Add at least one person to contact in emergencies
            </Text>
          </View>
        )}

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
                  ? "Edit Contact"
                  : "Add Emergency Contact"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., John Smith"
                  autoFocus
                />
              </View>

              {/* Relationship */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Relationship *</Text>
                <TextInput
                  style={styles.formInput}
                  value={relationship}
                  onChangeText={setRelationship}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.formInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="e.g., (555) 123-4567"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email (Optional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="e.g., email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Primary Status */}
              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <View style={styles.switchLabel}>
                    <Text style={styles.formLabel}>Primary Contact</Text>
                    <Text style={styles.switchHint}>
                      This contact will be notified first
                    </Text>
                  </View>
                  <Switch
                    value={isPrimary}
                    onValueChange={setIsPrimary}
                    trackColor={{ false: "#D1D5DB", true: "#FCA5A5" }}
                    thumbColor={isPrimary ? "#EF4444" : "#F3F4F6"}
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
                onPress={handleSaveContact}
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
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarCenter: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  topBarSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
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
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  contactCard: {
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
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPrimary: {
    backgroundColor: "#FEE2E2",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E40AF",
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 14,
    color: "#6B7280",
  },
  contactActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  contactDetails: {
    gap: 8,
    paddingLeft: 60,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
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

  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF4444",
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
    backgroundColor: "#EF4444",
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
