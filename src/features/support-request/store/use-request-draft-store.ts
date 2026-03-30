import { create } from 'zustand';

type SupportType = 'wheelchair' | 'visual-guide' | 'boarding-ramp';

type RequestDraftState = {
  originStation: string;
  destinationStation: string;
  meetingPoint: string;
  notes: string;
  supportTypes: SupportType[];
  setOriginStation: (value: string) => void;
  setDestinationStation: (value: string) => void;
  setMeetingPoint: (value: string) => void;
  setNotes: (value: string) => void;
  toggleSupportType: (value: SupportType) => void;
  reset: () => void;
};

const initialState = {
  originStation: '시청역',
  destinationStation: '서울역',
  meetingPoint: '고객안내센터 앞',
  notes: '',
  supportTypes: ['wheelchair'] as SupportType[],
};

export const useRequestDraftStore = create<RequestDraftState>((set) => ({
  ...initialState,
  setOriginStation: (originStation) => set({ originStation }),
  setDestinationStation: (destinationStation) => set({ destinationStation }),
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
