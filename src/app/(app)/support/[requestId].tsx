import { useLocalSearchParams } from 'expo-router';
import { RequestDetailScreen } from '@/features/support-request/screens/request-detail-screen';

export default function SupportRequestDetailRoute() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  return <RequestDetailScreen requestId={requestId ?? 'unknown'} />;
}
