import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncJsonStorage } from '@/lib/storage/async-storage';

/**
 * 백엔드 SupportType enum과 1:1 매칭(교움 디자인 시안 6종).
 */
export type SupportType =
  | 'footboard'
  | 'companion'
  | 'elevator'
  | 'vision'
  | 'wheelchair'
  | 'chat';

/**
 * 백엔드 MeetingPoint enum과 1:1 매칭(교움 디자인 시안 6종 + 기타).
 */
export type MeetingPoint =
  | 'staff_office'
  | 'elevator_concourse'
  | 'info_desk'
  | 'exit'
  | 'transfer_elevator'
  | 'platform_center'
  | 'other';

export const SUPPORT_TYPE_LABELS: Record<SupportType, string> = {
  footboard: '이동식 안전발판',
  companion: '동행 안내',
  elevator: '엘리베이터 동선',
  vision: '시각 안내',
  wheelchair: '휠체어 동행',
  chat: '의사소통 지원',
};

export const SUPPORT_TYPE_DESCRIPTIONS: Record<SupportType, string> = {
  footboard: '승강장과 열차 사이 발판 설치',
  companion: '역무원이 직접 동행',
  elevator: '엘리베이터 경유 안내',
  vision: '시각장애 보조 안내',
  wheelchair: '휠체어 사용자 동행',
  chat: '필담/수어 안내',
};

export const MEETING_POINT_LABELS: Record<MeetingPoint, string> = {
  staff_office: '역무실 앞',
  elevator_concourse: '엘리베이터 앞 (대합실)',
  info_desk: '맞이방 안내데스크',
  exit: '1번 출구 앞',
  transfer_elevator: '교통약자 환승 엘리베이터',
  platform_center: '플랫폼 중앙',
  other: '기타 (메모에 입력)',
};

export const SUPPORT_TYPE_ORDER: SupportType[] = [
  'footboard',
  'companion',
  'elevator',
  'vision',
  'wheelchair',
  'chat',
];

export const MEETING_POINT_ORDER: MeetingPoint[] = [
  'staff_office',
  'elevator_concourse',
  'info_desk',
  'exit',
  'transfer_elevator',
  'platform_center',
];

type RequestDraftState = {
  originStationId: string;
  destinationStationId: string;
  meetingPoint: MeetingPoint;
  notes: string;
  supportTypes: SupportType[];
  setOriginStationId: (value: string) => void;
  setDestinationStationId: (value: string) => void;
  setMeetingPoint: (value: MeetingPoint) => void;
  setNotes: (value: string) => void;
  toggleSupportType: (value: SupportType) => void;
  reset: () => void;
};

const initialState = {
  originStationId: '',
  destinationStationId: '',
  meetingPoint: 'elevator_concourse' as MeetingPoint,
  notes: '',
  supportTypes: [] as SupportType[],
};

export const useRequestDraftStore = create<RequestDraftState>()(
  persist(
    (set) => ({
      ...initialState,
      setOriginStationId: (originStationId) => set({ originStationId }),
      setDestinationStationId: (destinationStationId) => set({ destinationStationId }),
      setMeetingPoint: (meetingPoint) => set({ meetingPoint }),
      setNotes: (notes) => set({ notes }),
      toggleSupportType: (value) =>
        set((state) => ({
          supportTypes: state.supportTypes.includes(value)
            ? state.supportTypes.filter((item) => item !== value)
            : [...state.supportTypes, value],
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'support-request-draft',
      storage: asyncJsonStorage,
      partialize: (state) => ({
        originStationId: state.originStationId,
        destinationStationId: state.destinationStationId,
        meetingPoint: state.meetingPoint,
        notes: state.notes,
        supportTypes: state.supportTypes,
      }),
    },
  ),
);

export async function clearRequestDraftStorage() {
  useRequestDraftStore.getState().reset();
  await useRequestDraftStore.persist.clearStorage();
}
