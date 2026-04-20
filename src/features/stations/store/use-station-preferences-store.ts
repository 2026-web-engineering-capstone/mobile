import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Station } from '@/lib/api/types';
import { asyncJsonStorage } from '@/lib/storage/async-storage';

const MAX_RECENT_STATIONS = 5;

const initialState = {
  favoriteStations: [] as StationPreference[],
  recentStations: [] as StationPreference[],
};

type StationPreference = Pick<Station, 'id' | 'name' | 'line' | 'line_color'>;

type StationPreferencesState = {
  favoriteStations: StationPreference[];
  recentStations: StationPreference[];
  addFavoriteStation: (station: StationPreference) => void;
  removeFavoriteStation: (stationId: string) => void;
  toggleFavoriteStation: (station: StationPreference) => void;
  recordRecentStation: (station: StationPreference) => void;
  isFavoriteStation: (stationId: string) => boolean;
  reset: () => void;
};

function upsertStation(
  stations: StationPreference[],
  station: StationPreference,
  limit?: number,
) {
  const nextStations = [station, ...stations.filter((item) => item.id !== station.id)];

  if (!limit) {
    return nextStations;
  }

  return nextStations.slice(0, limit);
}

export const useStationPreferencesStore = create<StationPreferencesState>()(
  persist(
    (set, get) => ({
      ...initialState,
      addFavoriteStation: (station) =>
        set((state) => ({
          favoriteStations: upsertStation(state.favoriteStations, station),
        })),
      removeFavoriteStation: (stationId) =>
        set((state) => ({
          favoriteStations: state.favoriteStations.filter((item) => item.id !== stationId),
        })),
      toggleFavoriteStation: (station) => {
        if (get().isFavoriteStation(station.id)) {
          get().removeFavoriteStation(station.id);
          return;
        }

        get().addFavoriteStation(station);
      },
      recordRecentStation: (station) =>
        set((state) => ({
          recentStations: upsertStation(
            state.recentStations,
            station,
            MAX_RECENT_STATIONS,
          ),
        })),
      isFavoriteStation: (stationId) =>
        get().favoriteStations.some((item) => item.id === stationId),
      reset: () => set(initialState),
    }),
    {
      name: 'station-preferences',
      storage: asyncJsonStorage,
      partialize: (state) => ({
        favoriteStations: state.favoriteStations,
        recentStations: state.recentStations,
      }),
    },
  ),
);

export async function clearStationPreferencesStorage() {
  useStationPreferencesStore.getState().reset();
  await useStationPreferencesStore.persist.clearStorage();
}
