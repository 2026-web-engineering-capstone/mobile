import { RequestDetailScreen } from '@/features/support-request/screens/request-detail-screen';
import { StaffRequestDetailScreen } from '@/features/staff/screens/staff-request-detail-screen';
import { useAuth } from '@/providers/auth-provider';

export default function SupportRequestDetailRoute() {
  return <RequestDetailScreen />;
}
