export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  stations: {
    all: ['stations'] as const,
  },
  supportRequests: {
    all: ['support-requests'] as const,
    detail: (requestId: string) => ['support-requests', requestId] as const,
  },
};
