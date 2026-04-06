# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

교움(Gyoum) - 교통약자 지원 요청 모바일 앱. Expo SDK 55 + React Native 0.83 기반이며, CNG(Continuous Native Generation) 방식으로 네이티브 코드를 관리한다. `ios/`, `android/` 디렉토리는 `expo prebuild`로 재생성되는 산출물이므로 직접 수정하지 않는다.

## Commands

```bash
yarn install              # 의존성 설치
yarn prebuild             # 네이티브 프로젝트 생성
yarn prebuild:clean       # 네이티브 프로젝트 초기화 후 재생성 (plugin/config 변경 시)
yarn start                # Metro 번들러 실행 (localhost dev-client 모드)
yarn start:clear          # Metro 캐시 초기화 후 실행
yarn start:tunnel         # 실기기용 tunnel 모드
yarn ios                  # iOS 빌드 (Metro 별도 실행 필요, --no-bundler)
yarn android              # Android 빌드
yarn typecheck            # TypeScript 타입 검사 (tsc --noEmit)
```

개발 시 `yarn start` → 새 터미널에서 `yarn ios` 순서로 실행한다. 네이티브 의존성이나 `app.config.ts` 변경 후에는 `yarn prebuild:clean && yarn ios`가 필요하다.

## Architecture

### Routing (Expo Router, file-based)

`src/app/` 디렉토리가 라우트를 정의한다. 라우트 파일은 얇은 래퍼이며 실제 UI는 `src/features/` 스크린 컴포넌트에 위임한다.

- `(public)/` - 인증 불필요 (sign-in)
- `(app)/` - 인증 필요 (`AuthProvider`의 `isAuthenticated`로 guard)
  - `(tabs)/` - 하단 탭 (홈, 요청, 이력, 프로필)
  - `support/`, `stations/`, `settings/` - 스택 화면들

### Feature 구조

`src/features/{feature-name}/` 아래에 `screens/`, `components/`, `hooks/`, `store/`, `types.ts`를 둔다.

### State Management

- **서버 상태**: TanStack Query v5. query key는 `src/lib/query/query-keys.ts`에 중앙 관리.
- **클라이언트 UI 상태**: Zustand (`src/store/app-store.ts`) - 테마, 폰트 크기, 고대비 등.
- **인증**: React Context (`src/providers/auth-provider.tsx`) - 현재 데모용 상태 관리만 연결. Role 타입: `passenger | staff | driver | admin`.

### Provider 계층

`AppProvider`가 다음 순서로 래핑: `GestureHandlerRootView` → `SafeAreaProvider` → `HeroUINativeProvider` → `ThemeProvider` → `QueryProvider` → `AuthProvider`.

### Styling

HeroUI Native 컴포넌트 + Uniwind(TailwindCSS v4 for RN). `className` prop으로 Tailwind 유틸리티 사용. Metro config에 `withUniwindConfig`가 적용되어 있고, CSS 엔트리는 `src/global.css`.

### API Client

`src/lib/api/client.ts`의 `apiFetch<T>()` - `credentials: 'include'` 기반. 백엔드 URL은 `EXPO_PUBLIC_API_BASE_URL` 환경변수 (기본 `http://localhost:8000`).

### Path Alias

`@/*` → `./src/*` (tsconfig paths)

## Environment Variables

- `EXPO_PUBLIC_API_BASE_URL` - API 서버 주소
- `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID` - 네이버 지도 Mobile App 클라이언트 ID (변경 시 `prebuild:clean` 필요)

## Product Requirements (Manyfast PRD)

### 서비스 목표

교통약자가 지하철을 안전하고 편리하게 이용할 수 있도록 모바일 앱을 통해 지원을 요청하고, 승차 역↔하차 역 간 역무원에게 정보가 실시간 공유되며, 기관사에게도 교통약자 탑승을 알려 안전한 승하차 환경을 조성한다.

### 사용자 역할 (Roles)

| ID | 역할 | 설명 |
|---|---|---|
| RWXKTJ | 교통약자 | 휠체어 사용자, 시각 장애인 등 지하철 이용에 도움이 필요한 승객 |
| YOWCWX | 역무원 | 지원 요청을 수신하고 현장에서 교통약자를 돕는 역 직원 |
| MWXAYR | 기관사 | 교통약자 탑승 열차의 운전자, 문 개폐 주의 알림 수신 |
| DPDAGQ | 관리자 | 로그/처리 시간 조회 등 서비스 운영 관리 |

### 지원 요청 상태 흐름

`접수` → `배정` → `지원 중` → `승차 완료` → `하차 대기` → `완료`
분기: 어느 단계에서든 `취소` 또는 `지원 불가` 가능

### 요구사항 요약 (Requirements)

| ID | 이름 | 중요도 |
|---|---|---|
| R-EMHDKW | 교통약자 지원 요청 및 취소 | high |
| R-PQSSAJ | 역무원 알림 및 지원 현황 관리 | high |
| R-ZYTKSR | 역 간 실시간 정보 공유 | high |
| R-DYCTWQ | 기관사 알림 시스템 | medium |
| R-AEVNJY | 역/경로 선택 및 빠른 요청 (검색, 즐겨찾기, 접근성) | high |
| R-NSLCFS | 지원 요청 상태 및 사용자 안내 (타임라인) | high |
| R-WLHXPL | 만남 위치 및 인상착의 입력 | medium |
| R-BRHXPG | 역무원 배정 및 인수인계 | low |
| R-TIBUYY | 지원 체크리스트 및 완료 처리 | high |
| R-SEPAKW | 기본 로그 및 처리 시간 기록 | medium |

### 주요 기능 (Features)

**교통약자 앱 (iOS/Android)**
- 지원 요청 생성: 출발/도착 역, 지원 유형(발판, 동행 안내 등) 다중 선택, 만남 위치 선택 + 메모
- 지원 요청 취소: 지원 시작 전까지 취소 가능, 취소 사유 선택, 관련자 실시간 전파
- 역 검색 및 선택: 자동완성/초성 검색, 최근 이용 조합, 즐겨찾기 역 관리
- 요청 상태 타임라인: 단계별 상태 표시, 다음 행동 안내, 상태 변경 알림(푸시/인앱)
- 접근성: 큰 글씨/고대비 설정

**역무원 전용 앱**
- 지원 요청 수신 및 배정: 미배정 큐, 담당자 지정, 교대 시 인수인계 메모
- 지원 단계 업데이트: 원클릭 상태 변경, 탑승 열차·칸 번호 입력
- 체크리스트 수행: 지원 유형별 자동 구성 체크리스트
- 완료/중단 처리: 결과 메모, 중단 사유(노쇼/긴급업무/지원 불가) 선택
- 하차 역 자동 공유: 열차 정보, ETA, 상태/담당자 변경 이력 실시간 전파

**기관사 알림**
- 교통약자 승차 확정(칸 번호 입력) 시 해당 열차 기관사에게 문 개폐 주의 알림 발송

**관리자**
- 이벤트 로그 기록 (요청ID, 이벤트 타입, 시각, 수행자)
- 기간/역 기준 평균 처리 시간 조회

### 유저플로우 (6개 섹션)

**s1. 인증/온보딩**
시작 → 로그인/회원가입 페이지 → 로그인 or 회원가입 → 역할 선택 → 역할별 홈으로 분기 (교통약자 홈 / 역무원 홈 / 기관사 알림 / 관리자 대시보드)

**s2. 교통약자 지원 요청**
교통약자 홈 → 지원 요청하기 → 역 검색/선택 (검색, 즐겨찾기, 최근 이용) → 지원 유형 선택 (휠체어, 시각 보조) → 만남 위치 설정 (위치 선택, 메모 입력) → 요청 확인/제출 → 요청 상태 타임라인 (취소 가능)
교통약자 홈에서 직접 요청 상태 타임라인으로도 진입 가능

**s3. 역무원 지원 관리**
역무원 홈 → 요청 목록 → 요청 상세 보기 → 요청 상세 (담당자 배정/이관, 위치 조회) → 지원 수행 (체크리스트, 열차 칸 입력, 상태 업데이트) → 완료/중단 처리

**s4. 기관사 알림**
기관사 알림 → 탑승 알림 확인

**s5. 관리자 대시보드**
관리자 대시보드 → 로그 조회 (이벤트 로그 검색) / 처리 시간 통계 (기간/역 필터)

**s6. 설정**
교통약자 홈 → 설정 → 접근성 설정 / 알림 설정 / 즐겨찾기 관리 (추가/삭제)

### 대상 디바이스

- 사용자 모바일 앱 (iOS, Android)
- 역무원 전용 기기 앱

## Key Dependencies

- **expo ~55.0**, **react-native 0.83**, **react 19.2**
- **heroui-native** - UI 컴포넌트 라이브러리
- **uniwind** + **tailwindcss v4** - 스타일링
- **@mj-studio/react-native-naver-map** - 네이버 지도
- **expo-location** - 위치 서비스
- **react-native-worklets** - babel plugin 필요 (`react-native-worklets/plugin`)
- **yarn 4.13** (packageManager)