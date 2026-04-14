export type Role = 'passenger' | 'staff' | 'driver' | 'admin';

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string | null;
};

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

export type Station = {
  id: string;
  name: string;
  line: string;
  line_color: string;
};
