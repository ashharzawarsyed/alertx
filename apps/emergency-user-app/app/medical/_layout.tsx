import { Stack } from "expo-router";

export default function MedicalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="allergies" />
      <Stack.Screen name="conditions" />
      <Stack.Screen name="medications" />
      <Stack.Screen name="emergency-contacts" />
    </Stack>
  );
}
