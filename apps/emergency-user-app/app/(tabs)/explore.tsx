import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation } from "expo-router";

import exploreService, {
  Hospital,
  HealthTip,
  FirstAidGuide,
  EmergencyPreparedness,
} from "@/src/services/exploreService";
import HospitalCard from "@/src/components/explore/HospitalCard";
import HealthTipCard from "@/src/components/explore/HealthTipCard";
import FirstAidCard from "@/src/components/explore/FirstAidCard";
import PreparednessCard from "@/src/components/explore/PreparednessCard";

type TabType = "hospitals" | "health" | "firstaid" | "preparedness";

export default function ExploreScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("hospitals");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Location
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Data
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [healthTips] = useState<HealthTip[]>(exploreService.getHealthTips());
  const [firstAidGuides] = useState<FirstAidGuide[]>(
    exploreService.getFirstAidGuides()
  );
  const [preparedness] = useState<EmergencyPreparedness[]>(
    exploreService.getEmergencyPreparedness()
  );

  const navigation = useNavigation();

  useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) {
      return;
    }

    parent.setOptions({
      tabBarStyle: isModalVisible ? { display: "none" } : undefined,
    });

    return () => {
      parent.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation, isModalVisible]);

  useEffect(() => {
    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalOpen = () => setIsModalVisible(true);
  const handleModalClose = () => setIsModalVisible(false);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      await fetchNearbyHospitals(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Failed to get location");
      setLoading(false);
    }
  };

  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    try {
      const response = await exploreService.getNearbyHospitals(lat, lng, 50);
      if (response.success && response.data) {
        setHospitals(response.data);
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (userLocation) {
      fetchNearbyHospitals(userLocation.latitude, userLocation.longitude);
    } else {
      fetchLocation();
    }
  };

  const handleEmergencyCall = () => {
    Linking.openURL("tel:911");
  };

  const filteredHospitals: Hospital[] = searchQuery
    ? exploreService.searchHospitals(hospitals || [], searchQuery)
    : hospitals || [];

  const filteredFirstAid = searchQuery
    ? firstAidGuides.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guide.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : firstAidGuides;

  const filteredPreparedness = searchQuery
    ? preparedness.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : preparedness;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Finding nearby hospitals...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Explore</Text>
            <Text style={styles.headerSubtitle}>Health resources near you</Text>
          </View>
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergencyCall}
          >
            <Ionicons name="call" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === "hospitals" ? "hospitals" : activeTab === "health" ? "health tips" : activeTab === "firstaid" ? "first aid guides" : "preparedness"}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === "hospitals" && styles.tabActive]}
            onPress={() => setActiveTab("hospitals")}
          >
            <Ionicons
              name="business"
              size={18}
              color={activeTab === "hospitals" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "hospitals" && styles.tabTextActive,
              ]}
            >
              Hospitals
            </Text>
            {!searchQuery && (
              <View
                style={[
                  styles.badge,
                  activeTab === "hospitals" && styles.badgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    activeTab === "hospitals" && styles.badgeTextActive,
                  ]}
                >
                  {hospitals.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "health" && styles.tabActive]}
            onPress={() => setActiveTab("health")}
          >
            <Ionicons
              name="heart"
              size={18}
              color={activeTab === "health" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "health" && styles.tabTextActive,
              ]}
            >
              Health Tips
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "firstaid" && styles.tabActive]}
            onPress={() => setActiveTab("firstaid")}
          >
            <Ionicons
              name="medical"
              size={18}
              color={activeTab === "firstaid" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "firstaid" && styles.tabTextActive,
              ]}
            >
              First Aid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "preparedness" && styles.tabActive,
            ]}
            onPress={() => setActiveTab("preparedness")}
          >
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={activeTab === "preparedness" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "preparedness" && styles.tabTextActive,
              ]}
            >
              Preparedness
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hospitals Tab */}
        {activeTab === "hospitals" && (
          <>
            {locationError && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning" size={20} color="#DC2626" />
                <Text style={styles.errorText}>{locationError}</Text>
              </View>
            )}

            {userLocation && (
              <View style={styles.locationBanner}>
                <Ionicons name="location" size={20} color="#3B82F6" />
                <Text style={styles.locationText}>
                  Showing hospitals within 50 km
                </Text>
              </View>
            )}

            {!filteredHospitals || filteredHospitals.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="business-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No hospitals found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Try adjusting your search"
                    : "No hospitals found in your area"}
                </Text>
              </View>
            ) : (
              Array.isArray(filteredHospitals) &&
              filteredHospitals.map((hospital) => (
                <HospitalCard
                  key={hospital._id}
                  hospital={hospital}
                  onPress={() => {
                    /* Handle hospital details */
                  }}
                />
              ))
            )}
          </>
        )}

        {/* Health Tips Tab */}
        {activeTab === "health" && (
          <>
            <Text style={styles.sectionTitle}>Daily Health Tips</Text>
            <Text style={styles.sectionSubtitle}>
              Expert advice for a healthier life
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
            >
              {healthTips.map((tip) => (
                <HealthTipCard key={tip.id} tip={tip} />
              ))}
            </ScrollView>
          </>
        )}

        {/* First Aid Tab */}
        {activeTab === "firstaid" && (
          <>
            <View style={styles.alertBanner}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
              <View style={styles.alertText}>
                <Text style={styles.alertTitle}>Emergency Disclaimer</Text>
                <Text style={styles.alertSubtext}>
                  Always call 911 for emergencies. These guides are for
                  reference only.
                </Text>
              </View>
            </View>

            {filteredFirstAid.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No guides found</Text>
                <Text style={styles.emptyText}>Try adjusting your search</Text>
              </View>
            ) : (
              filteredFirstAid.map((guide) => (
                <FirstAidCard
                  key={guide.id}
                  guide={guide}
                  onOpen={handleModalOpen}
                  onClose={handleModalClose}
                />
              ))
            )}
          </>
        )}

        {/* Preparedness Tab */}
        {activeTab === "preparedness" && (
          <>
            <Text style={styles.sectionTitle}>Emergency Preparedness</Text>
            <Text style={styles.sectionSubtitle}>
              Be ready for any emergency situation
            </Text>

            {filteredPreparedness.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={64}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyTitle}>No guides found</Text>
                <Text style={styles.emptyText}>Try adjusting your search</Text>
              </View>
            ) : (
              filteredPreparedness.map((item) => (
                <PreparednessCard
                  key={item.id}
                  item={item}
                  onOpen={handleModalOpen}
                  onClose={handleModalClose}
                />
              ))
            )}
          </>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6B7280",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  emergencyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    marginLeft: 12,
  },
  tabsContainer: {
    maxHeight: 48,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "#F9FAFB",
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#EF4444",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  badge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  badgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  badgeTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  locationText: {
    fontSize: 13,
    color: "#1E40AF",
    flex: 1,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 13,
    color: "#991B1B",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  carousel: {
    marginHorizontal: -20,
  },
  carouselContent: {
    paddingHorizontal: 20,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  alertSubtext: {
    fontSize: 13,
    color: "#991B1B",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
