import { RequestScreen } from '@/features/support-request/screens/request-screen';
import { StaffRequestsScreen } from '@/features/staff/screens/staff-requests-screen';
import { useAuth } from '@/providers/auth-provider';

export default function RequestRoute() {
  const { role } = useAuth();

  return role === 'staff' ? <StaffRequestsScreen /> : <RequestScreen />;
}
