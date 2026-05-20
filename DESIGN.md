---
version: alpha
name: 교움 (Gyoum)
description: 교통약자 지하철 도움 서비스 — 차분한 인디고와 따뜻한 코랄을 기반으로 큰 터치 타깃과 접근성을 우선한 모바일 디자인 시스템.

colors:
  primary: "#2C5FCF"
  on-primary: "#FFFFFF"
  primary-dark: "#1E4AAB"
  primary-container: "#E8F0FE"
  primary-subtle: "#F4F7FE"
  accent: "#FF7A59"
  accent-container: "#FFF1ED"
  background: "#F5F7FA"
  surface: "#FFFFFF"
  surface-alt: "#F9FAFC"
  on-surface: "#0E1726"
  on-surface-mid: "#3D4759"
  on-surface-muted: "#6B7588"
  on-dark: "#FFFFFF"
  outline: "#E5E9F0"
  outline-strong: "#CFD5E0"
  success: "#06B47A"
  success-container: "#E6F8F1"
  danger: "#E63946"
  danger-container: "#FDECEE"
  warning: "#F59E0B"
  warning-container: "#FEF4E2"
  info: "#0EA5E9"
  info-container: "#E5F4FD"
  neutral: "#71717A"
  neutral-container: "#F4F4F5"

typography:
  caption-xs:
    fontFamily: Pretendard
    fontSize: 10px
    fontWeight: "600"
    lineHeight: 14px
    letterSpacing: 0.02em
  caption:
    fontFamily: Pretendard
    fontSize: 11px
    fontWeight: "500"
    lineHeight: 14px
  meta:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
  label-caps:
    fontFamily: Pretendard
    fontSize: 13px
    fontWeight: "600"
    lineHeight: 16px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Pretendard
    fontSize: 14px
    fontWeight: "500"
    lineHeight: 20px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Pretendard
    fontSize: 15px
    fontWeight: "600"
    lineHeight: 22px
    letterSpacing: -0.01em
  body:
    fontFamily: Pretendard
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Pretendard
    fontSize: 17px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: -0.01em
  number-lg:
    fontFamily: Pretendard
    fontSize: 22px
    fontWeight: "700"
    lineHeight: 28px
    letterSpacing: -0.02em
  title:
    fontFamily: Pretendard
    fontSize: 26px
    fontWeight: "700"
    lineHeight: 32px
    letterSpacing: -0.03em

rounded:
  xs: 6px
  sm: 12px
  chip: 14px
  button: 16px
  card: 18px
  pill: 999px

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 20px
  xl: 24px
  xxl: 32px

components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
  card-accent:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"

  cta-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
    padding: 0 24px
  cta-primary-disabled:
    backgroundColor: "{colors.outline-strong}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
  cta-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.on-primary}"
  cta-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
  cta-accent-soft:
    backgroundColor: "{colors.accent-container}"
    textColor: "{colors.accent}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
  cta-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
  cta-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
  cta-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
  cta-soft:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.button}"
    height: 56px
  cta-md:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.button}"
    height: 48px
  cta-sm:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.button}"
    height: 40px

  station-chip:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.chip}"
    padding: 14px 16px
  station-chip-selected:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.chip}"
    padding: 14px 16px

  toggle-chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.chip}"
    padding: 14px 16px
  toggle-chip-selected:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.chip}"
    padding: 14px 16px
  toggle-chip-icon-default:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    size: 40px
  toggle-chip-icon-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    size: 40px
  toggle-chip-checkbox:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.outline-strong}"
    rounded: "{rounded.xs}"
    size: 22px
  toggle-chip-checkbox-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xs}"
    size: 22px

  status-chip-received:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
  status-chip-assigned:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.warning}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
  status-chip-supporting:
    backgroundColor: "{colors.info-container}"
    textColor: "{colors.info}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
  status-chip-boarded:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.primary}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
  status-chip-waiting-arrival:
    backgroundColor: "{colors.warning-container}"
    textColor: "{colors.warning}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
  status-chip-completed:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.success}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
  status-chip-canceled:
    backgroundColor: "{colors.danger-container}"
    textColor: "{colors.danger}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px
  status-chip-unavailable:
    backgroundColor: "{colors.neutral-container}"
    textColor: "{colors.neutral}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: 5px 10px

  search-input:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    rounded: "{rounded.chip}"
    padding: 0 16px
    height: 52px
  search-input-clear:
    backgroundColor: "{colors.outline-strong}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.pill}"
    size: 22px

  app-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body}"
    height: 56px
    padding: 8px 20px 12px
  app-bar-back-button:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.pill}"
    size: 36px

  page-title:
    textColor: "{colors.on-surface}"
    typography: "{typography.title}"
  page-title-sub:
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-md}"

  section-label:
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.label-caps}"

  line-badge:
    backgroundColor: "{colors.primary-subtle}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption-xs}"
    rounded: "{rounded.pill}"
    size: 24px

  pulse-dot:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    size: 16px

  bottom-bar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface}"
    padding: 12px 20px 34px

  mini-map:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.chip}"
    height: 160px

  divider:
    backgroundColor: "{colors.outline}"
    height: 1px

  number-display:
    textColor: "{colors.on-surface}"
    typography: "{typography.number-lg}"
---

## Overview

교움은 **신뢰의 인디고(`#2C5FCF`)와 따뜻한 호출의 코랄(`#FF7A59`)** 두 축으로 구성된 모바일 디자인 시스템이다. 교통약자가 위급하거나 낯선 환경에서도 부담 없이 도움을 요청할 수 있도록 큰 터치 타깃(56px CTA), 18px 둥근 카드, Pretendard 한글 우선의 차분한 톤을 유지한다.

인디고는 *정보·신뢰·안정*을 담당하고 화면 어디서든 등장 가능하다. 코랄은 *요청 시작과 살아있음을 알리는 신호*이며 면적은 작게, 사용처는 의도적으로 절제한다. UI의 정서는 "고요하지만 명확한 안내"이며, 큰 채도 면적이나 다채색 그라데이션 같은 과시적 표현은 피한다.

대상은 한국 지하철(인천 1·2호선, 서울 1·2·3·9호선 등) 이용자이며, 노선 색은 데이터에 따라 동적으로 결정되므로 본 디자인 시스템의 토큰 색과는 분리한다.

## Colors

색상은 크게 네 그룹으로 나뉜다.

- **브랜드/액센트** — `primary`(`#2C5FCF`), `accent`(`#FF7A59`), 그리고 각 색의 `container` 변형. `primary`는 액션 버튼·선택 보더·"접수/승차완료" 상태 칩에 쓰이고, `accent`는 "요청 시작" CTA와 펄스 인디케이터에만 쓴다. `primary-dark`(`#1E4AAB`)는 hover·pressed용 예약, `primary-subtle`(`#F4F7FE`)는 매우 가벼운 강조 배경 예약, `accent-container`(`#FFF1ED`)는 보조 액센트 배경 예약이다.
- **표면/텍스트** — `background`(`#F5F7FA`)는 앱 캔버스, `surface`(`#FFFFFF`)는 카드와 AppBar 배경, `surface-alt`(`#F9FAFC`)는 검색바와 기본 StationChip 배경이다. 텍스트는 `on-surface`(`#0E1726`) 본문, `on-surface-mid`(`#3D4759`) 보조, `on-surface-muted`(`#6B7588`) 메타·캡션의 세 단계로만 다룬다.
- **보더** — `outline`(`#E5E9F0`)이 기본, `outline-strong`(`#CFD5E0`)은 비활성 버튼과 강한 구분선용.
- **시멘틱/상태** — `success`/`danger`/`warning`/`info`/`neutral`의 5색과 각 `*-container` 배경. 8가지 요청 상태에 일대일로 매핑된다.

### 8가지 요청 상태 매핑

| 상태 | text | bg | 의미 |
|---|---|---|---|
| `received` (접수) | `primary` | `primary-container` | 요청이 시스템에 들어옴 |
| `assigned` (배정됨) | `warning` | `warning-container` | 담당 역무원 배정 |
| `supporting` (지원 중) | `info` | `info-container` | 역무원이 현장 지원 중 |
| `boarded` (승차 완료) | `primary` | `primary-container` | 열차 탑승 완료 |
| `waitingArrival` (하차 대기) | `warning` | `warning-container` | 도착역에서 인계 대기 |
| `completed` (완료) | `success` | `success-container` | 정상 완료 |
| `canceled` (취소됨) | `danger` | `danger-container` | 사용자/관리자 취소 |
| `unavailable` (지원 불가) | `neutral` | `neutral-container` | 불가 사유 종결 |

### 시안 키 ↔ 표준 키 alias

원본 `ui-kit.jsx`의 `TOKENS` 객체는 다음 alias로 매핑된다. 시안 코드를 직접 읽는 개발자는 좌→우로 대응한다.

| 시안 키 | 표준 토큰 |
|---|---|
| `brand` | `primary` |
| `brandDark` | `primary-dark` |
| `brandLight` | `primary-container` |
| `brandSubtle` | `primary-subtle` |
| `accent` | `accent` |
| `accentLight` | `accent-container` |
| `bg` | `background` |
| `surface` | `surface` |
| `surfaceAlt` | `surface-alt` |
| `text` | `on-surface` |
| `textMid` | `on-surface-mid` |
| `textMuted` | `on-surface-muted` |
| `textOnDark` | `on-dark` |
| `border` | `outline` |
| `borderStrong` | `outline-strong` |
| `successBg`, `dangerBg`, `warningBg`, `infoBg` | `success-container`, `danger-container`, `warning-container`, `info-container` |

## Typography

본 시스템은 **Pretendard**를 1순위로, **Noto Sans KR**을 폴백, 시스템 sans-serif를 최종 폴백으로 사용한다. 두 폰트 모두 한글 자형 균형과 가독성이 좋아 작은 캡션부터 26px 페이지 타이틀까지 일관된 인상을 준다.

한글의 시각 무게를 보정하기 위해 16px 이상에는 `letterSpacing: -0.01em`, 페이지 타이틀(26px)에는 `-0.03em`을 적용한다. `caption-xs`처럼 매우 작은 텍스트에서는 양의 `letterSpacing(+0.02em)`을 줘 인지성을 높인다.

| 슬롯 | 크기 | 무게 | 주요 사용처 |
|---|---|---|---|
| `caption-xs` | 10px / 600 | LineBadge 안 노선 문자, MiniMap GPS 칩, 좌하단 거리 칩 |
| `caption` | 11px / 500 | StationChip 상단 라벨, 지도 마커 보조 라벨 |
| `meta` | 12px / 500 | StationChip 노선 메타, ToggleChip 서브, StatusBadge |
| `label-caps` | 13px / 600 | `SECTION` 형식 섹션 헤더 (uppercase) |
| `body-sm` | 14px / 500 | CTA `sm` 라벨, 작은 본문 강조 |
| `body-md` | 15px / 600 | CTA `md`, ToggleChip 라벨, PageTitle 보조 텍스트 |
| `body` | 16px / 600 | AppBar 타이틀, SearchInput 입력, StationChip 역명 |
| `body-lg` | 17px / 600 | 56px 큰 CTA 라벨 |
| `number-lg` | 22px / 700 | 요청 번호·ETA·큰 숫자 강조 (passenger/staff 화면) |
| `title` | 26px / 700 | 페이지 타이틀 H1 |

큰 화면(태블릿) 대응이나 사용자 폰트 설정에 의한 확대 스케일은 본 토큰을 비례 확장하는 별도 레이어로 처리한다.

## Layout & Spacing

레이아웃은 **4 / 8 / 12 / 16 / 20 / 24 / 32 px 그리드**를 따른다. 화면 좌우 내부 패딩은 `spacing.lg`(20px)가 기본이며, 카드 내부 패딩도 동일하게 20px이다. 카드 사이 세로 간격은 `spacing.base`(16px), 큰 섹션 사이는 `spacing.xl`(24px)을 쓴다.

AppBar는 본문 영역 56px 외에 iOS 노치/Dynamic Island를 위한 **60px 상단 안전 영역**을 추가로 가진다. BottomBar는 하단 홈 인디케이터를 위해 34px의 추가 하단 패딩을 둔다.

화면당 활성 56px CTA는 1개를 원칙으로 한다. 보조 액션은 `cta-md`(48px) 이하 사이즈나 `cta-ghost`로 강도를 낮춰 시각 위계를 유지한다. 칩 모양(StationChip, ToggleChip)은 항상 14px 라운드를 사용해 카드(18px)와 미세하게 구분된다.

## Elevation & Depth

본 시스템은 라이트 모드 인터페이스에 최적화되어 있어 **drop shadow보다 1px outline 보더와 색 채도 차**로 깊이를 만든다.

- **카드(`card`)** — `surface` 흰색 + 1px `outline` 보더. 그림자 없음.
- **강조 카드(`card-accent`)** — 1px `primary` 보더 + 0 0 0 3px `primary-container` 글로우. "현재 진행 중인 요청" 등 즉시 주목해야 하는 카드에만.
- **선택 칩(`station-chip-selected`, `toggle-chip-selected`)** — `primary-container` 배경 + 1.5~2px `primary` 보더로 명시적 선택 상태.
- **BottomBar** — `background` 색 위에 `backdrop-filter: blur(12px)`와 위→아래 그라데이션을 얹어 콘텐츠 위에 부드럽게 떠 있는 인상을 만든다.
- **MiniMap 오버레이 칩** — 반투명 흰색(`rgba(255,255,255,0.95)`) + 매우 약한 `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`로 지도 위에서만 예외적으로 그림자를 사용한다.

전체적으로 **두꺼운 그림자나 짙은 어둠은 사용하지 않는다.** 깊이가 필요하면 보더 두께·둥글기 차이·여백·색 채도로 표현한다.

## Shapes

곡률은 4단계로 정리된다.

- **`rounded.xs` 6px** — ToggleChip 안 체크박스(22×22).
- **`rounded.sm` 12px** — ToggleChip 안 아이콘 컨테이너(40×40).
- **`rounded.chip` 14px** — StationChip, ToggleChip 외곽, SearchInput, MiniMap.
- **`rounded.button` 16px** — 모든 CTA.
- **`rounded.card` 18px** — 표준 카드, 강조 카드.
- **`rounded.pill` 999px** — StatusBadge, BottomBar 거리/GPS 칩, AppBar 모드 탭.
- **원형(50%)** — LineBadge, AppBar 뒤로가기 버튼(36×36), 펄스 도트.

아이콘(Icons 묶음, 14종)은 **stroke 1.6~2.2px의 라운드 캡 선화**로 통일된다. 채우기 도형은 LineBadge 안 라벨처럼 의미가 분명한 경우에만 사용한다. 아이콘 기본 크기 22px, 컨테이너 안에서는 18~24px로 조정된다.

## Components

### 카드 (`card`, `card-accent`)

표준 카드는 `surface` 흰색 + 1px `outline` 보더 + 18px 라운드 + 20px 패딩이다. 강조 카드는 동일한 모양에 1px `primary` 보더와 3px `primary-container` 글로우(`box-shadow: 0 0 0 3px {colors.primary-container}`)를 더해 시각 우선순위를 표현한다. 카드가 클릭 가능하면 hover 시 transition 0.15s로 미세하게 transform·opacity를 조절한다.

### 큰 CTA 9종 (`cta-*`)

기본 CTA는 56px 높이의 풀폭 버튼이다. 변형은 의미에 따라 다음과 같다.

- `cta-primary` — 기본 액션 (인디고)
- `cta-accent` — "요청 시작" 같은 살아있는 호출 (코랄). 화면당 최대 1개.
- `cta-success` / `cta-danger` — 완료·취소 같은 시멘틱 액션
- `cta-ghost` — `surface` 배경 + 1.5px `outline` 보더 + `primary` 텍스트. 보조 액션용.
- `cta-soft` — `primary-container` 배경 + `primary` 텍스트. 강도가 더 낮은 보조 액션.
- `cta-accent-soft` — `accent-container` 배경 + `accent` 텍스트. 액센트 톤의 보조 액션.
- `cta-md` (48px), `cta-sm` (40px) — 화면 내 보조 위치용 사이즈 변형.
- `cta-primary-disabled` — `outline-strong` 배경 + opacity 0.5. `cta-primary-hover`는 `primary-dark` 배경.

`pressedScale: 0.98` 정도의 짧은 transform 피드백을 권장한다.

### 칩 (`station-chip`, `toggle-chip`)

`station-chip`은 역 선택용 카드형 칩으로 좌측 LineBadge + 역명 + 노선 메타 + 선택 시 우측 체크 마크의 구성이다. 기본 상태는 `surface-alt` 배경 + 1px `outline`, 선택 상태는 `primary-container` 배경 + 2px `primary` 보더.

`toggle-chip`은 지원 유형 등 다중 선택을 위한 칩으로 좌측 아이콘 컨테이너(40×40, `surface-alt` → 선택 시 `primary`) + 라벨/서브 + 우측 체크박스(22×22)의 구성이다. 기본 상태는 `surface` 배경 + 1.5px `outline`, 선택 상태는 `primary-container` 배경 + 1.5px `primary` 보더.

### 상태 칩 8종 (`status-chip-*`)

작은 pill 모양(rounded `pill`, 5px·10px 패딩, `meta` 12px 텍스트)에 12 색 의미 매핑을 그대로 따른다. 좌측에 6×6 도트(텍스트 색과 동일)를 두어 색맹·저시력 사용자도 라벨로 인지할 수 있도록 한다.

### 검색 인풋 (`search-input`)

`surface-alt` 배경, 1px `outline` 보더, 14px 라운드, 52px 높이. 좌측 22×22 검색 아이콘(`on-surface-muted` 색), 우측에는 값이 있을 때만 보이는 22×22 원형 클리어 버튼(`outline-strong` 배경, 흰 X 아이콘).

### 앱바 (`app-bar`)

`surface` 배경 + 하단 1px `outline` 보더. 본문 높이 56px + iOS 상단 안전 영역 60px. 좌측 36×36 원형 뒤로가기(`background` 채움, `on-surface` 화살표), 가운데 16px 타이틀, 우측 trailing 슬롯(알림 벨 등). 투명 모드(`transparent: true`) 사용 시 보더와 배경 모두 제거되어 콘텐츠 위에 오버레이된다.

### BottomBar (`bottom-bar`)

화면 하단 절대 위치 고정. `background` 색을 base로 backdrop blur(12px)와 위→아래 그라데이션을 더해 콘텐츠가 비치면서도 액션이 명확히 보이도록 한다. 내부에 CTA 1~2개를 둘 수 있다.

### LineBadge (`line-badge`)

24px 원형. **노선 색은 데이터에 따라 동적으로 채워지므로 본 디자인 시스템의 토큰 색에서 분리한다.** 라벨 텍스트는 `caption-xs` 흰색. 흰색 라인 색이 들어오는 예외 케이스에는 18% 알파 흰 배경 + 60% 알파 흰 보더로 invert 처리한다.

### 펄스 도트 (`pulse-dot`)

16px 코랄 도트 + 흰 3px 보더. 1.8초 ease-out 무한 펄스 애니메이션(0%: scale 1, opacity 0.5 → 100%: scale 2.2, opacity 0)으로 "현재 위치"·"진행 중" 신호를 표시한다.

### MiniMap (`mini-map`)

160px 높이, 14px 라운드, `surface-alt` 베이스. 도로/블록은 흰색 라인, 노선은 데이터에 따른 동적 노선 색. 사용자 위치는 코랄 펄스 도트, 가까운 역까지의 보행 경로는 코랄 점선. 좌하단에 거리 칩, 우상단에 GPS 칩(살아있음 표시).

### Divider (`divider`)

1px 두께, `outline` 색. 카드 내부 항목 구분에 사용. 좌우 inset 20px로 카드 패딩과 정렬.

## Do's and Don'ts

**Do**

- 정보·신뢰가 필요한 곳에는 `primary`(인디고)를 사용한다. 액션 버튼·선택 보더·"접수/승차완료" 상태가 대표 사례다.
- `accent`(코랄)는 살아있음을 알리는 신호로만 사용한다 — "교통지원 요청하기" CTA, 현재 위치 펄스 도트, MiniMap 위의 보행 경로 점선.
- 56px `cta-primary` 또는 `cta-accent`는 화면당 1개만 두고, 보조 액션은 `cta-md`·`cta-sm`·`cta-ghost`·`cta-soft`로 강도를 낮춘다.
- 상태 칩의 색은 의미에 고정되어 있다. `assigned`는 항상 `warning` 컬러, `completed`는 항상 `success` 컬러 식이다.
- 깊이는 보더·둥글기·색 채도 차이로 표현한다. `card-accent`의 1px primary 보더 + 3px primary-container 글로우가 표준 깊이 신호다.
- 한글 본문 16px 이상에는 `letterSpacing: -0.01em ~ -0.03em`를 적용해 자형 시각 무게를 보정한다.

**Don't**

- `primary`와 `accent`를 같은 화면에서 큰 면적으로 동시 사용하지 않는다. 두 색이 동시에 등장하면 한 쪽은 칩 정도의 작은 면적으로 제한된다.
- 상태 칩의 색을 임의 재해석하지 않는다 (예: "completed"를 brand 색으로 표시 금지). 시각·인지·문서 호환성을 모두 해친다.
- **지하철 노선 색은 본 디자인 시스템의 토큰으로 다루지 않는다.** 시안 `TOKENS` 객체에는 `line1Incheon`(`#7CA8D5`), `line2Incheon`(`#ED8B00`), `line1`(`#0052A4`), `line2`(`#00A84D`), `line3`(`#EF7C1C`), `line9`(`#BDB092`)가 있지만 이는 station/line 데이터에 따라 동적으로 결정되는 *데이터 색*이며 LineBadge·MiniMap 노선 path 안에서만 적용한다.
- 다채색 그라데이션·짙은 drop shadow·과한 채도 면적은 사용하지 않는다. 본 시스템의 인상은 "차분하고 명확함"이다.
- 라이트 모드 외 다크 모드 색은 본 문서 범위에서 다루지 않는다. 다크 모드가 필요할 때는 별도 surface/on-surface 변형 토큰을 정의하는 후속 작업으로 분리한다.
- AppBar `transparent` 모드는 콘텐츠 위 오버레이가 의도된 화면(MiniMap이 풀블리드인 경우 등)에서만 사용한다. 일반 페이지에서는 기본 배경을 유지한다.
