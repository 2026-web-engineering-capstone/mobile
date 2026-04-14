import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

export default function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
