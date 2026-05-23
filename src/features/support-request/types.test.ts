import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import type {
  SupportRequestDetail,
  SupportRequestListItem,
  SupportRequestStatus,
  StaffQueueItemClassification,
} from './types.ts';

type DetailOnlySupportRequestField =
  | 'notes'
  | 'cancel_reason'
  | 'unavailable_reason'
  | 'completion_note';

type Expect<T extends true> = T;

type _ListItemOmitsDetailOnlyFields = Expect<
  Extract<
    keyof SupportRequestListItem,
    DetailOnlySupportRequestField
  > extends never
    ? true
    : false
>;

type _DetailKeepsDetailOnlyFields = Expect<
  DetailOnlySupportRequestField extends keyof SupportRequestDetail ? true : false
>;

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'passenger' | 'staff' | 'driver' | 'admin';
  station_id: string | null;
};

const require = createRequire(import.meta.url);
const {
  canPassengerUploadCurrentLocation,
  canStaffManageSupportRequest,
  canStaffViewPassengerCurrentLocation,
  canStaffViewSupportRequest,
  getSupportRequestStatusGuide,
  getStaffQueueItemClassification,
  isDestinationHandoffStaff,
} = require('./types.ts') as {
  canPassengerUploadCurrentLocation: (
    request: SupportRequestDetail,
    user: SessionUser | null,
  ) => boolean;
  canStaffManageSupportRequest: (
    request: SupportRequestDetail,
    user: SessionUser | null,
  ) => boolean;
  canStaffViewPassengerCurrentLocation: (
    request: SupportRequestDetail,
    user: SessionUser | null,
  ) => boolean;
  canStaffViewSupportRequest: (
    request: SupportRequestDetail,
    user: SessionUser | null,
  ) => boolean;
  getSupportRequestStatusGuide: (
    request: Pick<
      SupportRequestDetail,
      'status' | 'cancel_reason' | 'unavailable_reason' | 'completion_note'
    >,
  ) => string;
  getStaffQueueItemClassification: (
    request: SupportRequestListItem,
    user: SessionUser | null,
  ) => StaffQueueItemClassification | null;
  isDestinationHandoffStaff: (
    request: SupportRequestListItem,
    user: SessionUser | null,
  ) => boolean;
};

function createListItem(
  overrides: Partial<SupportRequestListItem> = {},
): SupportRequestListItem {
  return {
    id: 'REQ-1',
    status: 'in_progress',
    origin_station_id: 'STN-ICU',
    origin_station_name: '인천대입구역',
    destination_station_id: 'STN-CP',
    destination_station_name: '센트럴파크역',
    support_types: ['wheelchair'],
    meeting_point: 'elevator_concourse',
    passenger_name: '테스터',
    assigned_staff_name: '역무원',
    train_number: null,
    train_car_number: null,
    created_at: '2026-04-21T10:00:00Z',
    ...overrides,
  };
}

function createRequest(
  overrides: Partial<SupportRequestDetail> = {},
): SupportRequestDetail {
  return {
    ...createListItem(),
    passenger_id: 'USR-passenger',
    assigned_staff_id: 'USR-staff-origin',
    notes: '테스트',
    cancel_reason: null,
    unavailable_reason: null,
    completion_note: null,
    current_location: {
      latitude: 37.3881,
      longitude: 126.6434,
      accuracy_meters: 7.5,
      recorded_at: '2026-04-21T10:05:00Z',
    },
    checklist_items: [],
    events: [],
    ...overrides,
  };
}

function createStaffUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 'USR-staff-origin',
    name: '역무원',
    email: 'staff@example.com',
    role: 'staff',
    station_id: 'STN-ICU',
    ...overrides,
  };
}

function createPassengerUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 'USR-passenger',
    name: '승객',
    email: 'passenger@example.com',
    role: 'passenger',
    station_id: null,
    ...overrides,
  };
}

test('staff queue classifies origin station active work as origin processing', () => {
  const statuses: SupportRequestStatus[] = ['submitted', 'assigned', 'in_progress'];
  const user = createStaffUser();

  for (const status of statuses) {
    const classification = getStaffQueueItemClassification(
      createListItem({ status }),
      user,
    );

    assert.equal(classification?.kind, 'origin_processing');
    assert.equal(classification?.isActionable, true);
  }
});

test('staff queue classifies destination boarded work as destination handoff', () => {
  const statuses: SupportRequestStatus[] = ['boarded', 'awaiting_dropoff'];
  const user = createStaffUser({
    id: 'USR-staff-destination',
    station_id: 'STN-CP',
  });

  for (const status of statuses) {
    const classification = getStaffQueueItemClassification(
      createListItem({ status }),
      user,
    );

    assert.equal(classification?.kind, 'destination_handoff');
    assert.equal(classification?.isActionable, true);
  }
});

test('staff queue classifies origin boarded work as handoff monitoring', () => {
  const statuses: SupportRequestStatus[] = ['boarded', 'awaiting_dropoff'];
  const user = createStaffUser();

  for (const status of statuses) {
    const classification = getStaffQueueItemClassification(
      createListItem({ status }),
      user,
    );

    assert.equal(classification?.kind, 'origin_handoff_monitoring');
    assert.equal(classification?.isActionable, false);
  }
});

test('staff queue ignores unrelated stations and terminal items', () => {
  assert.equal(
    getStaffQueueItemClassification(
      createListItem({ status: 'assigned' }),
      createStaffUser({ station_id: 'STN-OTHER' }),
    ),
    null,
  );

  assert.equal(
    getStaffQueueItemClassification(
      createListItem({ status: 'completed' }),
      createStaffUser(),
    ),
    null,
  );

  assert.equal(
    getStaffQueueItemClassification(createListItem(), createPassengerUser()),
    null,
  );
});

test('assigned origin staff can still view boarded request for handoff continuity', () => {
  const request = createRequest({
    status: 'boarded',
    assigned_staff_id: 'USR-staff-origin',
  });
  const user = createStaffUser();

  assert.equal(canStaffViewSupportRequest(request, user), true);
  assert.equal(canStaffManageSupportRequest(request, user), false);
});

test('destination staff manages boarded handoff through completion', () => {
  const user = createStaffUser({
    id: 'USR-staff-destination',
    station_id: 'STN-CP',
  });

  for (const status of ['boarded', 'awaiting_dropoff'] as SupportRequestStatus[]) {
    assert.equal(canStaffManageSupportRequest(createRequest({ status }), user), true);
    assert.equal(isDestinationHandoffStaff(createListItem({ status }), user), true);
  }
});

test('origin staff can view passenger current location before boarding', () => {
  assert.equal(
    canStaffViewPassengerCurrentLocation(createRequest(), createStaffUser()),
    true,
  );
});

test('passenger current location is hidden without location data', () => {
  assert.equal(
    canStaffViewPassengerCurrentLocation(
      createRequest({ current_location: null }),
      createStaffUser(),
    ),
    false,
  );
});

test('passenger current location is hidden from non-origin staff and passengers', () => {
  const request = createRequest();

  assert.equal(
    canStaffViewPassengerCurrentLocation(
      request,
      createStaffUser({
        id: 'USR-staff-destination',
        station_id: 'STN-CP',
      }),
    ),
    false,
  );

  assert.equal(
    canStaffViewPassengerCurrentLocation(request, createPassengerUser()),
    false,
  );
});

test('passenger current location is hidden once the passenger has boarded', () => {
  const hiddenStatuses: SupportRequestStatus[] = [
    'boarded',
    'awaiting_dropoff',
    'completed',
    'cancelled',
    'unavailable',
  ];

  for (const status of hiddenStatuses) {
    assert.equal(
      canStaffViewPassengerCurrentLocation(
        createRequest({ status }),
        createStaffUser(),
      ),
      false,
    );
  }
});

test('passenger can upload current location only while request is active before boarding', () => {
  const request = createRequest();

  assert.equal(canPassengerUploadCurrentLocation(request, createPassengerUser()), true);

  assert.equal(
    canPassengerUploadCurrentLocation(
      createRequest({ status: 'boarded' }),
      createPassengerUser(),
    ),
    false,
  );
});

test('support request status guide shows terminal reason and note details', () => {
  assert.equal(
    getSupportRequestStatusGuide(
      createRequest({
        status: 'cancelled',
        cancel_reason: 'no_longer_needed',
      }),
    ),
    '취소 사유: 도움이 더 이상 필요하지 않아요.',
  );

  assert.equal(
    getSupportRequestStatusGuide(
      createRequest({
        status: 'unavailable',
        unavailable_reason: 'urgent_duty',
      }),
    ),
    '지원 불가 사유: 긴급 업무 대응이 필요해졌어요.',
  );

  assert.equal(
    getSupportRequestStatusGuide(
      createRequest({
        status: 'completed',
        completion_note: '엘리베이터 앞까지 동행 완료',
      }),
    ),
    '완료 메모: 엘리베이터 앞까지 동행 완료',
  );
});
