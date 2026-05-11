import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import type { Coordinate } from '@/features/home/hooks/use-current-location';
import type {
  SupportRequestCurrentLocation,
  SupportRequestStatus,
} from '@/features/support-request/types';

const require = createRequire(import.meta.url);
const {
  canExposeUnavailableReasonAction,
  getCurrentLocationSignature,
  getFailedLocationUploadRetryAfterMs,
  getNextSuccessfulLocationUpload,
  getStaleSuccessfulLocationUploadAfterMs,
  shouldUploadCurrentLocation,
} = require('./request-status-screen.logic.ts') as {
  canExposeUnavailableReasonAction: (params: {
    canManageRequest: boolean;
    requestStatus: SupportRequestStatus;
    unavailableActionStatuses: readonly SupportRequestStatus[];
  }) => boolean;
  getCurrentLocationSignature: (currentLocation: Coordinate | null) => string | null;
  getFailedLocationUploadRetryAfterMs: (failedAtMs: number) => number;
  getNextSuccessfulLocationUpload: (params: {
    currentSuccessfulLocationUpload: {
      signature: string;
      uploadedAtMs: number;
    } | null;
    serverCurrentLocation: SupportRequestCurrentLocation | null;
    nowMs: number;
  }) => {
    signature: string;
    uploadedAtMs: number;
  } | null;
  getStaleSuccessfulLocationUploadAfterMs: (uploadedAtMs: number) => number;
  shouldUploadCurrentLocation: (params: {
    canUploadCurrentLocation: boolean;
    currentLocation: Coordinate | null;
    failedLocationRetryAfterMs: number | null;
    hasPassengerLocationConsent: boolean;
    isUploadPending: boolean;
    lastAttemptedLocationSignature: string | null;
    lastSuccessfulLocationUpload: {
      signature: string;
      uploadedAtMs: number;
    } | null;
    nowMs: number;
  }) => boolean;
};

const currentLocation: Coordinate = {
  latitude: 37.388149,
  longitude: 126.643446,
  accuracy_meters: 7.5,
};

const unavailableActionStatuses: SupportRequestStatus[] = [
  'submitted',
  'assigned',
  'in_progress',
];

test('unavailable reason action is exposed only before handoff statuses', () => {
  for (const requestStatus of unavailableActionStatuses) {
    assert.equal(
      canExposeUnavailableReasonAction({
        canManageRequest: true,
        requestStatus,
        unavailableActionStatuses,
      }),
      true,
    );
  }

  for (const requestStatus of [
    'boarded',
    'awaiting_dropoff',
  ] as SupportRequestStatus[]) {
    assert.equal(
      canExposeUnavailableReasonAction({
        canManageRequest: true,
        requestStatus,
        unavailableActionStatuses,
      }),
      false,
    );
  }

  assert.equal(
    canExposeUnavailableReasonAction({
      canManageRequest: false,
      requestStatus: 'submitted',
      unavailableActionStatuses,
    }),
    false,
  );
});

test('same successful signature is not re-uploaded when server detail omits current location', () => {
  const nowMs = 1_000;
  const signature = getCurrentLocationSignature(currentLocation);
  const successfulLocationUpload = {
    signature: signature ?? '',
    uploadedAtMs: nowMs,
  };
  const preservedUpload = getNextSuccessfulLocationUpload({
    currentSuccessfulLocationUpload: successfulLocationUpload,
    serverCurrentLocation: null,
    nowMs,
  });

  assert.deepEqual(preservedUpload, successfulLocationUpload);
  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation,
      failedLocationRetryAfterMs: null,
      hasPassengerLocationConsent: true,
      isUploadPending: false,
      lastAttemptedLocationSignature: null,
      lastSuccessfulLocationUpload: preservedUpload,
      nowMs,
    }),
    false,
  );
});

test('current location is not uploaded before passenger opts in for the request', () => {
  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation,
      failedLocationRetryAfterMs: null,
      hasPassengerLocationConsent: false,
      isUploadPending: false,
      lastAttemptedLocationSignature: null,
      lastSuccessfulLocationUpload: null,
      nowMs: 1_000,
    }),
    false,
  );
});

test('same server signature without recorded time preserves upload timestamp', () => {
  const signature = getCurrentLocationSignature(currentLocation);
  const successfulLocationUpload = {
    signature: signature ?? '',
    uploadedAtMs: 1_000,
  };
  const nextUpload = getNextSuccessfulLocationUpload({
    currentSuccessfulLocationUpload: successfulLocationUpload,
    serverCurrentLocation: {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy_meters: currentLocation.accuracy_meters ?? null,
      recorded_at: null,
    },
    nowMs: 2_000,
  });

  assert.equal(nextUpload, successfulLocationUpload);
});

test('same server signature with older recorded time preserves newer upload timestamp', () => {
  const signature = getCurrentLocationSignature(currentLocation);
  const successfulLocationUpload = {
    signature: signature ?? '',
    uploadedAtMs: 2_000,
  };
  const nextUpload = getNextSuccessfulLocationUpload({
    currentSuccessfulLocationUpload: successfulLocationUpload,
    serverCurrentLocation: {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy_meters: currentLocation.accuracy_meters ?? null,
      recorded_at: new Date(1_000).toISOString(),
    },
    nowMs: 3_000,
  });

  assert.equal(nextUpload, successfulLocationUpload);
});

test('failed same-coordinate upload waits until retry time', () => {
  const failedAtMs = 10_000;
  const retryAfterMs = getFailedLocationUploadRetryAfterMs(failedAtMs);
  const signature = getCurrentLocationSignature(currentLocation);

  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation,
      failedLocationRetryAfterMs: retryAfterMs,
      hasPassengerLocationConsent: true,
      isUploadPending: false,
      lastAttemptedLocationSignature: signature,
      lastSuccessfulLocationUpload: null,
      nowMs: retryAfterMs - 1,
    }),
    false,
  );

  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation,
      failedLocationRetryAfterMs: retryAfterMs,
      hasPassengerLocationConsent: true,
      isUploadPending: false,
      lastAttemptedLocationSignature: signature,
      lastSuccessfulLocationUpload: null,
      nowMs: retryAfterMs,
    }),
    true,
  );
});

test('failed upload backoff suppresses changed coordinates before retry time', () => {
  const failedLocation: Coordinate = {
    latitude: 37.388149,
    longitude: 126.643446,
    accuracy_meters: 7.5,
  };
  const movedLocation: Coordinate = {
    latitude: 37.38991,
    longitude: 126.64571,
    accuracy_meters: 8.2,
  };
  const failedSignature = getCurrentLocationSignature(failedLocation);

  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation: movedLocation,
      failedLocationRetryAfterMs: getFailedLocationUploadRetryAfterMs(10_000),
      hasPassengerLocationConsent: true,
      isUploadPending: false,
      lastAttemptedLocationSignature: failedSignature,
      lastSuccessfulLocationUpload: null,
      nowMs: 10_001,
    }),
    false,
  );
});

test('failed upload backoff allows changed coordinates after retry time', () => {
  const failedAtMs = 10_000;
  const retryAfterMs = getFailedLocationUploadRetryAfterMs(failedAtMs);
  const failedSignature = getCurrentLocationSignature(currentLocation);
  const movedLocation: Coordinate = {
    latitude: 37.38991,
    longitude: 126.64571,
    accuracy_meters: 8.2,
  };

  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation: movedLocation,
      failedLocationRetryAfterMs: retryAfterMs,
      hasPassengerLocationConsent: true,
      isUploadPending: false,
      lastAttemptedLocationSignature: failedSignature,
      lastSuccessfulLocationUpload: null,
      nowMs: retryAfterMs,
    }),
    true,
  );
});

test('accuracy changes affect current location signature without tiny jitter', () => {
  const lowerAccuracy = getCurrentLocationSignature({
    latitude: 37.388149,
    longitude: 126.643446,
    accuracy_meters: 7.51,
  });
  const sameRoundedAccuracy = getCurrentLocationSignature({
    latitude: 37.388149,
    longitude: 126.643446,
    accuracy_meters: 7.52,
  });
  const higherAccuracy = getCurrentLocationSignature({
    latitude: 37.388149,
    longitude: 126.643446,
    accuracy_meters: 9.01,
  });

  assert.equal(lowerAccuracy, sameRoundedAccuracy);
  assert.notEqual(lowerAccuracy, higherAccuracy);
});

test('same successful signature is suppressed until freshness threshold', () => {
  const uploadedAtMs = 20_000;
  const staleAtMs = getStaleSuccessfulLocationUploadAfterMs(uploadedAtMs);
  const signature = getCurrentLocationSignature(currentLocation);
  const successfulUpload = {
    signature: signature ?? '',
    uploadedAtMs,
  };

  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation,
      failedLocationRetryAfterMs: null,
      hasPassengerLocationConsent: true,
      isUploadPending: false,
      lastAttemptedLocationSignature: null,
      lastSuccessfulLocationUpload: successfulUpload,
      nowMs: staleAtMs - 1,
    }),
    false,
  );

  assert.equal(
    shouldUploadCurrentLocation({
      canUploadCurrentLocation: true,
      currentLocation,
      failedLocationRetryAfterMs: null,
      hasPassengerLocationConsent: true,
      isUploadPending: false,
      lastAttemptedLocationSignature: null,
      lastSuccessfulLocationUpload: successfulUpload,
      nowMs: staleAtMs,
    }),
    true,
  );
});
