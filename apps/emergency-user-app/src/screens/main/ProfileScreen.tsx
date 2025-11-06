import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("auth-token");
          signOut();
          router.replace("/auth/signin");
        },
      },
    ]);
  };

  const quickActions = [
    {
      title: "Medical Profile",
      subtitle: "Blood type, allergies & more",
      icon: "medical",
      color: "#EF4444",
      action: () => router.push("/medical" as any),
    },
    {
      title: "Emergency Contacts",
      subtitle: "Manage your SOS contacts",
      icon: "people",
      color: "#F59E0B",
      action: () => router.push("/medical/emergency-contacts" as any),
    },
    {
      title: "Notifications",
      subtitle: "Alert preferences",
      icon: "notifications",
      color: "#3B82F6",
      action: () =>
        Alert.alert("Notifications", "Notification settings coming soon."),
    },
    {
      title: "Privacy & Security",
      subtitle: "Your data & permissions",
      icon: "lock-closed",
      color: "#8B5CF6",
      action: () => Alert.alert("Privacy", "Privacy settings coming soon."),
    },
    {
      title: "Help & Support",
      subtitle: "FAQs & contact us",
      icon: "help-circle",
      color: "#10B981",
      action: () => Alert.alert("Help", "Help center coming soon."),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>Profile</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.name || "User")}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userRole}>
              {user?.role?.toUpperCase() || "USER"}
            </Text>
          </View>
        </View>

        {/* Personal Info Cards */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View
              style={[styles.infoIconContainer, { backgroundColor: "#DBEAFE" }]}
            >
              <Ionicons name="mail" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.email || "N/A"}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View
              style={[styles.infoIconContainer, { backgroundColor: "#FEE2E2" }]}
            >
              <Ionicons name="call" size={20} color="#EF4444" />
            </View>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user?.phone || "N/A"}
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={action.action}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: action.color + "15" },
                ]}
              >
                <Ionicons
                  name={action.icon as any}
                  size={24}
                  color={action.color}
                />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.versionText}>AlertX v1.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2025 AlertX. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  infoCardsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#9CA3AF",
  },
  appInfo: {
    alignItems: "center",
    paddingTop: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#D1D5DB",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: "400",
    color: "#E5E7EB",
  },
});
