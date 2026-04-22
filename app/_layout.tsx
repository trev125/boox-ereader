import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="library" options={{ headerShown: false }} />
      <Stack.Screen name="catalog/[feedId]" options={{ headerShown: false }} />
      <Stack.Screen name="reader/[bookId]" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="sync-status" options={{ headerShown: false }} />
    </Stack>
  );
}
