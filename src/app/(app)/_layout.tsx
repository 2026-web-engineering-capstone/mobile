import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

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
