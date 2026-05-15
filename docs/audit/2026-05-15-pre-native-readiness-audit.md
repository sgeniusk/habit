# 출시 직전 Readiness Audit

Updated: 2026-05-15
Reviewers: code-reviewer + architect + security-reviewer 병렬 audit
Scope: 웹 MVP 가 자평한 "마감" 상태가 iOS/Android 출시 직전 수준에 부합하는지 비판적 점검

## 결론

웹 MVP 흐름과 시각 QA 는 마감되었지만, **출시 후 첫 주에 사용자 데이터가 손상될 수 있는 P0 다섯 가지** 와 **App Store 심사를 통과하지 못할 P0 두 가지** 가 남아 있다. 또한 네이티브 전환 시 재사용 가능한 도메인 로직(`src/lib/*`)은 75% 수준으로 잘 분리됐지만, **플랫폼 의존 코드(카메라/저장소/공유)가 view 안에 하드 결합** 되어 있어 어댑터 레이어가 시급하다.

## P0 — 출시 차단 (코드/문서 변경 필수)

### A. 데이터 안전 — 첫 주에 사용자 데이터를 잃을 위험

1. **localStorage 쓰기 무방비** ([src/lib/persistence.ts](src/lib/persistence.ts))
   - 모든 `setItem` 호출이 try-catch 없이 실행됨. 사진 Base64 가 누적되면 5MB quota 에서 throw 되고, 모든 기존 스냅/설정/모임 데이터가 동시에 저장 불가가 됨.
   - iOS Safari 의 7일 미방문 eviction 정책에 영향 받음.

2. **React Error Boundary 부재** ([src/main.tsx](src/main.tsx), [src/App.tsx](src/App.tsx))
   - 어떤 비동기 예외(snapExport canvas, JSON.parse, FileReader)도 화이트 스크린 유발.

3. **EXIF/GPS 메타데이터가 원본 Base64 로 저장됨** ([src/App.tsx:179-201](src/App.tsx))
   - `FileReader.readAsDataURL` 원본을 그대로 `imageUrl` 에 영구 보관. 디바이스 공유 시 GPS 좌표 노출.

4. **이미지를 localStorage 에 저장하는 구조 자체가 출시 불가능** ([src/types/habit.ts:37](src/types/habit.ts), [src/lib/persistence.ts:88-89](src/lib/persistence.ts))
   - 사진 2~3장이면 quota 초과. IndexedDB/OPFS 분리가 필수.

5. **localStorage schema 검증 미흡** ([src/lib/persistence.ts:141](src/lib/persistence.ts))
   - `loadSnapRecords` / `loadMeetSession` 이 `as T` 캐스팅만 함. 앱 업데이트 후 schema drift 시 조용한 런타임 에러.

### B. 출시 심사 — Apple/Google 심사 거절 사유

6. **인증/계정 시스템 완전 부재**
   - `userId`, `login`, `auth`, `session` 관련 코드 0건. App Store 의 Apple Sign In 의무, Google Play 의 계정 삭제 기능 의무, 모임/공유의 진짜 구현 모두 불가.

7. **개인정보 처리방침/약관/사용 설명 부재**
   - `privacy`, `terms`, `개인정보`, `동의` 키워드 코드/문서에 0건. `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, App Privacy Data Collection 라벨, PIPA 처리방침 페이지 모두 자리 없음.

### C. 네이티브 전환 차단

8. **플랫폼 어댑터 레이어 부재**
   - 카메라/사진 입력이 [src/views/SnapView.tsx:148-153](src/views/SnapView.tsx) 의 `<input type="file" capture="environment">` 로 하드코딩.
   - 공유 PNG export 가 [src/lib/snapExport.ts:128-144](src/lib/snapExport.ts) 에서 `document.createElement`, `CanvasRenderingContext2D` 에 직접 결합.
   - 저장소가 `window.localStorage` 동기 API 에 결합.
   - RN 으로 이전 시 위 3개를 모두 교체해야 하고, 인터페이스가 없으면 view 전체를 다시 써야 함.

## P1 — 출시 직전 마감 (베타 닫기 전까지)

9. **i18n 누락 약 80건** — HomeView/MeetView/TodayView/ReportView 의 한국어 하드코딩이 i18n 사전을 우회. 영어 모드 전환 시 절반 이상이 한국어로 남음.
10. **App.tsx 의 18개 useState 와 SnapView 의 30개+ prop drilling** — 새 기능 추가 시 prop 폭주.
11. **`HabitInsight.confidence` 가 한국어 리터럴 union** — 영어 모드에서도 "높음/보통/낮음" 노출.
12. **하드코딩 목업 데이터가 production 에 노출** — `TodayView` 의 streak 6일, 진행률 68%, "+28xp" 모임 기여, `MeetView` 의 RoomRow 3개가 상수.
13. **디버그 버튼 production 노출** — [src/views/TodayView.tsx:257-261](src/views/TodayView.tsx) 의 "권한 거부 미리보기", "실패 상태 보기".
14. **에러 모니터링/분석 없음** — Sentry/PostHog/Amplitude 모두 부재. 출시 후 무엇이 깨졌는지 알 방법 없음.
15. **위치 좌표 평문 전송 + 처리방침 부재** — Open-Meteo 에 위도/경도 전송하지만 고지 없음.
16. **푸시 알림 인프라 부재** — 리텐션의 핵심 채널 0.
17. **AI 인사이트가 모두 규칙 기반** — LLM 호출 경계/API 키 관리/캐시/안전 필터 자리 없음.
18. **CSP/SRI 부재 + 외부 CDN 폰트** — [src/styles.css:1](src/styles.css) 의 jsdelivr `@import`. `vercel.json` 에 security headers 없음.
19. **초대 토큰 예측 가능** — `running-meet-88` 등 6가지 고정값. 만료/검증/rate limit 없음.

## P2 — 출시 후 30일 안

20. **호환 type alias 잔류** — `VerificationRecord`, `MeetSignalRecord`, `MemorySignalRecord` 가 모두 `SnapRecord` 의 별칭으로 남음.
21. **`hobby` 카테고리 unreachable** — [src/types/habit.ts:11](src/types/habit.ts) 에 정의됐지만 [src/data/personaCatalog.ts](src/data/personaCatalog.ts) 의 `categoryOptions` 에 없고 PersonaCard 도 없음.
22. **번들 224kB / code splitting 없음** — `React.lazy` 로 탭별 분리하면 초기 로드 40% 절감 가능.
23. **Record ID `Date.now()` 충돌 가능** — [src/App.tsx:140](src/App.tsx). `crypto.randomUUID()` 권장.
24. **`snapExport.ts` 필터 매핑이 한국어 키 하드코딩** — i18n 으로 필터 라벨이 영어가 되면 매핑이 깨짐.
25. **`App.tsx:119` 의 `Intl.DateTimeFormat("ko-KR", ...)` 하드코딩** — 영어 모드에서도 한국어 형식.
26. **시각 회귀/디바이스 매트릭스 테스트 없음** — 6개 view 중 `SnapView.test.tsx` 1개만.
27. **iOS HIG / Android MD 미준수** — Safe Area, 네이티브 내비게이션, 동적 타입, 시스템 다크모드 모두 부재.

## 강점 (유지할 자산)

- 도메인 로직 분리 **75% RN 호환** (`src/lib/*` 약 2,000줄 중 ~1,500줄 그대로 재사용 가능).
- `WeatherAdapter` 패턴이 플랫폼 어댑터 분리의 좋은 선례.
- `any` 캐스팅 0건, `console.log` 0건, `innerHTML`/`eval` 0건. XSS 방어 우수.
- `persistence.ts` 의 `loadJson` 헬퍼가 JSON.parse 실패 시 자동 복구.
- 70개 통과 테스트가 happy path E2E 흐름 견고하게 보증.
- npm audit 취약점 0건, dependabot + CI 최소 권한.
- 위치 좌표는 영구 저장하지 않고 distance 만 보관.

## 권장 작업 묶음 순서

### 묶음 1 — "안전 묶음" (코드만, 외부 인프라 없음, 2~3일)

출시 후 첫 주의 크래시/데이터 손실을 막는다.

- Error Boundary 도입 + main.tsx 에서 App 감싸기
- `persistence.ts` 전체 `setItem` 을 try-catch + quota toast UI
- 사진 업로드 시 canvas resize 로 EXIF 제거 + 클린 JPEG 재인코딩
- 이미지를 IndexedDB 어댑터로 분리 (`StorageAdapter` 인터페이스 자리)
- `loadSnapRecords` / `loadMeetSession` 에 schema guard
- `crypto.randomUUID()` 로 record ID 충돌 방지
- TodayView 의 디버그 버튼을 `import.meta.env.DEV` 가드

### 묶음 2 — "어댑터 묶음" (코드만, 외부 인프라 없음, 3~5일)

네이티브 전환을 향한 가장 큰 ROI 작업.

- `ImagePickerAdapter`, `ShareAdapter`, `SnapExportRenderer`, `StorageAdapter` 4개 인터페이스 정의
- 웹 구현체 분리 (`src/lib/adapters/web/*`)
- `src/lib/*` 의 비-순수 함수(snapExport DOM 코드, persistence storage 기본값)를 어댑터 호출로 교체
- `WeatherAdapter` 패턴과 정렬

### 묶음 3 — "UX 마감 묶음" (코드만, 1~2일)

출시 직전 다듬기.

- i18n 사전 확장 (모임/리포트/페르소나 말투 ko/en)
- `HabitInsight.confidence` 를 내부 enum 으로 분리하고 표시 레이어에서 locale 변환
- TodayView 의 하드코딩 목업을 records 기반 계산으로 교체
- `App.tsx` 의 useState 18개를 `useSnapForm`, `useUserPreferences` 등 hook 으로 분리

### 묶음 4 — "심사 묶음" (코드 + 문서 + 외부 결정, 2~3일)

App Store 심사 통과를 위한 최소 묶음.

- `vercel.json` 에 CSP/X-Content-Type-Options/X-Frame-Options 헤더 추가
- 개인정보 처리방침/이용약관 정적 페이지 작성
- 위치/카메라/사진 권한 사용 설명 문구 정리
- App Privacy Data Collection 라벨 초안 (외부 인프라 결정 의존)

### 묶음 5 — "백엔드 묶음" (외부 인프라 결정 필요, 5~7일)

사용자의 외부 서비스 선택 후 진행.

- Supabase Auth (Apple/Google/Email) 흐름
- `snap_records` / `user_preferences` / `meet_sessions` 테이블 스키마
- 이미지 Storage 업로드 + CDN URL 교체
- localStorage → Supabase 마이그레이션 함수
- RLS 정책

### 묶음 6 — "모니터링/알림 묶음" (외부 인프라 결정 필요, 3~4일)

- Sentry SDK + 소스맵 업로드
- PostHog 이벤트 3개 (snap_saved, meet_invited, insight_viewed)
- Expo Notifications + 모임 미션 리마인드 1종

## 자율 진행 계획

묶음 1~3 은 외부 인프라 결정 없이 진행 가능하고, 묶음 4~6 은 사용자 결정이 필요하다. 자율 진행 시 다음 순서로 간다.

1. 묶음 1 (안전) → 푸시 → Vercel 확인
2. 묶음 2 (어댑터) → 푸시 → Vercel 확인
3. 묶음 3 (UX 마감) → 푸시 → Vercel 확인
4. 묶음 4~6 은 사용자 결정 (Supabase/Sentry/Expo 선택, 외부 서비스 셋업)

각 묶음 끝마다 [docs/alpha/persona-habit-mvp-checklist.md](docs/alpha/persona-habit-mvp-checklist.md) 와 [docs/roadmap/persona-habit-roadmap.md](docs/roadmap/persona-habit-roadmap.md) 를 갱신한다.

## 검증 환경

- 로컬: `npm run ci` 통과 (lint + format:check + test:run + build + audit)
- GitHub Actions: 동일 명령 push/PR 시 자동 실행
- Production: <https://habit-six-gamma.vercel.app/>

## 참고

이 보고서는 origin/main HEAD = `9f46c947 Mark MVP production QA complete` 시점 기준이다. 묶음 1 진행 시점에 새 audit 라운드는 필요하지 않다.
