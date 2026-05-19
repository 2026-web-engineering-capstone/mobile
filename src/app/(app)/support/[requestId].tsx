import { useLocalSearchParams } from 'expo-router';
import { RequestDetailScreen } from '@/features/support-request/screens/request-detail-screen';
import { StaffRequestDetailScreen } from '@/features/staff/screens/staff-request-detail-screen';
import { useAuth } from '@/providers/auth-provider';

export default function SupportRequestDetailRoute() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { role } = useAuth();

  return role === 'staff' ? (
    <StaffRequestDetailScreen requestId={requestId ?? 'unknown'} />
  ) : (
    <RequestDetailScreen requestId={requestId ?? 'unknown'} />
  );
}
