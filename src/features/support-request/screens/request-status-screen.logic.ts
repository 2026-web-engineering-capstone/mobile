import type { Coordinate } from '@/features/home/hooks/use-current-location';
import type {
  SupportRequestCurrentLocation,
  SupportRequestStatus,
} from '@/features/support-request/types';

const LOCATION_SIGNATURE_PRECISION = 4;
const LOCATION_UPLOAD_RETRY_DELAY_MS = 30_000;
const SUCCESSFUL_LOCATION_UPLOAD_FRESHNESS_MS = 60_000;

export type SuccessfulLocationUpload = {
  signature: string;
  uploadedAtMs: number;
};

type ShouldUploadCurrentLocationParams = {
  canUploadCurrentLocation: boolean;
  currentLocation: Coordinate | null;
  failedLocationRetryAfterMs: number | null;
  hasPassengerLocationConsent: boolean;
  isUploadPending: boolean;
  lastAttemptedLocationSignature: string | null;
  lastSuccessfulLocationUpload: SuccessfulLocationUpload | null;
  nowMs: number;
};

type ShouldDisableRequestActionsParams = {
  isCancelPending: boolean;
  isAssignPending: boolean;
  isChecklistPending: boolean;
  isStatusPending: boolean;
  isUnavailablePending: boolean;
};

type CanExposeUnavailableReasonActionParams = {
  canManageRequest: boolean;
  requestStatus: SupportRequestStatus;
  unavailableActionStatuses: readonly SupportRequestStatus[];
};

function roundCoordinate(value: number) {
  return Number(value.toFixed(LOCATION_SIGNATURE_PRECISION));
}

function roundAccuracyMeters(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(value);
}

function getRecordedAtMs(value: string | null) {
  if (!value) {
    return null;
  }

  const recordedAtMs = Date.parse(value);

  return Number.isNaN(recordedAtMs) ? null : recordedAtMs;
}

export function getCurrentLocationSignature(currentLocation: Coordinate | null) {
  if (!currentLocation) {
    return null;
  }

  return JSON.stringify({
    latitude: roundCoordinate(currentLocation.latitude),
    longitude: roundCoordinate(currentLocation.longitude),
    accuracy_meters: roundAccuracyMeters(currentLocation.accuracy_meters),
  });
}

export function getInitialSuccessfulLocationUpload(
  currentLocation: SupportRequestCurrentLocation | null,
  nowMs: number,
): SuccessfulLocationUpload | null {
  if (!currentLocation) {
    return null;
  }

  const signature = getCurrentLocationSignature({
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    accuracy_meters: currentLocation.accuracy_meters,
  });

  if (!signature) {
    return null;
  }

  return {
    signature,
    uploadedAtMs: getRecordedAtMs(currentLocation.recorded_at) ?? nowMs,
  };
}

export function getNextSuccessfulLocationUpload({
  currentSuccessfulLocationUpload,
  serverCurrentLocation,
  nowMs,
}: {
  currentSuccessfulLocationUpload: SuccessfulLocationUpload | null;
  serverCurrentLocation: SupportRequestCurrentLocation | null;
  nowMs: number;
}): SuccessfulLocationUpload | null {
  if (!serverCurrentLocation) {
    return currentSuccessfulLocationUpload;
  }

  const serverLocationSignature = getCurrentLocationSignature({
    latitude: serverCurrentLocation.latitude,
    longitude: serverCurrentLocation.longitude,
    accuracy_meters: serverCurrentLocation.accuracy_meters,
  });

  if (!serverLocationSignature) {
    return currentSuccessfulLocationUpload;
  }

  const recordedAtMs = getRecordedAtMs(serverCurrentLocation.recorded_at);

  if (
    currentSuccessfulLocationUpload?.signature === serverLocationSignature &&
    (recordedAtMs === null ||
      currentSuccessfulLocationUpload.uploadedAtMs >= recordedAtMs)
  ) {
    return currentSuccessfulLocationUpload;
  }

  const serverUploadedAtMs = recordedAtMs ?? nowMs;

  if (
    currentSuccessfulLocationUpload?.signature === serverLocationSignature &&
    currentSuccessfulLocationUpload.uploadedAtMs === serverUploadedAtMs
  ) {
    return currentSuccessfulLocationUpload;
  }

  return {
    signature: serverLocationSignature,
    uploadedAtMs: serverUploadedAtMs,
  };
}

export function getFailedLocationUploadRetryAfterMs(failedAtMs: number) {
  return failedAtMs + LOCATION_UPLOAD_RETRY_DELAY_MS;
}

export function getStaleSuccessfulLocationUploadAfterMs(uploadedAtMs: number) {
  return uploadedAtMs + SUCCESSFUL_LOCATION_UPLOAD_FRESHNESS_MS;
}

function isSuccessfulLocationUploadFresh({
  currentLocationSignature,
  lastSuccessfulLocationUpload,
  nowMs,
}: {
  currentLocationSignature: string;
  lastSuccessfulLocationUpload: SuccessfulLocationUpload | null;
  nowMs: number;
}) {
  if (lastSuccessfulLocationUpload?.signature !== currentLocationSignature) {
    return false;
  }

  return (
    nowMs <
    getStaleSuccessfulLocationUploadAfterMs(
      lastSuccessfulLocationUpload.uploadedAtMs,
    )
  );
}

export function shouldUploadCurrentLocation({
  canUploadCurrentLocation,
  currentLocation,
  failedLocationRetryAfterMs,
  hasPassengerLocationConsent,
  isUploadPending,
  lastAttemptedLocationSignature,
  lastSuccessfulLocationUpload,
  nowMs,
}: ShouldUploadCurrentLocationParams) {
  const currentLocationSignature = getCurrentLocationSignature(currentLocation);

  if (
    !canUploadCurrentLocation ||
    !hasPassengerLocationConsent ||
    !currentLocationSignature ||
    isUploadPending
  ) {
    return false;
  }

  if (
    failedLocationRetryAfterMs !== null &&
    nowMs < failedLocationRetryAfterMs
  ) {
    return false;
  }

  if (
    isSuccessfulLocationUploadFresh({
      currentLocationSignature,
      lastSuccessfulLocationUpload,
      nowMs,
    })
  ) {
    return false;
  }

  return (
    currentLocationSignature !== lastAttemptedLocationSignature ||
    failedLocationRetryAfterMs !== null
  );
}

export function shouldDisableRequestActions({
  isCancelPending,
  isAssignPending,
  isChecklistPending,
  isStatusPending,
  isUnavailablePending,
}: ShouldDisableRequestActionsParams) {
  return (
    isCancelPending ||
    isAssignPending ||
    isChecklistPending ||
    isStatusPending ||
    isUnavailablePending
  );
}

export function canExposeUnavailableReasonAction({
  canManageRequest,
  requestStatus,
  unavailableActionStatuses,
}: CanExposeUnavailableReasonActionParams) {
  return canManageRequest && unavailableActionStatuses.includes(requestStatus);
}
