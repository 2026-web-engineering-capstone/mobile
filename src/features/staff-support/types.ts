export type StaffSupportStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'boarded'
  | 'awaiting_dropoff'
  | 'completed'
  | 'cancelled'
  | 'unavailable';

export type StaffSupportSummary = {
  request_id: string;
  passenger_name: string;
  origin_station_id: string;
  origin_station_name: string;
  destination_station_id: string;
  destination_station_name: string;
  meeting_point: string;
  status: StaffSupportStatus;
  current_location: {
    latitude: number;
    longitude: number;
    accuracy_meters: number | null;
    recorded_at: string | null;
  } | null;
  selected_train_number: string | null;
};

export type StaffSupportArrivalOption = {
  line_label: string;
  destination_label: string;
  arrival_label: string;
  train_number: string;
};
