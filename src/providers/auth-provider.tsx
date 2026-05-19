import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { signInWithRole, signOutSession } from '@/features/auth/api';
import type { Role } from '@/features/auth/types';

type AuthContextValue = {
  isAuthenticated: boolean;
  isHydrating: boolean;
  role: Role;
  signIn: (nextRole?: Role) => Promise<void>;
  signOut: () => Promise<void>;
  switchRole: (nextRole: Role) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrating, setIsHydrating] = useState(false);
  const [role, setRole] = useState<Role>('passenger');

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isHydrating,
      role,
      signIn: async (nextRole = 'passenger') => {
        const sessionUser = await signInWithRole(nextRole);
        setRole(sessionUser.role);
        setIsAuthenticated(true);
        setIsHydrating(false);
      },
      signOut: async () => {
        await signOutSession();
        setRole('passenger');
        setIsAuthenticated(false);
        setIsHydrating(false);
      },
      switchRole: async (nextRole) => {
        const sessionUser = await signInWithRole(nextRole);
        setRole(sessionUser.role);
        setIsAuthenticated(true);
        setIsHydrating(false);
      },
    }),
    [isAuthenticated, isHydrating, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
