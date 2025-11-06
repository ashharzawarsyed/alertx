import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "../src/store/authStore";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { isAuthenticated, hasCompletedOnboarding, isLoading, setIsLoading } =
    useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for auth store to hydrate from AsyncStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [setIsLoading]);

  // Show loading while checking auth state
  if (isLoading || !isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (hasCompletedOnboarding) {
    return <Redirect href="/auth/signin" />;
  }

  return <Redirect href="/onboarding/splash" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
