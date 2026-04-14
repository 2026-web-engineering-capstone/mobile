import { create } from 'zustand';

export type SupportType = 'wheelchair' | 'visual-guide' | 'boarding-ramp';

export type MeetingPoint =
  | 'elevator'
  | 'gate'
  | 'info-center'
  | 'platform'
  | 'other';

export const SUPPORT_TYPE_LABELS: Record<SupportType, string> = {
  wheelchair: '휠체어 발판',
  'visual-guide': '시각 안내 동행',
  'boarding-ramp': '승하차 보조',
};

export const MEETING_POINT_LABELS: Record<MeetingPoint, string> = {
  elevator: '엘리베이터 앞',
  gate: '개찰구 앞',
  'info-center': '고객안내센터',
  platform: '승강장',
  other: '기타',
};

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
  meetingPoint: 'elevator' as MeetingPoint,
  notes: '',
  supportTypes: [] as SupportType[],
};

export const useRequestDraftStore = create<RequestDraftState>((set) => ({
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
}));
