# 교움 모바일 앱

Expo Router 기반의 React Native 앱 초기 뼈대입니다.

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

## 다음 우선순위

1. 실제 인증/세션 정책을 FastAPI와 맞추기
2. 역 검색 및 지원 요청 API schema 연결
3. 요청 상태 타임라인과 실시간 갱신 구조 연결
