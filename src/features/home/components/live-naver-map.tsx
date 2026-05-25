import { useEffect, useMemo, useRef } from 'react';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';

import type { Coordinate } from '@/features/home/hooks/use-current-location';
import type { StationInfo } from '@/features/home/types';

type LiveNaverMapProps = {
  currentLocation: Coordinate | null;
  station: StationInfo;
};

const DEFAULT_ZOOM = 15;
const KOREA_BOUNDS = {
  minLatitude: 33,
  maxLatitude: 39,
  minLongitude: 124,
  maxLongitude: 132,
};

function isInKoreaBounds(coordinate: Coordinate | null) {
  if (!coordinate) {
    return false;
  }

  return (
    coordinate.latitude >= KOREA_BOUNDS.minLatitude &&
    coordinate.latitude <= KOREA_BOUNDS.maxLatitude &&
    coordinate.longitude >= KOREA_BOUNDS.minLongitude &&
    coordinate.longitude <= KOREA_BOUNDS.maxLongitude
  );
}

export function LiveNaverMap({ currentLocation, station }: LiveNaverMapProps) {
  const mapRef = useRef<NaverMapViewRef>(null);
  const hasMovedToCurrentLocationRef = useRef(false);
  const currentLocationInKorea = isInKoreaBounds(currentLocation)
    ? currentLocation
    : null;

  const initialCamera = useMemo(
    () => ({
      latitude: currentLocationInKorea?.latitude ?? station.latitude,
      longitude: currentLocationInKorea?.longitude ?? station.longitude,
      zoom: DEFAULT_ZOOM,
    }),
    [
      currentLocationInKorea?.latitude,
      currentLocationInKorea?.longitude,
      station.latitude,
      station.longitude,
    ],
  );

  useEffect(() => {
    if (
      !mapRef.current ||
      !currentLocationInKorea ||
      hasMovedToCurrentLocationRef.current
    ) {
      return;
    }

    mapRef.current.animateCameraTo({
      latitude: currentLocationInKorea.latitude,
      longitude: currentLocationInKorea.longitude,
      duration: 500,
      zoom: DEFAULT_ZOOM,
    });
    hasMovedToCurrentLocationRef.current = true;
  }, [currentLocationInKorea]);

  return (
    <NaverMapView
      ref={mapRef}
      initialCamera={initialCamera}
      isExtentBoundedInKorea
      isShowCompass={false}
      isShowLocationButton={false}
      isShowScaleBar={false}
      isShowZoomControls={false}
      layerGroups={{
        BUILDING: true,
        TRAFFIC: false,
        TRANSIT: true,
        BICYCLE: false,
        MOUNTAIN: false,
        CADASTRAL: false,
      }}
      logoMargin={{ bottom: 12, left: 12 }}
      mapType="Basic"
      style={{ flex: 1 }}
    >
      <NaverMapMarkerOverlay
        latitude={station.latitude}
        longitude={station.longitude}
        width={28}
        height={36}
        caption={{ text: station.name }}
      />
      {currentLocationInKorea ? (
        <NaverMapMarkerOverlay
          latitude={currentLocationInKorea.latitude}
          longitude={currentLocationInKorea.longitude}
          width={24}
          height={24}
          tintColor="#1d7afc"
          isForceShowIcon
          caption={{ text: '현재 위치' }}
        />
      ) : null}
    </NaverMapView>
  );
}
