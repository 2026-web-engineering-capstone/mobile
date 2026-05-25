import { Stack } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

export default function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isHydrating) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
