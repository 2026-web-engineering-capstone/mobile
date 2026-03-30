import { useEffect, useMemo, useRef, useState } from 'react';
import { WebView } from 'react-native-webview';

type Coordinate = {
  latitude: number;
  longitude: number;
};

type StationInfo = {
  latitude: number;
  longitude: number;
  name: string;
};

type NaverMapWebViewProps = {
  clientId: string;
  currentLocation: Coordinate | null;
  station: StationInfo;
  routePath?: Coordinate[];
};

function buildMapHtml(clientId: string) {
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #eef2f7;
      }
    </style>
    <script
      type="text/javascript"
      src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}"
    ></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var map = null;
      var stationMarker = null;
      var userMarker = null;
      var routePolyline = null;
      var hasCenteredOnUser = false;

      function ensureMap() {
        if (map) {
          return map;
        }

        map = new naver.maps.Map('map', {
          center: new naver.maps.LatLng(37.3864, 126.6393),
          zoom: 15.5,
          mapTypeControl: false,
          scaleControl: false,
          logoControl: false,
          mapDataControl: false,
          zoomControl: false,
        });

        return map;
      }

      function updateStationMarker(station) {
        if (!station) {
          return;
        }

        var position = new naver.maps.LatLng(station.latitude, station.longitude);

        if (!stationMarker) {
          stationMarker = new naver.maps.Marker({
            position: position,
            map: ensureMap(),
            title: station.name,
          });
          return;
        }

        stationMarker.setPosition(position);
      }

      function updateUserMarker(location) {
        if (!location) {
          return;
        }

        var position = new naver.maps.LatLng(location.latitude, location.longitude);

        if (!userMarker) {
          userMarker = new naver.maps.Marker({
            position: position,
            map: ensureMap(),
            title: '현재 위치',
            icon: {
              content:
                '<div style="width:18px;height:18px;border-radius:999px;background:#006FEE;border:3px solid #ffffff;box-shadow:0 0 0 2px rgba(0,111,238,0.2);"></div>',
              size: new naver.maps.Size(18, 18),
              anchor: new naver.maps.Point(9, 9),
            },
          });
        } else {
          userMarker.setPosition(position);
        }

        if (!hasCenteredOnUser) {
          ensureMap().setCenter(position);
          hasCenteredOnUser = true;
        }
      }

      function updateRoutePath(routePath) {
        if (routePolyline) {
          routePolyline.setMap(null);
          routePolyline = null;
        }

        if (!routePath || !routePath.length) {
          return;
        }

        routePolyline = new naver.maps.Polyline({
          map: ensureMap(),
          path: routePath.map(function(point) {
            return new naver.maps.LatLng(point.latitude, point.longitude);
          }),
          strokeColor: '#006FEE',
          strokeWeight: 5,
          strokeOpacity: 0.85,
        });
      }

      window.__updateGyoumMap = function(payload) {
        ensureMap();
        updateStationMarker(payload.station);
        updateUserMarker(payload.currentLocation);
        updateRoutePath(payload.routePath);
      };

      window.onload = function() {
        ensureMap();
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map-ready' }));
        }
      };
    </script>
  </body>
</html>`;
}

export function NaverMapWebView({
  clientId,
  currentLocation,
  routePath = [],
  station,
}: NaverMapWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  const html = useMemo(() => buildMapHtml(clientId), [clientId]);
  const payload = useMemo(
    () => ({
      currentLocation,
      routePath,
      station,
    }),
    [currentLocation, routePath, station],
  );

  useEffect(() => {
    if (!isReady || !webViewRef.current) {
      return;
    }

    webViewRef.current.injectJavaScript(
      `window.__updateGyoumMap(${JSON.stringify(payload)}); true;`,
    );
  }, [isReady, payload]);

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      setSupportMultipleWindows={false}
      onLoadEnd={() => setIsReady(true)}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'map-ready') {
            setIsReady(true);
          }
        } catch {
          return;
        }
      }}
      style={{ flex: 1, backgroundColor: '#eef2f7' }}
    />
  );
}
