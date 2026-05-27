export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  stations: {
    all: ['stations'] as const,
    search: (query: string) => ['stations', 'search', query] as const,
    nearest: (lat: number, lng: number) =>
      ['stations', 'nearest', lat, lng] as const,
  },
  supportRequests: {
    all: ['support-requests'] as const,
    detail: (requestId: string) => ['support-requests', requestId] as const,
    activeDetail: (requestId: string) =>
      ['support-requests', requestId, 'active'] as const,
  },
  transit: {
    arrivals: (stationName: string) =>
      ['transit', 'arrivals', stationName] as const,
    facilities: (stationName: string) =>
      ['transit', 'facilities', stationName] as const,
  },
};
