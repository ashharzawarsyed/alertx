import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { FirstAidGuide } from "../../services/exploreService";

interface FirstAidCardProps {
  guide: FirstAidGuide;
  onOpen?: () => void;
  onClose?: () => void;
}

const BOTTOM_BAR_HEIGHT = 72;

export default function FirstAidCard({
  guide,
  onOpen,
  onClose,
}: FirstAidCardProps) {
  const [showModal, setShowModal] = useState(false);
  const insets = useSafeAreaInsets();

  const handleOpen = () => {
    setShowModal(true);
    onOpen?.();
  };

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  const getPriorityColor = (priority: string): string => {
    const colors: { [key: string]: string } = {
      high: "#EF4444",
      medium: "#F59E0B",
      low: "#10B981",
    };
    return colors[priority] || "#6B7280";
  };

  const getPriorityBg = (priority: string): string => {
    const colors: { [key: string]: string } = {
      high: "#FEE2E2",
      medium: "#FEF3C7",
      low: "#D1FAE5",
    };
    return colors[priority] || "#F3F4F6";
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={handleOpen}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getPriorityBg(guide.priority) },
            ]}
          >
            <Ionicons
              name={guide.icon as any}
              size={24}
              color={getPriorityColor(guide.priority)}
            />
          </View>

          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={2}>
              {guide.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {guide.description}
            </Text>
            <View style={styles.footer}>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityBg(guide.priority) },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(guide.priority) },
                  ]}
                >
                  {guide.priority.toUpperCase()} PRIORITY
                </Text>
              </View>
              <Text style={styles.categoryText}>{guide.category}</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View style={[
            styles.modalOverlay,
            { paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT },
          ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleClose}
            style={styles.modalBackdrop}
          />
          <View
            style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}
          >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View
                  style={[
                    styles.modalIcon,
                    { backgroundColor: getPriorityBg(guide.priority) },
                  ]}
                >
                  <Ionicons
                    name={guide.icon as any}
                    size={28}
                    color={getPriorityColor(guide.priority)}
                  />
                </View>
                <View style={styles.modalTitleText}>
                  <Text style={styles.modalTitle}>{guide.title}</Text>
                  <Text style={styles.modalSubtitle}>{guide.description}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
            >
              {/* Priority Banner */}
              <View
                style={[
                  styles.priorityBanner,
                  { backgroundColor: getPriorityBg(guide.priority) },
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={getPriorityColor(guide.priority)}
                />
                <Text
                  style={[
                    styles.priorityBannerText,
                    { color: getPriorityColor(guide.priority) },
                  ]}
                >
                  {guide.priority.toUpperCase()} PRIORITY - {guide.category}
                </Text>
              </View>

              {/* Steps */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Step-by-Step Guide</Text>
                {guide.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {/* Warnings */}
              {guide.warnings && guide.warnings.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.warningHeader}>
                    <Ionicons name="warning" size={20} color="#DC2626" />
                    <Text style={styles.warningTitle}>Important Warnings</Text>
                  </View>
                  {guide.warnings.map((warning, index) => (
                    <View key={index} style={styles.warningItem}>
                      <View style={styles.warningDot} />
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Emergency Call */}
              <View style={styles.emergencyCallout}>
                <Ionicons name="call" size={24} color="#EF4444" />
                <View style={styles.emergencyText}>
                  <Text style={styles.emergencyTitle}>
                    Remember: Call 911 in emergencies
                  </Text>
                  <Text style={styles.emergencySubtext}>
                    First aid is not a substitute for professional medical care
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContent: {
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
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  categoryText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: "#FFF",
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
    width: 56,
    height: 56,
    borderRadius: 28,
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
  modalScroll: {
    flex: 1,
  },
  priorityBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
  },
  priorityBannerText: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    paddingTop: 2,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#DC2626",
  },
  warningItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    paddingLeft: 8,
  },
  warningDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#DC2626",
    marginTop: 7,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#991B1B",
    lineHeight: 20,
  },
  emergencyCallout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  emergencyText: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  emergencySubtext: {
    fontSize: 12,
    color: "#991B1B",
  },
});
