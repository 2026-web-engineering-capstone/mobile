import { HomeScreen } from '@/features/home/screens/home-screen';
import { StaffQueueScreen } from '@/features/staff/screens/staff-queue-screen';
import { useAuth } from '@/providers/auth-provider';

export default function HomeRoute() {
  const { role } = useAuth();

  if (role === 'staff') {
    return <StaffQueueScreen />;
  }

  return <HomeScreen />;
}
