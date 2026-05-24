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

`.env` 파일을 직접 생성하거나 `.env.example`을 복사해서 사용합니다.

```
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000     # Android 에뮬레이터
# EXPO_PUBLIC_API_BASE_URL=http://localhost:8000  # iOS 시뮬레이터
EXPO_PUBLIC_NAVER_MAP_CLIENT_ID=<네이버 Mobile App 키>
```

- NAVER 지도는 `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`를 사용합니다. 값은 NAVER Cloud의 `Mobile App`용 지도 키여야 합니다.
- 키를 바꾼 뒤에는 `yarn prebuild:clean` 후 development build를 다시 생성해야 합니다.

---

## 개발 환경 설정 (최초 1회)

### macOS

Android 에뮬레이터를 사용할 경우 `~/.zshrc` (또는 `~/.bash_profile`)에 추가:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
```

iOS 시뮬레이터만 쓴다면 별도 설정 불필요합니다.

### Windows

`ANDROID_HOME`과 `JAVA_HOME`을 시스템 환경 변수에 **영구 등록**해야 합니다.  
등록하지 않으면 Expo가 `adb reverse`를 실행할 수 없어 에뮬레이터가 Metro에 연결되지 않습니다.

**Windows 검색 → "시스템 환경 변수 편집" → 환경 변수** 에서:

| 변수 | 값 |
|---|---|
| `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr` |
| `ANDROID_HOME` | `C:\Users\{사용자명}\AppData\Local\Android\Sdk` |

**Path** 에 아래 항목 추가:

```
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

> 설정 후 터미널을 새로 열어야 적용됩니다. `adb version`으로 확인하세요.

---

## 개발 명령어

| 명령어 | 설명 |
|---|---|
| `yarn install` | 의존성 설치 |
| `yarn prebuild` | 네이티브 프로젝트 생성 |
| `yarn prebuild:clean` | 네이티브 프로젝트 초기화 후 재생성 |
| `yarn start` | Metro 번들러 실행 |
| `yarn start:clear` | Metro 캐시 초기화 후 실행 (연결 문제 시 사용) |
| `yarn start:tunnel` | 실기기용 tunnel 모드 Metro 실행 |
| `yarn ios` | iOS 빌드 + 시뮬레이터 실행 |
| `yarn android` | Android 빌드 + 에뮬레이터 실행 |
| `yarn typecheck` | TypeScript 타입 검사 |

---

## 권장 실행 순서

### iOS 시뮬레이터 (macOS)

```bash
yarn install
yarn prebuild
yarn start:clear        # 터미널 1: Metro 실행
# 새 터미널에서:
yarn ios                # 터미널 2: iOS 빌드 및 실행
```

### Android 에뮬레이터 (macOS / Windows)

**처음 설치하거나 네이티브 변경 후:**

```bash
yarn install
yarn prebuild
yarn android            # 빌드 + 설치 + Metro 자동 시작
```

**앱이 이미 설치된 경우:**

```bash
yarn start:clear        # Metro만 실행 → 에뮬레이터에서 자동 연결
```

### 네이티브 변경 후 (plugin / config / 의존성 변경 시)

```bash
yarn prebuild:clean
yarn ios    # 또는 yarn android
```

### 실기기 개발

```bash
yarn start:tunnel
```

---

## EAS 개발 빌드

원격 development build가 필요하면 아래처럼 사용할 수 있습니다.

```bash
npx eas-cli build --profile development --platform ios
npx eas-cli build --profile development --platform android
```

---

## 다음 우선순위

1. 실제 인증/세션 정책을 FastAPI와 맞추기
2. 역 검색 및 지원 요청 API schema 연결
3. 요청 상태 타임라인과 실시간 갱신 구조 연결
