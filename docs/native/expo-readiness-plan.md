# Expo Native Readiness Plan

Updated: 2026-05-14

## 목표

Persona Habit의 웹 프로토타입을 iOS와 Android 앱으로 옮길 때, 다시 만들 부분과 그대로 공유할 부분을 먼저 나눈다. 앱의 첫 출시는 “생활 스냅 -> 페르소나 성장 -> 오늘 기록 -> 모임 초대 -> 리포트” 루프를 안정적으로 돌리는 데 집중한다.

## 추천 구조

```text
apps/
  mobile/             Expo React Native app
  web/                Current Vite prototype or future web shell
packages/
  domain/             persona, journal, weather, social, memory pure logic
  design-tokens/      colors, type, spacing, motion names
  api-client/         auth, records, invite, weather, AI endpoints
```

현재 `src/lib`의 순수 함수는 `packages/domain`으로 옮기기 좋다. UI 컴포넌트는 웹과 네이티브가 다르기 때문에 화면은 재구현하되, 성장 규칙과 추천 규칙은 공유한다.

## 공유 가능한 도메인 로직

- `personaEngine`: XP, 레벨, 페르소나 요약, 숨은 습관 인사이트
- `journalEngine`: 한 줄 일기 정리 규칙, 페르소나 응답 톤
- `weatherEngine`: 날씨 카드 상태, 권한 상태, 브라우저/Open-Meteo 어댑터 인터페이스
- `socialEngine`: 모임 추천, 추천 피드백, 초대 링크 토큰, 공동 페르소나 XP, 첫 미션
- `memoryEngine`: 오래된 기억 큐레이션, 월별/장소별/페르소나별 필터
- `persistence`: 웹 localStorage와 네이티브 SecureStore/AsyncStorage를 감싸는 저장소 인터페이스, 모임/인사이트 피드백 상태

## 네이티브 권한 정책

카메라:

- 생활 스냅 촬영의 핵심 권한이다.
- 최초 진입에서 바로 요구하지 않고, 스냅 화면에서 촬영 버튼을 누를 때 요청한다.
- 거부 시 사진첩 업로드와 텍스트 기록 대체 경로를 제공한다.

사진첩:

- 기존 사진으로 스냅을 남기는 보조 경로다.
- iOS 제한 접근 상태를 고려해 선택한 사진만 사용하는 흐름을 우선한다.

위치:

- 날씨, 지역, 집에서 떨어진 거리, 장소 패턴 분석에 쓴다.
- 웹 프로토타입은 브라우저 위치 API와 Open-Meteo 형식의 현재 날씨 응답을 먼저 연결했다.
- 정확한 좌표는 서버 전송 전 사용 목적을 분리한다.
- 거부 시 “지역 없이 기록” 상태를 기본 지원한다.

푸시 알림:

- 연속 기록 압박보다 복귀 알림과 모임 미션 리마인드에 한정한다.
- 첫 주에는 알림 허용을 강하게 요구하지 않고, 사용자가 첫 미션을 만든 뒤 제안한다.

## 저장소와 백엔드 후보

MVP 로컬:

- Expo SecureStore: 토큰, 계정 세션
- AsyncStorage: 임시 스냅 초안, 모임 대기실, 인사이트 피드백
- FileSystem: 업로드 전 이미지 캐시

서비스 백엔드:

- Supabase: 빠른 인증, Postgres, Storage, Row Level Security에 유리
- Firebase: 푸시, 실시간 모임 상태, 모바일 SDK에 유리
- Convex: 프론트엔드 중심의 빠른 실시간 프로토타입에 유리

권장 순서:

1. Supabase로 계정, 스냅, 초대 링크, 이미지 저장을 먼저 붙인다.
2. Expo Notifications와 Supabase Edge Function으로 모임 미션 알림을 붙인다.
3. AI 일기와 인사이트는 별도 API로 분리해 민감 데이터 경계를 명확히 한다.

## 앱스토어 제출 전 최소 기능

- 온보딩: 생활 인증 대신 “생활 스냅” 또는 “오늘 스냅” 언어를 사용한다.
- 스냅: 촬영, 사진첩 선택, 필터/스티커, 저장 실패 상태.
- 집: 대표 페르소나 활동, 방 꾸미기, 페르소나 꾸미기.
- 오늘: 날씨/지역 상태, 한 줄 일기, AI 같이쓰기와 혼자 쓰기.
- 모임: 기록 기반 추천, 초대 링크 수락, 첫 스냅 미션.
- 리포트: 7일 요약, 오래된 기억, 인사이트 숨김/문구 순화.
- 개인정보: 위치, 사진, AI 분석 데이터 사용 목적 고지.
- 접근성: 버튼 레이블, 폰트 크기, 색 대비, 모션 줄이기 설정.

## 다음 구현 순서

1. `src/lib`를 `packages/domain`으로 옮겨 웹 테스트가 계속 통과하는지 확인한다.
2. `apps/mobile` Expo 앱을 만들고 탭 네비게이션과 빈 화면을 구성한다.
3. 스냅, 오늘, 집 화면 중 하나를 네이티브 UI로 포팅한다.
4. 카메라, 사진첩, 위치 권한 모듈을 화면 상태와 연결한다.
5. Supabase 스키마 초안을 만들고 스냅과 모임 세션 저장부터 연결한다.
