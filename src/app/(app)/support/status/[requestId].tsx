import { useLocalSearchParams } from 'expo-router';
import { RequestStatusScreen } from '@/features/support-request/screens/request-status-screen';

export default function SupportRequestStatusRoute() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  return <RequestStatusScreen requestId={requestId ?? 'unknown'} />;
}
