import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Notification {
  id: string;
  type: "emergency" | "update" | "info" | "warning";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable?: {
    label: string;
    route: string;
  };
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "emergency",
      title: "Emergency Accepted",
      message: "Your emergency request has been accepted. Ambulance is on the way.",
      timestamp: "2 min ago",
      read: false,
      actionable: {
        label: "Track",
        route: "/(tabs)/emergencies",
      },
    },
    {
      id: "2",
      type: "update",
      title: "Emergency Update",
      message: "Ambulance is 5 minutes away from your location.",
      timestamp: "15 min ago",
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "Medical Profile Updated",
      message: "Your medical profile has been successfully updated.",
      timestamp: "1 hour ago",
      read: true,
    },
  ]);
  
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "emergency":
        return "medical";
      case "update":
        return "information-circle";
      case "info":
        return "checkmark-circle";
      case "warning":
        return "warning";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "emergency":
        return "#EF4444";
      case "update":
        return "#3B82F6";
      case "info":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => {
          markAsRead(item.id);
          if (item.actionable) {
            router.push(item.actionable.route as any);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + "15" }]}>
            <Ionicons name={getNotificationIcon(item.type)} size={24} color={iconColor} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{item.title}</Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <View style={styles.footer}>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
              {item.actionable && (
                <Text style={[styles.actionLabel, { color: iconColor }]}>
                  {item.actionable.label}
                </Text>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You'll see emergency alerts and updates here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount} unread
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 40 }} />}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EF4444"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  markAllButton: {
    padding: 8,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  notificationContent: {
    flexDirection: "row",
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionButton: {
    alignSelf: "flex-end",
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
