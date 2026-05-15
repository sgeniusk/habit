# Persona Habit MVP Checklist

Updated: 2026-05-15

## MVP 정의

현재 MVP는 **웹에서 공유 가능한 iOS/Android 전환 전 후보 버전**으로 본다. 사용자는 별도 설명 없이 `오늘 -> 스냅 -> 집 -> 모임 -> 리포트` 흐름을 체험하고, 생활 스냅이 페르소나 성장과 AI 인사이트로 이어지는 감각을 확인할 수 있어야 한다.

## 웹 MVP 포함 범위

- 첫 사용자 30초 팝업 가이드
- 사진 선택, 필터, 스티커, 시간/횟수/페르소나 도장, 페르소나 도장 위치
- 공유용 PNG 저장과 공유 후 모임/첫 미션 다음 행동
- 스냅 저장 후 집, 모임, 리포트 빠른 이동
- 저장된 기록의 필터, 스티커, 도장 메타데이터 재확인
- 페르소나 애칭, 직업, XP, 진화명, 방/의상 꾸미기
- 귀여운 톤과 차분한 톤 선택 및 저장
- 날씨/위치 맥락과 한 줄 일기
- 기록 기반 모임 제안, 초대 링크, 첫 스냅 미션, 공동 XP
- 7일 리포트, 오래된 기억, AI 인사이트 근거와 피드백
- 한국어 우선 UX와 영어 핵심 라벨 기반

## MVP 밖으로 남기는 범위

- 실제 계정, 서버 저장, 이미지 CDN 저장
- 네이티브 카메라 권한과 iOS/Android 공유 시트
- 실제 AI 모델 호출, 장기 기억 벡터 검색
- 전체 화면의 완전한 영어/일본어 번역
- 앱스토어 심사와 푸시 알림

## QA 체크리스트

- [x] 신규 사용자가 오늘 탭에서 첫 30초 가이드를 볼 수 있다.
- [x] 가이드에서 첫 스냅 화면으로 이동할 수 있다.
- [x] 스냅에서 이미지, 필터, 스티커, 도장, 위치를 선택할 수 있다.
- [x] 공유 이미지를 저장하면 모임 초대와 첫 미션으로 이어지는 행동이 보인다.
- [x] 스냅을 저장하면 오늘 기록, 집, 모임, 리포트에 반영된다.
- [x] 저장된 스냅에서 적용된 필터, 스티커, 도장을 다시 볼 수 있다.
- [x] 집에서 페르소나 애칭, 꾸미기, 말투/테마를 바꾸고 새로고침 뒤에도 유지한다.
- [x] 리포트에서 AI 인사이트의 한 줄 근거와 숨김/순화 피드백을 볼 수 있다.
- [x] 모임에서 기록 기반 추천, 초대, 첫 미션, 공동 XP 흐름을 볼 수 있다.
- [x] 모바일 폭 시각 QA를 캡처한다.
- [x] 데스크톱 폭 시각 QA를 캡처한다.
- [x] Vercel 배포 후 프로덕션 URL에서 첫 화면을 확인한다.

## 검증 로그

- Focused tests: `npm run test:run -- src/lib/personaIdentity.test.ts src/lib/persistence.test.ts src/App.test.tsx`
- Full verification: `npm run format:check`, `npm run lint`, `npm run test:run`, `npm run build`, `npm audit --audit-level=moderate`, `git diff --check`
- Browser QA: `390x844` 모바일에서 첫 30초 도움말과 집 말투/테마, `1280x720` 데스크톱에서 리포트 AI 근거를 확인했다.
- Production QA: `https://habit-six-gamma.vercel.app/`가 HTTP 200으로 응답하고, HTML이 새 빌드 자산 `index-De6pAWdc.js`, `index-Cg3SVgYn.css`를 가리키는 것을 확인했다.

## 출시 직전 Readiness Pass

웹 MVP 마감 자평이 iOS/Android 출시 직전 수준에 부합하는지 비판적 점검을 거쳤다. 보고서는 [docs/audit/2026-05-15-pre-native-readiness-audit.md](../audit/2026-05-15-pre-native-readiness-audit.md).

### 묶음 1 — 안전 묶음 (완료)

출시 후 첫 주 크래시/데이터 손실을 막는다.

- [x] React Error Boundary 를 main.tsx 에서 App 위에 둔다.
- [x] localStorage 모든 setItem 호출을 try-catch + quota/error outcome 으로 흡수한다.
- [x] 사진 업로드 시 canvas 재인코딩으로 EXIF/GPS 메타데이터를 제거하고 1600px 로 축소한다.
- [x] loadSnapRecords 가 깨진 record shape 를 자동 제거한다.
- [x] record ID 를 `crypto.randomUUID()` 기반으로 바꾸어 같은 ms 충돌을 방지한다.
- [x] TodayView 의 디버그 버튼 ("권한 거부 미리보기", "실패 상태 보기") 을 `import.meta.env.PROD` 가드한다.
- [x] 저장 실패 시 사용자에게 노출되는 storage warning banner 를 추가한다.
- [x] persistence/ErrorBoundary/imageSanitizer 단위 테스트를 추가했다 (총 77 tests pass).

### 묶음 2 — 어댑터 묶음 (완료)

네이티브 전환을 향한 4개 어댑터 인터페이스를 `src/lib/adapters/*` 로 분리한다.

- [x] StorageAdapter — `getItem`/`setItem`/`removeItem` 동기 인터페이스. 웹은 `window.localStorage`, 네이티브는 MMKV 후보. persistence.ts 가 인터페이스에만 의존.
- [x] ShareAdapter — Web Share API 도입. navigator.share 지원 환경에서는 네이티브 공유 시트, 미지원 환경에서는 다운로드 fallback. RN 은 expo-sharing 으로 매핑.
- [x] ImagePickerAdapter — 사진 입력 처리를 sanitizeImageFile 위의 얇은 래퍼로 분리. RN 은 expo-image-picker 로 같은 인터페이스 만족.
- [x] SnapRenderer — PNG export 와 다운로드 트리거 분리. RenderedSnap 한 호출로 blob + filename 반환. RN 은 expo-image-manipulator 또는 react-native-skia 로 매핑.

### 묶음 3 — UX 마감 묶음 (완료)

- [x] `HabitInsight.confidence` 를 영어 enum (high/medium/low) 으로 바꾸고 `insight.evidenceLabel` 키 추가. ReportView 가 locale 별 라벨로 변환.
- [x] TodayView 의 streak 6일 / hero 활동 문구 / 진행률 / +28xp 모임 기여 하드코딩을 records 기반 derived 값으로 교체. `countConsecutiveSnapDays` 헬퍼 추가.
- [x] HomeView 의 한국어 하드코딩 약 25곳을 i18n 사전 (`home.*` 키) 로 분리.
- [x] MeetView 의 한국어 하드코딩 약 30곳을 `meet.*` 키로 분리. feedback/hidden count 헬퍼가 locale 별 자연어 분기.
- [x] TodayView 의 잔여 한국어 라벨 (저널 모드/메트릭/AI Insight 영역) 을 `today.*` 키로 분리.
- [x] ReportView 의 잔여 한국어 라벨 (7일 요약/오래된 기억/메모리 필터) 을 `report.*` 키로 분리. softenInsightBody 와 formatMemoryFilterLabel 헬퍼가 locale 별 분기.
- [x] PersonaCard.name/activity/place 를 LocalizedString 으로 마이그레이션 + localize 헬퍼 도입.
- [x] socialEngine 의 MeetSuggestion / Invite / GroupPersona / Mission / Member 한국어 데이터를 LocalizedString 으로 마이그레이션, status 한국어 literal 을 created enum 으로 좁힘.
- [x] journalEngine / personaIdentity / memoryEngine 의 자연어 출력을 locale 분기로 처리.
- 보류 (네이티브 전환 시 어차피 재작성) — App.tsx 의 18개 useState hook 분리. M4 화면 RN 포팅 시 같이 정리.

### 묶음 4 — 출시 심사 헤더 (부분 완료)

- [x] vercel.json 에 CSP / X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy / HSTS 헤더 추가.
- [ ] 개인정보 처리방침과 이용약관 정적 페이지 작성 (변호사 검토 권장).
- [ ] iOS/Android `Usage Description` 문구 (NSCameraUsageDescription, NSLocationWhenInUseUsageDescription, NSPhotoLibraryUsageDescription) 초안.
- [ ] App Store / Google Play Privacy Data Collection 라벨 초안.

### 사용자 인터뷰 키트 (완료)

- [x] [docs/research/2026-05-15-first-flow-interview-kit.md](../research/2026-05-15-first-flow-interview-kit.md) — 모집 기준, 6 단계 인터뷰 흐름, 피드백 시트 양식, 결과 종합 보고 템플릿.
- [x] [docs/research/2026-05-15-first-flow-interview-report.md](../research/2026-05-15-first-flow-interview-report.md) — Claude Work 자동 시뮬레이션 3 인 (학생/직장인/캐주얼) 결과 보고서. 가상 평가 대비 -0.5~1.2 점 부풀림 검출.

### 묶음 P0-Interview — 인터뷰 결과 반영 (완료)

3 인 모의 인터뷰 보고서 (Minseo/Jihoon/Sua) 의 P0 4 가지를 즉시 마감.

- [x] Hero CTA 시인성 강화 — TodayView 상단에 prominent capture-cta 추가 (목표 10 초 발견).
- [x] 집 탭 대표 페르소나 시각 표시 — `featured-persona-badge` (room-scene) + `featured-headline-badge` (activity-panel).
- [x] AI 리포트 근거 라인 상단화 — `insight-evidence` 를 body 위로 이동, 가장 먼저 보이게.
- [x] AI 리포트 기본 톤 "순하게" — `softenAllInsights` 기본 true, 토글로 원문 그대로 전환 가능.

### 묶음 P1-Interview — 다음 마감 후보

- [ ] 카테고리 재설계 — 학생 "공부" 노출 순서 + 캐주얼 "일상" 세분화.
- [ ] 페르소나 진화 게이지에 "x/y 회 남음" 라벨.
- [ ] 페르소나 애칭 변경 UI 명시적 버튼화.
- [ ] 도장과 스티커 역할 차별화 또는 한쪽 통합.
- [ ] 모임 친구 진입 알림 정책 흐름 점검.
- [ ] AI 인사이트 근거에 사진 메타데이터 (날짜·미리보기) 추가.

### 묶음 5 ~ 6 — 외부 서비스 결정 대기

- 백엔드: Supabase Auth + Postgres + Storage. RLS 정책.
- 모니터링/알림: Sentry + 소스맵 업로드, PostHog 이벤트 3 종, Expo Notifications + Edge Function 으로 모임 미션 리마인드.
