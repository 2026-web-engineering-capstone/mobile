import { HomeScreen } from '@/features/home/screens/home-screen';
import { StaffHomeScreen } from '@/features/staff/screens/staff-home-screen';
import { useAuth } from '@/providers/auth-provider';

export default function HomeRoute() {
  const { role } = useAuth();

  return role === 'staff' ? <StaffHomeScreen /> : <HomeScreen />;
}
