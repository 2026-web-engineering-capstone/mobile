import test from 'node:test';
import assert from 'node:assert/strict';
import type { Coordinate, useCurrentLocation } from './use-current-location';

type Assert<T extends true> = T;
type UseCurrentLocationResult = ReturnType<typeof useCurrentLocation>;

type CurrentLocationProbe = Assert<
  UseCurrentLocationResult['currentLocation'] extends Coordinate | null
    ? true
    : false
>;
type ErrorMessageProbe = Assert<
  UseCurrentLocationResult['errorMessage'] extends string | null ? true : false
>;
type LoadingProbe = Assert<
  UseCurrentLocationResult['isLoading'] extends boolean ? true : false
>;
type AccuracyProbe = Assert<
  Coordinate['accuracy_meters'] extends number | null | undefined ? true : false
>;

test('coordinate accuracy can be a number, null, or omitted', () => {
  const coordinates: Coordinate[] = [
    { latitude: 37.3881, longitude: 126.6434, accuracy_meters: 8 },
    { latitude: 37.3881, longitude: 126.6434, accuracy_meters: null },
    { latitude: 37.3881, longitude: 126.6434 },
  ];

  assert.deepEqual(
    coordinates.map((coordinate) => coordinate.accuracy_meters ?? null),
    [8, null, null],
  );
});
