import type { StationInfo } from '@/features/home/types';

const STATION_INFO_BY_ID: Record<string, StationInfo> = {
  'STN-GY': {
    latitude: 37.5716,
    longitude: 126.7363,
    name: '계양역',
    previous: '송도달빛축제공원',
    next: '귤현',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-GH': {
    latitude: 37.5664,
    longitude: 126.7423,
    name: '귤현역',
    previous: '계양',
    next: '박촌',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-BC': {
    latitude: 37.5572,
    longitude: 126.7448,
    name: '박촌역',
    previous: '귤현',
    next: '임학',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-IH': {
    latitude: 37.5451,
    longitude: 126.7381,
    name: '임학역',
    previous: '박촌',
    next: '작전',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-JJ': {
    latitude: 37.5304,
    longitude: 126.7225,
    name: '작전역',
    previous: '임학',
    next: '갈산',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-GS': {
    latitude: 37.5175,
    longitude: 126.7218,
    name: '갈산역',
    previous: '작전',
    next: '지식정보단지',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-JI': {
    latitude: 37.3781,
    longitude: 126.6458,
    name: '지식정보단지역',
    previous: '갈산',
    next: '인천대입구',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-ICU': {
    latitude: 37.3864,
    longitude: 126.6393,
    name: '인천대입구역',
    previous: '지식정보단지',
    next: '센트럴파크',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-CP': {
    latitude: 37.3925,
    longitude: 126.6344,
    name: '센트럴파크역',
    previous: '인천대입구',
    next: '국제업무지구',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-IBD': {
    latitude: 37.3994,
    longitude: 126.6306,
    name: '국제업무지구역',
    previous: '센트럴파크',
    next: '송도달빛축제공원',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-SD': {
    latitude: 37.4060,
    longitude: 126.6277,
    name: '송도달빛축제공원역',
    previous: '국제업무지구',
    next: '계양',
    line: {
      label: '인',
      colors: {
        primary: '#3681cb',
        soft: '#759cce',
      },
    },
  },
  'STN-HSU': {
    latitude: 37.5884,
    longitude: 127.006,
    name: '한성대입구역',
    previous: '혜화',
    next: '성신여대입구',
    line: {
      label: '4',
      colors: {
        primary: '#2f9e44',
        soft: '#7bc58a',
      },
    },
  },
  'STN-HYE': {
    latitude: 37.5821,
    longitude: 127.0019,
    name: '혜화역',
    previous: '한성대입구',
    next: '동대문',
    line: {
      label: '4',
      colors: {
        primary: '#2f9e44',
        soft: '#7bc58a',
      },
    },
  },
  'STN-SSW': {
    latitude: 37.5928,
    longitude: 127.017,
    name: '성신여대입구역',
    previous: '한성대입구',
    next: '길음',
    line: {
      label: '4',
      colors: {
        primary: '#2f9e44',
        soft: '#7bc58a',
      },
    },
  },
};

export function getStationInfoById(stationId: string | null | undefined) {
  if (!stationId) {
    return null;
  }

  return STATION_INFO_BY_ID[stationId] ?? null;
}
