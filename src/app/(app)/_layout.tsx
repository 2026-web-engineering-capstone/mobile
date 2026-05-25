import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { usePassengerLocationSync } from '@/features/support-request/hooks/use-passenger-location-sync';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
