import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(slideUpAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Auto-navigate after 2 seconds
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else if (hasCompletedOnboarding) {
        router.replace("/auth/signin");
      } else {
        router.replace("/onboarding/welcome");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    isAuthenticated,
    hasCompletedOnboarding,
    fadeAnim,
    scaleAnim,
    slideUpAnim,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Brand Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
            },
          ]}
        >
          {/* Main Brand */}
          <Text style={styles.brandName}>AlertX</Text>
          <View style={styles.brandLine} />
          <Text style={styles.tagline}>Emergency Response</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Your trusted companion in emergency situations
          </Text>
        </Animated.View>

        {/* Loading Animation */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  brandName: {
    fontSize: 48,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -2,
    fontFamily: "System", // Using system font as fallback
    textAlign: "center",
    marginBottom: 8,
  },
  brandLine: {
    width: 60,
    height: 3,
    backgroundColor: "#000000",
    borderRadius: 2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#999999",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: width * 0.8,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CCCCCC",
    marginHorizontal: 4,
  },
  dot1: {
    animationDelay: "0s",
  },
  dot2: {
    animationDelay: "0.2s",
  },
  dot3: {
    animationDelay: "0.4s",
  },
});
