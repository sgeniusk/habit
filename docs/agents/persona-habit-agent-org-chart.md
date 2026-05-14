# Persona Habit 제작 에이전트 조직도

## 목적

Persona Habit은 아이디어, UX, 캐릭터, AI 분석, 모바일 구현, 소셜 기능이 동시에 자라는 제품이다. 이 조직도는 제작 에이전트들이 각자 무엇을 책임지고, 어떤 산출물을 하네스가 검증해야 하는지 정리한다.

## 조직도

대표 조직도는 이미지 생성 결과물이 아니라 수정 가능한 HTML/CSS로 관리한다.

HTML 조직도: [persona-habit-agent-org-chart.html](./persona-habit-agent-org-chart.html)

## 역할과 산출물

| 조직          | 에이전트             | 책임                                               | 주요 산출물                              | 하네스 검증                                     |
| ------------- | -------------------- | -------------------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| 총괄          | Orchestrator Agent   | 사용자 의도를 작업 단위로 나누고 충돌을 조정한다.  | 작업 큐, 구현 순서, 의사결정 로그        | 범위 누락, 중복 작업, PRD 이탈                  |
| 검문          | Harness Gate         | 모든 산출물을 제품·기술 기준으로 통과시킨다.       | CI 결과, UX 체크리스트, 배포 확인        | `npm run ci`, 브라우저 확인, GitHub/Vercel 상태 |
| 제품 전략실   | Product Detail Agent | 흐릿한 앱 아이디어를 기능 요구사항으로 바꾼다.     | PRD, 유저 스토리, MVP 범위               | 사용자의 실제 의도와 일치하는지                 |
| 제품 전략실   | Benchmark Agent      | Day One, 인증앱, 꾸미기앱, 소셜 루틴앱을 비교한다. | 벤치마크 노트, 차용할 패턴, 피할 패턴    | 출처 명확성, 제품 적용 가능성                   |
| 경험 디자인실 | UX Flow Agent        | 오늘, 스냅, 집, 모임, 리포트 흐름을 설계한다.      | 화면 플로우, 상태 전이, 빈 상태          | 10초 안에 핵심 루프가 이해되는지                |
| 경험 디자인실 | Design System Agent  | 페르소나, 방, 색상, UI 컴포넌트 규칙을 만든다.     | 디자인 토큰, 캐릭터 규칙, 방 꾸미기 규칙 | 모바일 가독성, 일관성, 확장성                   |
| 구현 플랫폼실 | Frontend Agent       | 현재 React 프로토타입을 구현하고 다듬는다.         | 화면, 컴포넌트, 테스트                   | lint, test, build, 브라우저 QA                  |
| 구현 플랫폼실 | Mobile Agent         | iOS/Android 출시 구조를 설계한다.                  | Expo/React Native 계획, 권한 정책        | 카메라, 위치, 알림, 앱스토어 요구사항           |
| AI·데이터실   | AI Habit Agent       | 숨은 습관 분석, AI 일기, 건강한 추천을 설계한다.   | 인사이트 규칙, 프롬프트, 추천 정책       | 안전성, 설명 가능성, 과잉 진단 방지             |
| AI·데이터실   | Data & Backend Agent | 사용자, 스냅, 페르소나, 모임 데이터를 설계한다.    | 데이터 모델, API 초안, 개인정보 흐름     | 데이터 최소화, 권한, 보존 정책                  |
| 소셜·출시실   | Social Loop Agent    | 친구 초대, 모임, 공동 페르소나 루프를 설계한다.    | 초대 플로우, 모임 규칙, 리텐션 장치      | 부담 없는 참여, 스팸/악용 리스크                |
| 소셜·출시실   | QA & Release Agent   | 완성도, 배포, 회귀 테스트를 책임진다.              | QA 리포트, 릴리즈 노트, 배포 체크        | CI, 접근성, 반응형, 링크 공유 가능성            |

## 하네스 게이트

1. **PRD Gate**: 새 기능이 한글/영문 PRD의 제품 방향과 맞는지 확인한다.
2. **UX Gate**: 사용자가 설명 없이 `오늘 -> 스냅 -> 성장 -> 집/모임` 루프를 이해하는지 확인한다.
3. **Design Gate**: 페르소나와 방 꾸미기가 귀엽지만 앱처럼 쓸 수 있는 밀도를 유지하는지 확인한다.
4. **Engineering Gate**: `npm run ci`를 통과해야 한다.
5. **Browser Gate**: 로컬 또는 배포 URL에서 탭 전환, 텍스트 겹침, 핵심 CTA를 확인한다.
6. **Release Gate**: GitHub push, Actions 성공, Vercel production 배포 성공을 확인한다.

## 운영 리듬

1. 사용자가 방향을 말하면 Orchestrator Agent가 작업을 쪼갠다.
2. Product Detail Agent와 Benchmark Agent가 요구사항과 레퍼런스를 정리한다.
3. UX Flow Agent와 Design System Agent가 화면/캐릭터/방 구조를 만든다.
4. Frontend Agent 또는 Mobile Agent가 구현한다.
5. AI Habit Agent, Data & Backend Agent, Social Loop Agent가 필요한 도메인 세부사항을 보강한다.
6. Harness Gate와 QA & Release Agent가 검증하고, 통과한 결과만 배포한다.

## 다음 빌드 큐

- 실제 위치/날씨 권한 흐름 설계
- 스냅 필터와 스티커 편집 인터랙션 구체화
- 페르소나 해금/진화 규칙을 데이터 모델로 분리
- 모임 초대 링크와 공동 페르소나 성장 규칙 설계
- AI 일기 초안과 숨은 습관 인사이트의 안전 기준 작성
