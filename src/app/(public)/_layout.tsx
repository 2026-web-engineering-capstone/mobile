import { Stack } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

export default function PublicLayout() {
  const { isHydrating } = useAuth();

  if (isHydrating) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
