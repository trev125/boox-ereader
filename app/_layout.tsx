import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { disableAnimations } from '../src/utils/disableAnimations';

export default function RootLayout() {
  useEffect(() => {
    disableAnimations();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        gestureEnabled: false,
      }}
    />
  );
}
