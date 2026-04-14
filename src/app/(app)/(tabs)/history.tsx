import { Redirect } from 'expo-router';
import { HistoryScreen } from '@/features/history/screens/history-screen';
import { useAuth } from '@/providers/auth-provider';

export default function HistoryRoute() {
  const { role } = useAuth();

  if (role !== 'passenger') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <HistoryScreen />;
}
