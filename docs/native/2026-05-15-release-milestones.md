- 웹 MVP 마감 이후 iOS/Android 정식 출시까지의 7 개 마일스톤과 의존성을 한눈에 본다.

# 출시까지 마일스톤

Updated: 2026-05-15
Reference: [docs/audit/2026-05-15-pre-native-readiness-audit.md](../audit/2026-05-15-pre-native-readiness-audit.md), [docs/native/expo-readiness-plan.md](./expo-readiness-plan.md), [docs/research/2026-05-15-first-flow-interview-kit.md](../research/2026-05-15-first-flow-interview-kit.md)

## 결론 — 지금까지가 마감 정리, 앞으로가 본 게임

지금까지 main 에 반영된 17 커밋 + 데이터 모델 i18n + CSP 헤더는 모두 **웹 MVP 마감 정리** 다. iOS/Android 정식 출시까지는 새 프로젝트 분량의 작업이 남아 있고, 디바이스 학습 + 외부 인프라 셋업 + 심사 대기까지 합치면 **8 ~ 16 주** 가 더 필요하다.

이 문서는 그 시간을 7 개 마일스톤 (M0 ~ M6) 으로 나누어 각 단계의 산출물, 의존성, 위험을 한눈에 정리한다.

## 마일스톤 표

| 단계   | 명칭                         | 분량                     | 의존성        | 핵심 산출물                                                                           |
| ------ | ---------------------------- | ------------------------ | ------------- | ------------------------------------------------------------------------------------- |
| **M0** | 웹 MVP 후보                  | 완료 (2026-05-15)        | —             | 5 탭 프로토타입, 안전 묶음, 4 종 어댑터, view + 데이터 모델 i18n, CSP 헤더            |
| **M1** | 사용자 검증                  | 1 ~ 2 주                 | 모집 + 인터뷰 | 3 명 인터뷰 + P0 재확정 + 로드맵 갱신                                                 |
| **M2** | 출시 인프라 결정             | 3 ~ 5 일                 | M1 결과       | Supabase/Firebase/Convex 비교, Sentry/PostHog 선택, AI 모델 비용 정책                 |
| **M3** | 백엔드 + 인증 + 마이그레이션 | 2 ~ 3 주                 | M2            | Supabase Auth (Apple/Google), 스냅/모임/이미지 스키마, localStorage 마이그레이션, RLS |
| **M4** | 네이티브 전환                | 3 ~ 5 주                 | M3            | Expo monorepo, 5 화면 RN 포팅, 카메라/사진첩/위치/푸시 권한 모듈                      |
| **M5** | 심사 준비                    | 1 ~ 2 주 + 심사 1 ~ 2 주 | M4            | 처리방침/약관, 권한 사용 설명, 스크린샷, 메타데이터, App Privacy 라벨                 |
| **M6** | 출시 + 운영                  | 1 주 + 지속              | M5            | App Store / Google Play 제출, Sentry/PostHog 활성, Expo Notifications 첫 리마인드     |

**합산 8 ~ 16 주.** 디자이너 협업, 변호사 검토, 사용자 인터뷰 일정에 따라 변동.

## 각 마일스톤 상세

### M0 — 웹 MVP 후보 (완료)

산출물.

- [docs/audit/2026-05-15-pre-native-readiness-audit.md](../audit/2026-05-15-pre-native-readiness-audit.md) — P0/P1/P2 우선순위 + 6 묶음 권고.
- 안전 묶음 — Error Boundary, localStorage quota/EXIF 보호, UUID, 디버그 가드, storage warning.
- 어댑터 묶음 — Storage, Share (Web Share API), ImagePicker, SnapRenderer.
- UX 마감 묶음 — confidence enum, TodayView mock 제거, 5 개 view 의 사전 i18n.
- 데이터 모델 i18n — PersonaCard / socialEngine / journalEngine / personaIdentity / memoryEngine.
- vercel.json 보안 헤더 — CSP, X-Frame-Options, HSTS 등.

남은 흠.

- App.tsx 의 18 개 useState hook 분리는 보류 (M4 화면 RN 포팅 시 같이 정리).
- 페르소나 카탈로그 확장 (Phase 2 잔여), 일기 타임라인 (Phase 3 잔여), 모임 리포트 (Phase 4 잔여) 는 M1 인터뷰 결과 후 우선순위 재조정.

### M1 — 사용자 검증 (1 ~ 2 주)

목표. 가상 테스터 평가에서 도출한 P0 가 실제 사용자에게도 P0 인지 확인. PRD 의 성공 기준 5 개 달성도 측정.

입력. [docs/research/2026-05-15-first-flow-interview-kit.md](../research/2026-05-15-first-flow-interview-kit.md) 키트.

활동.

1. 3 명 모집 (학생/직장인/소셜 그룹 사용자 중심).
2. 인터뷰 진행 (1 인당 40~45 분, 화면 녹화).
3. 결과 보고서 작성 (`docs/research/2026-MM-DD-first-flow-interview-report.md`).
4. P0 재확정 → audit 보고서와 로드맵 갱신.

완료 기준.

- 3 인 인터뷰 종료 + 가명 처리된 보고서 작성.
- 가상 평가와 실제 응답의 가장 큰 차이 3 개 명시.
- 다음 묶음 우선순위 재조정 (예: 백엔드 먼저 vs 네이티브 먼저).

위험.

- 사용자가 핵심 가설을 부정하면 PRD 자체 재검토 필요 (제품 방향 큰 변경).
- 사용자가 카메라 권한 없는 웹 데모를 어색해하면 M3/M4 우선순위가 빨라짐.

### M2 — 출시 인프라 결정 (3 ~ 5 일)

목표. 외부 서비스 결정 + 비용 시나리오 작성. 코드 작업 거의 없음.

활동.

1. Supabase vs Firebase vs Convex 비교 (인증/푸시/실시간 모임 기준).
2. Sentry vs Bugsnag, PostHog vs Amplitude vs Mixpanel 비교.
3. AI 모델 선택 (Claude/GPT/Gemini) + 월 비용 시나리오.
4. 도메인 결정 (`habit-six-gamma.vercel.app` → 커스텀).
5. 개인정보 처리방침 작성 주체 결정 (직접 vs 변호사).

완료 기준.

- 외부 서비스 3 종 (백엔드/모니터링/AI) 확정.
- 월 운영 비용 추정.
- App Store / Google Play Developer 계정 셋업.

### M3 — 백엔드 + 인증 + 마이그레이션 (2 ~ 3 주)

목표. 익명 로컬 데이터를 서버 영속화로 옮기고 모임/공유의 진짜 구현 가능성 확보.

활동.

1. Supabase 프로젝트 생성, 스키마 작성.
   - 테이블: `users`, `snap_records`, `personas`, `meet_sessions`, `meet_members`, `insight_feedback`.
   - RLS 정책으로 타인 데이터 접근 차단.
2. Apple/Google Sign In 흐름 (Supabase Auth).
3. Storage 버킷 + 이미지 업로드 + CDN URL 교체.
4. localStorage → Supabase 마이그레이션 함수 (앱 첫 진입 시 자동 동기화).
5. 모임 초대 토큰을 server-generated 128bit 랜덤으로 교체 (audit P1 #19).
6. 이미지를 IndexedDB 임시 캐시 + 서버 업로드 흐름 (audit P0 #4).

완료 기준.

- 로그인 → 스냅 저장 → 다른 기기에서 로드 E2E.
- RLS 로 타인 데이터 접근 차단 확인.
- localStorage 데이터 손실 위험 종료.

위험.

- 익명 로컬 사용자가 가입 강제 시 이탈할 수 있음. M1 인터뷰 결과로 가입 전 첫 흐름의 길이 조정 필요.

### M4 — 네이티브 전환 (3 ~ 5 주)

목표. iOS/Android 디바이스에서 카메라/위치/푸시가 실제 동작하는 앱.

활동 (audit + expo-readiness-plan 기반).

1. monorepo 전환.
   - `apps/web` (현재 Vite), `apps/mobile` (Expo), `packages/domain` (`src/lib/*` 75% 재사용).
   - 어댑터 4 종 (`adapters/storage`, `adapters/share`, `adapters/imagePicker`, `adapters/snapRenderer`) 의 네이티브 구현체 추가.
     - `expo-secure-store` + MMKV → StorageAdapter
     - `expo-sharing` → ShareAdapter
     - `expo-image-picker` → ImagePickerAdapter
     - `react-native-skia` 또는 `expo-image-manipulator` → SnapRenderer
2. Expo 앱 초기 셋업 (탭 네비게이션, 빈 화면).
3. 5 개 화면 네이티브 UI 재구현.
   - 스냅 → 오늘 → 집 → 모임 → 리포트 순.
   - Safe Area, 네이티브 내비게이션, 동적 타입 (Dynamic Type / Fontscale), 시스템 다크모드.
4. 카메라/사진첩/위치 권한 모듈 + 권한 거부 UX.
5. Expo Notifications + Supabase Edge Function 으로 모임 미션 리마인드 1 종.
6. App.tsx 의 useState 18 개를 RN 환경에서 `useSnapForm` / `useUserPreferences` hook 으로 분리.

완료 기준.

- iOS Simulator 와 Android Emulator 에서 5 개 탭 핵심 흐름 동작.
- 실제 iPhone/Android 디바이스에서 카메라 촬영 → 저장 → 친구 공유.
- 푸시 알림 테스트 발송 수신.

위험.

- 디자인 시스템의 CSS → RN StyleSheet 변환 시간 큼. 디자이너 협업 필요할 수도.
- 첫 RN 경험이면 학습 곡선 추가.

### M5 — 심사 준비 (1 ~ 2 주 + 심사 대기 1 ~ 2 주)

목표. Apple App Store 와 Google Play 의 심사 거절 사유 0.

활동.

1. 개인정보 처리방침과 이용약관 정적 페이지 (도메인 직속).
2. iOS Info.plist 의 `NSCameraUsageDescription`, `NSLocationWhenInUseUsageDescription`, `NSPhotoLibraryUsageDescription` 한국어/영어 문구.
3. Android `Manifest.xml` 의 권한 + Privacy Policy URL.
4. App Store Connect 의 App Privacy Data Collection 라벨.
   - 수집: 사진 (사용자 콘텐츠), 위치 (대략), 사용 데이터 (분석).
   - 미수집: 결제, 신원, 건강 데이터.
5. 스크린샷 5 ~ 8 장 (iPhone, iPad, Android phone, tablet).
6. 앱 설명 텍스트 ko/en.
7. 미성년자 보호 (KOPPA, COPPA 검토).
8. 베타 그룹 (TestFlight, Google Play Internal Testing) 첫 배포.

완료 기준.

- 심사 제출 + 첫 응답 (보통 1 ~ 3 일).
- 거절 시 사유 해소 + 재제출.
- 승인 후 출시 일자 결정.

위험.

- Apple 심사가 카메라/위치 사용 목적 불명확 사유로 1 ~ 2 회 거절될 수 있음. 사용 설명 명확화 필요.
- 푸시 알림이 너무 강요적이면 거절 사유 가능.

### M6 — 출시 + 운영 (1 주 + 지속)

목표. 정식 출시 후 운영 안정화. 사용자 행동 데이터로 다음 묶음 결정.

활동.

1. App Store / Google Play 정식 출시.
2. Sentry 와 PostHog 활성 (소스맵 업로드, 이벤트 3 종 `snap_saved` / `meet_invited` / `insight_viewed`).
3. Expo Notifications 모임 미션 리마인드 첫 발송.
4. 출시 후 7 일간 일일 크래시율 + 리텐션 + 첫 스냅 도달률 모니터링.
5. 사용자 피드백 채널 (이메일, 인앱 폼) 운영.

완료 기준.

- 출시 7 일 D1 리텐션, D7 리텐션, 평균 첫 스냅 도달 시간 측정.
- 크래시율 < 1% 유지.
- 사용자 피드백 30 건 이상 수집.

위험.

- 출시 후 첫 주에 가장 많은 크래시 발생. Sentry 알림과 신속 패치 필요.
- 푸시 알림 거부율이 너무 높으면 리텐션 채널 다시 설계.

## 의존성 그래프

```
M0 (완료)
  └─ M1 사용자 검증
       └─ M2 인프라 결정
            └─ M3 백엔드/인증
                 └─ M4 네이티브 전환
                      └─ M5 심사 준비
                           └─ M6 출시 + 운영
```

M2 일부 (도메인, App Store 계정) 와 M5 일부 (처리방침 작성) 는 M3/M4 와 병렬 진행 가능. AI 모델 연결은 M3 이후 별도 트랙으로 분리해 진행할 수 있다.

## 다음 한 가지 결정

이 문서의 가치는 한 가지 결정에 도움이 되는 데 있다. **M1 (사용자 검증) 을 먼저 할지, 아니면 M2/M3 (백엔드) 을 동시에 시작할지** 다.

- M1 먼저. 가설이 깨질 가능성을 먼저 확인. 안전.
- M2/M3 동시 시작. 인터뷰가 끝났을 때 이미 백엔드 일부 진행. 가설이 맞을 거라는 베팅.

audit 보고서와 PRD 의 보수적 자세로 보면 M1 먼저가 정직한 길.
