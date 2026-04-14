export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  stations: {
    all: ['stations'] as const,
    search: (query: string) => ['stations', 'search', query] as const,
  },
  supportRequests: {
    all: ['support-requests'] as const,
    detail: (requestId: string) => ['support-requests', requestId] as const,
    activeDetail: (requestId: string) =>
      ['support-requests', requestId, 'active'] as const,
  },
};
