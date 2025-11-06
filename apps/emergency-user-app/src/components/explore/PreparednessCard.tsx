import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EmergencyPreparedness } from "../../services/exploreService";

interface PreparednessCardProps {
  item: EmergencyPreparedness;
  onOpen?: () => void;
  onClose?: () => void;
}

const BOTTOM_BAR_HEIGHT = 72;

export default function PreparednessCard({
  item,
  onOpen,
  onClose,
}: PreparednessCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const insets = useSafeAreaInsets();

  const handleOpen = () => {
    setShowModal(true);
    onOpen?.();
  };

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  // Load saved progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const storageKey = `preparedness_${item.id}`;
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) {
          const itemsArray = JSON.parse(saved);
          setCheckedItems(new Set(itemsArray));
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };
    loadProgress();
  }, [item.id]);

  const getStorageKey = () => `preparedness_${item.id}`;

  const saveProgress = async (items: Set<number>) => {
    try {
      const itemsArray = Array.from(items);
      await AsyncStorage.setItem(getStorageKey(), JSON.stringify(itemsArray));
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const toggleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
    saveProgress(newChecked);
  };

  const progress = (checkedItems.size / item.checklist.length) * 100;

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      Preparation: "#3B82F6",
      Travel: "#8B5CF6",
      Safety: "#EF4444",
      Health: "#10B981",
      Communication: "#F59E0B",
      Work: "#6366F1",
    };
    return colors[category] || "#6B7280";
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getCategoryColor(item.category) + "20" },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={28}
            color={getCategoryColor(item.category)}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          {/* Progress bar on card */}
          <View style={styles.cardProgressContainer}>
            <View style={styles.cardProgressBar}>
              <View
                style={[
                  styles.cardProgressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: getCategoryColor(item.category),
                  },
                ]}
              />
            </View>
            <Text style={styles.cardProgressText}>
              {checkedItems.size}/{item.checklist.length}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.checklistInfo}>
              <Ionicons
                name={
                  progress === 100 ? "checkmark-circle" : "checkbox-outline"
                }
                size={16}
                color={
                  progress === 100 ? getCategoryColor(item.category) : "#6B7280"
                }
              />
              <Text
                style={[
                  styles.checklistText,
                  progress === 100 && {
                    color: getCategoryColor(item.category),
                    fontWeight: "600",
                  },
                ]}
              >
                {progress === 100
                  ? "Completed!"
                  : `${Math.round(progress)}% complete`}
              </Text>
            </View>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(item.category) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(item.category) },
                ]}
              >
                {item.category}
              </Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Detail Modal with Checklist */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View
          style={[
            styles.modalOverlay,
            { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT },
          ]}
        >
          <View
            style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View
                  style={[
                    styles.modalIcon,
                    { backgroundColor: getCategoryColor(item.category) + "20" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={32}
                    color={getCategoryColor(item.category)}
                  />
                </View>
                <View style={styles.modalTitleText}>
                  <Text style={styles.modalTitle}>{item.title}</Text>
                  <Text style={styles.modalSubtitle}>{item.description}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {checkedItems.size} of {item.checklist.length} completed
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(progress)}%
                  </Text>
                </View>
                {checkedItems.size > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => {
                      setCheckedItems(new Set());
                      saveProgress(new Set());
                    }}
                  >
                    <Ionicons name="refresh" size={16} color="#EF4444" />
                    <Text style={styles.clearButtonText}>Reset</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: getCategoryColor(item.category),
                    },
                  ]}
                />
              </View>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
            >
              {/* Completion Banner */}
              {progress === 100 && (
                <View style={styles.completionBanner}>
                  <Ionicons name="trophy" size={32} color="#F59E0B" />
                  <View style={styles.completionText}>
                    <Text style={styles.completionTitle}>
                      🎉 Congratulations!
                    </Text>
                    <Text style={styles.completionSubtext}>
                      You&apos;ve completed this preparedness checklist. Stay
                      safe and review regularly!
                    </Text>
                  </View>
                </View>
              )}

              {/* Checklist */}
              <View style={styles.checklist}>
                {item.checklist.map((checkItem, index) => {
                  const isChecked = checkedItems.has(index);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.checklistItem,
                        isChecked && styles.checklistItemChecked,
                      ]}
                      onPress={() => toggleCheck(index)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isChecked && {
                            backgroundColor: getCategoryColor(item.category),
                            borderColor: getCategoryColor(item.category),
                          },
                        ]}
                      >
                        {isChecked && (
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.checklistItemText,
                          isChecked && styles.checklistItemTextChecked,
                        ]}
                      >
                        {checkItem}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Info Callout */}
              <View style={styles.infoCallout}>
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <View style={styles.infoText}>
                  <Text style={styles.infoTitle}>Regular Review</Text>
                  <Text style={styles.infoSubtext}>
                    Review and update your preparedness checklist regularly to
                    ensure everything is current and accessible.
                  </Text>
                </View>
              </View>

              {/* Bottom padding to avoid tab bar overlap */}
              <View style={{ height: insets.bottom + 16 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  cardProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  cardProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardProgressText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    minWidth: 35,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checklistInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  checklistText: {
    fontSize: 12,
    color: "#6B7280",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalTitleText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#FEE2E2",
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  modalScroll: {
    flex: 1,
  },
  completionBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 16,
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FCD34D",
  },
  completionText: {
    flex: 1,
    marginLeft: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  completionSubtext: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  checklist: {
    padding: 20,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
  },
  checklistItemChecked: {
    backgroundColor: "#F0FDF4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checklistItemText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  checklistItemTextChecked: {
    color: "#6B7280",
    textDecorationLine: "line-through",
  },
  infoCallout: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E40AF",
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 18,
  },
});
