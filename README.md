# 교움 모바일 앱

Expo Router 기반의 React Native 앱입니다. 로컬 개발 표준은 `Expo Go`가 아니라 `CNG + config plugin + development build`입니다.

## 핵심 구조

- `src/app`: 파일 기반 라우트 전용
- `src/features`: 기능별 화면/상태
- `src/providers`: Query, Auth, Theme, HeroUI provider 조합
- `src/lib`: API 클라이언트, query 유틸리티
- `src/store`: 앱 전역 UI 상태

## 현재 상태

- 인증: 데모 상태 관리만 연결
- API: `credentials: 'include'` 기반 fetch 클라이언트만 준비
- 상태: `TanStack Query + zustand`
- UI: `HeroUI Native + Uniwind`
- 빌드 워크플로: `expo-dev-client` 기반 development build 사용

## CNG 원칙

- 네이티브 설정의 source of truth는 `app.config.ts`와 config plugin입니다.
- `ios/`, `android/`는 직접 관리 대상이 아니라 `prebuild`로 재생성되는 산출물입니다.
- 네이티브 라이브러리 추가, plugin 변경, app config 변경 후에는 `prebuild`와 재빌드가 필요합니다.
- 시뮬레이터 기본 흐름은 `localhost`, 실기기 기본 흐름은 `tunnel` 또는 명시적 LAN 검증입니다.

## 환경 변수

- NAVER 지도는 `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`를 사용합니다.
- 값은 NAVER Cloud의 `Mobile App`용 지도 키여야 하며, 웹용 `PAGE_URL` 설정은 더 이상 사용하지 않습니다.
- 기존 `EXPO_PUBLIC_NAVER_MAP_PAGE_URL`만 남아 있어도 `ncpKeyId`를 임시 호환 처리하지만, 새 기준은 `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`입니다.
- 키를 바꾼 뒤에는 `yarn prebuild:clean` 후 development build를 다시 생성해야 합니다.

## 개발 실행

### 1. 의존성 설치

```bash
yarn install
```

### 2. 개발 빌드 준비

```bash
yarn prebuild
```

### 3. 로컬 개발 빌드 생성

```bash
yarn ios
yarn android
```

### 4. Metro 서버 실행

```bash
yarn start
```

- `yarn start`는 `EXPO_PACKAGER_PROXY_URL=http://localhost:8081`를 함께 사용해 dev client가 localhost를 우선 열도록 강제합니다.
- 캐시/최근 세션 문제가 의심되면 `yarn start:clear`를 사용합니다.
- 실기기 개발 시에는 `yarn start:tunnel`로 Metro를 열어 네트워크 영향을 줄입니다.
- iOS Simulator에서는 `yarn start`를 먼저 실행한 뒤, 새 터미널에서 `yarn ios`를 실행합니다.
- `yarn ios`는 번들러를 다시 띄우지 않고 현재 실행 중인 localhost Metro에 연결하며, dev client open URL도 localhost로 고정합니다.
- `expo-dev-client`는 `launcher` 모드로 설정되어 최근 LAN 프로젝트를 자동 재개하지 않도록 유지합니다.

### 권장 실행 순서

```bash
yarn install
yarn prebuild
yarn start:clear
```

새 터미널에서:

```bash
yarn ios
```

네이티브 의존성, Expo plugin, `app.config.ts` 변경 후에는 아래 순서를 다시 수행합니다.

```bash
yarn prebuild:clean
yarn ios
```

## EAS 개발 빌드

원격 development build가 필요하면 아래처럼 사용할 수 있습니다.

```bash
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile development --platform android
```

## 다음 우선순위

1. 실제 인증/세션 정책을 FastAPI와 맞추기
2. 역 검색 및 지원 요청 API schema 연결
3. 요청 상태 타임라인과 실시간 갱신 구조 연결
