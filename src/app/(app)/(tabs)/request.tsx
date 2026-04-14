import { Redirect } from 'expo-router';
import { RequestScreen } from '@/features/support-request/screens/request-screen';
import { useAuth } from '@/providers/auth-provider';

export default function RequestRoute() {
  const { role } = useAuth();

  if (role !== 'passenger') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <RequestScreen />;
}
