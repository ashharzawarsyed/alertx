import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "../../store/authStore";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 1,
    title: "Instant Emergency\nResponse",
    subtitle: "Help When You Need It Most",
    description:
      "Connect with emergency services instantly with our advanced location tracking and medical profile integration.",
    icon: "🚨",
  },
  {
    id: 2,
    title: "Smart Medical\nProfiles",
    subtitle: "Your Health Information, Instantly Available",
    description:
      "Store critical medical information securely. First responders get instant access to your medical history and emergency contacts.",
    icon: "🏥",
  },
  {
    id: 3,
    title: "Real-Time\nTracking",
    subtitle: "Stay Connected During Emergencies",
    description:
      "Track emergency response vehicles in real-time. Your emergency contacts get automatic updates about your situation.",
    icon: "📍",
  },
];

export default function WelcomeScreen() {
  const { setHasCompletedOnboarding } = useAuthStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    // Animate slide change
    Animated.spring(slideAnim, {
      toValue: currentSlide,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [currentSlide, slideAnim]);

  const handleGetStarted = () => {
    setHasCompletedOnboarding(true);
    router.push("/auth/signin");
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    router.push("/auth/signin");
  };

  const nextSlide = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      const newSlide = currentSlide + 1;
      setCurrentSlide(newSlide);
      scrollViewRef.current?.scrollTo({
        x: newSlide * width,
        animated: true,
      });
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const newSlide = currentSlide - 1;
      setCurrentSlide(newSlide);
      scrollViewRef.current?.scrollTo({
        x: newSlide * width,
        animated: true,
      });
    }
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => {
    return (
      <View key={slide.id} style={styles.slide}>
        {/* Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.slideIcon}>{slide.icon}</Text>
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContent,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </Animated.View>
      </View>
    );
  };

  const renderPageIndicator = () => {
    return (
      <View style={styles.pageIndicatorContainer}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pageIndicator,
              {
                backgroundColor: currentSlide === index ? "#000000" : "#E5E5E5",
                width: currentSlide === index ? 24 : 8,
              },
            ]}
            onPress={() => {
              setCurrentSlide(index);
              scrollViewRef.current?.scrollTo({
                x: index * width,
                animated: true,
              });
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <Animated.View style={[styles.slidesContainer, { opacity: fadeAnim }]}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(
              event.nativeEvent.contentOffset.x / width
            );
            setCurrentSlide(slideIndex);
          }}
          style={styles.slidesScrollView}
        >
          {ONBOARDING_SLIDES.map((slide, index) => renderSlide(slide, index))}
        </ScrollView>
      </Animated.View>

      {/* Page Indicator */}
      {renderPageIndicator()}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <View style={styles.buttonRow}>
          {currentSlide > 0 && (
            <TouchableOpacity onPress={prevSlide} style={styles.prevButton}>
              <Text style={styles.prevButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={styles.buttonSpacer} />

          {currentSlide < ONBOARDING_SLIDES.length - 1 ? (
            <TouchableOpacity onPress={nextSlide} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleGetStarted}
              style={styles.getStartedButton}
            >
              <Text style={styles.getStartedButtonText}>Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },

  // Slides
  slidesContainer: {
    flex: 1,
  },
  slidesScrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  // Icon
  iconContainer: {
    marginBottom: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  slideIcon: {
    fontSize: 80,
    textAlign: "center",
  },

  // Text Content
  textContent: {
    alignItems: "center",
    maxWidth: "100%",
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -1,
    lineHeight: 38,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  slideDescription: {
    fontSize: 16,
    color: "#999999",
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.2,
    maxWidth: width * 0.8,
  },

  // Page Indicator
  pageIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  pageIndicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },

  // Navigation
  navigationContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonSpacer: {
    flex: 1,
  },
  prevButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  prevButtonText: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  nextButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  getStartedButton: {
    backgroundColor: "#000000",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  getStartedButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
