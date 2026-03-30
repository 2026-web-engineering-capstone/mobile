export type SubwayLineTheme = {
  label: string;
  colors: {
    primary: string;
    soft: string;
  };
};

export type StationInfo = {
  latitude: number;
  longitude: number;
  name: string;
  previous: string;
  next: string;
  line: SubwayLineTheme;
};
