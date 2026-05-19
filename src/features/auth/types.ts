export type Role = 'passenger' | 'staff' | 'driver' | 'admin';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  station_id: string | null;
};

export type SessionResponse = {
  user: SessionUser;
};

