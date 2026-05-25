import { useEffect, useMemo, useRef } from 'react';
import {
  NaverMapPolylineOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';
import type { Coordinate } from '@/features/home/hooks/use-current-location';
import type { StationInfo } from '@/features/home/types';

type NativeNaverMapProps = {
  currentLocation: Coordinate | null;
  routePath?: Coordinate[];
  station: StationInfo;
};

const DEFAULT_ZOOM = 12;

export function NativeNaverMap({
  currentLocation,
  routePath = [],
  station,
}: NativeNaverMapProps) {
  const mapRef = useRef<NaverMapViewRef>(null);
  const hasCenteredOnCurrentLocationRef = useRef(false);

  const initialCamera = useMemo(
    () => ({
      latitude: currentLocation?.latitude ?? station.latitude,
      longitude: currentLocation?.longitude ?? station.longitude,
      zoom: DEFAULT_ZOOM,
    }),
    [currentLocation?.latitude, currentLocation?.longitude, station.latitude, station.longitude],
  );

  useEffect(() => {
    if (
      !mapRef.current ||
      !currentLocation ||
      hasCenteredOnCurrentLocationRef.current
    ) {
      return;
    }

    mapRef.current.setLocationTrackingMode('NoFollow');
    mapRef.current.animateCameraTo({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      duration: 700,
      zoom: DEFAULT_ZOOM,
    });
    hasCenteredOnCurrentLocationRef.current = true;
  }, [currentLocation]);

  return (
    <NaverMapView
      ref={mapRef}
      initialCamera={initialCamera}
      isExtentBoundedInKorea
      isShowCompass={false}
      isShowLocationButton={false}
      isShowScaleBar={false}
      isShowZoomControls={false}
      onInitialized={() => {
        mapRef.current?.setLocationTrackingMode('NoFollow');
      }}
      locationOverlay={{
        isVisible: Boolean(currentLocation),
        position: currentLocation ?? undefined,
      }}
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
      {routePath.length > 1 ? (
        <NaverMapPolylineOverlay
          color={station.line.colors.primary}
          coords={routePath}
          width={5}
        />
      ) : null}
    </NaverMapView>
  );
}
