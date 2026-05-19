import { HistoryScreen } from '@/features/history/screens/history-screen';
import { StaffHistoryScreen } from '@/features/staff/screens/staff-history-screen';
import { useAuth } from '@/providers/auth-provider';

export default function HistoryRoute() {
  const { role } = useAuth();

  return role === 'staff' ? <StaffHistoryScreen /> : <HistoryScreen />;
}
