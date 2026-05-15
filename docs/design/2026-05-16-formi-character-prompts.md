- Formi 캐릭터 24 변형의 Midjourney 프롬프트와 진화 단계, 일관성 가이드.

# Formi 캐릭터 Midjourney 프롬프트

Updated: 2026-05-16
Style: Soft blob lifestyle persona ("form + me" 컨셉)

## 기본 스타일 (모든 프롬프트의 공통 부분)

이 문장이 모든 프롬프트의 base 입니다. 24 종 모두 동일한 base 를 유지해야 캐릭터 일관성이 유지됩니다.

```
soft blob-like lifestyle persona character, not an animal, not fully human,
small simple face, tiny arms and feet, hand-drawn clean line, minimal kawaii
expression, warm off-white body, soft pastel accents, cozy diary app mascot,
calm and cute but not childish, flat white background, gentle shadow
```

## 일관성을 위한 Midjourney 워크플로

1. **Step 1 — 기준 캐릭터 생성**. 아래 "Lv.1 씨앗 (Formi Base)" 프롬프트 하나로 4 장 변형 생성. 가장 마음에 드는 1 장을 골라 URL 복사.
2. **Step 2 — Character Reference 적용**. 나머지 23 종을 생성할 때 `--cref <URL>` 옵션 추가. 같은 캐릭터의 변형으로 일관성 유지.
3. **Step 3 — Style Reference 보강 (선택)**. 사용자가 마음에 든 첫 결과 URL 을 `--sref <URL>` 로도 추가. 더 일관된 색감/선.
4. **Step 4 — 비율**. 모두 `--ar 1:1` 으로. 앱 안에서 정사각 frame 사용.
5. **Step 5 — Version**. `--v 6.1` 또는 최신 안정 버전 권장 (캐릭터 일관성 강함).

## Lv.1 씨앗 (Formi Base, 모든 카테고리 공통)

이 한 종이 기준 캐릭터. 먼저 이걸 만든 뒤 URL 을 다른 프롬프트에 cref 로 넘깁니다.

```
soft blob-like lifestyle persona character, not an animal, not fully human,
small simple face, tiny arms and feet, hand-drawn clean line, minimal kawaii
expression, warm off-white body, soft pastel accents, cozy diary app mascot,
calm and cute but not childish, flat white background, gentle shadow,
no accessory, neutral pose, slightly tilted head, the very first form before
any habit, mascot named Formi --ar 1:1 --v 6.1
```

이 결과 URL 을 `BASE_URL` 이라고 부르겠습니다. 아래 모든 프롬프트의 `--cref BASE_URL` 자리에 붙여넣으세요.

## 카테고리 6 × 진화 3 단계 (Lv.2 ~ Lv.8+)

각 카테고리는 3 변형. **씨앗 → 성향 → 정체성 → 마스터** 4 단계 중 씨앗은 위 공통이므로 카테고리별로는 3 변형 × 6 카테고리 = 18 변형.

### 공부 (Study)

#### Lv.2~4 성향 — 책 한 권 들기

```
[base style], small open book held softly in tiny arms, gentle reading
expression, a single bookmark peeking out, just one accessory, still mostly
the blob form, casual upright pose --cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.5~7 정체성 — 학습자

```
[base style], wearing a cozy hoodie with rolled-up sleeves, holding a notebook
under one arm and a pencil in the other tiny hand, slightly more human-shaped
body with shoulders forming, calm focused look, learner identity emerging
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.8+ 마스터 — 도서관 책상

```
[base style], sitting at a tiny wooden desk with a stack of three books, a
warm lamp glow, a window outline behind, more human posture with visible
sitting legs, gentle proud smile, mastery of focused study
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

### 운동 (Exercise)

#### Lv.2~4 성향 — 러닝화 한 켤레

```
[base style], a tiny pair of running shoes placed beside the blob, the blob
looking down at the shoes with curiosity, no shoes worn yet, just one
accessory in the scene --cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.5~7 정체성 — 러너

```
[base style], wearing the small running shoes and a light windbreaker, body
slightly stretched into a runner shape with visible feet ready to move,
breathing in fresh air, runner identity emerging
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.8+ 마스터 — 야외 러너

```
[base style], full running pose mid-stride, sweat drop on temple, windbreaker
flapping, soft outdoor path with a tiny tree silhouette, more human runner
proportions, satisfied calm focus --cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

### 식단 (Meal)

#### Lv.2~4 성향 — 숟가락 들기

```
[base style], holding a small wooden spoon in one tiny hand, a single round
piece of fruit (apple) beside the body, still mostly the blob form, looking
calmly at the spoon --cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.5~7 정체성 — 식단러

```
[base style], wearing a tiny apron with one pocket, holding a clear glass of
water, a small green leaf garnish on the head, body slightly elongated with
arms learning to cook, meal keeper identity emerging
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.8+ 마스터 — 작은 주방

```
[base style], standing in a tiny pastel kitchen with a wooden cutting board, a
lunchbox half-packed, fresh vegetables on the side, more human chef proportions,
warm focused expression, mastery of clean meals
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

### 독서 (Reading)

#### Lv.2~4 성향 — 큰 책 한 권

```
[base style], a slightly oversized closed book leaning against the blob body,
a thin bookmark ribbon dangling, the blob touching the book gently with one
tiny hand --cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.5~7 정체성 — 책 수집가

```
[base style], wearing a soft knit vest, holding a paperback in both small
hands, a tiny pair of round reading glasses, body slightly more human with
shoulders, calm absorbed look, page collector identity
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.8+ 마스터 — 카페 창가

```
[base style], seated at a tiny cafe window seat with one open book, a cup of
warm drink, two small shelves of books in soft background, more human reader
proportions, gentle thoughtful smile
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

### 정리 (Cleaning)

#### Lv.2~4 성향 — 라벨 한 장

```
[base style], holding a single small label sticker between two tiny hands, a
clean folded cloth beside the body, neat curious expression, just one
accessory --cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.5~7 정체성 — 정돈 설계자

```
[base style], wearing a small pocket apron with three tiny labeled pockets,
holding a folded cloth, body slightly more human with practical posture, tidy
proud expression, room-reset identity
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.8+ 마스터 — 정돈된 방

```
[base style], standing in a small tidy room with three labeled storage boxes,
a folded blanket on a low bed, soft sunlight through a curtain, more human
proportions, calm satisfied smile, mastery of room reset
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

### 셀프케어 (Self-care)

#### Lv.2~4 성향 — 컵 한 잔

```
[base style], holding a small steaming cup in tiny hands, eyes softly closed
in calm breath, no other accessory, gentle warm aura
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.5~7 정체성 — 회복 관리자

```
[base style], wearing a soft sleeping cap and a small blanket draped around
the body, holding the warm cup, body slightly more human with relaxed sitting
posture, recovery keeper identity emerging
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

#### Lv.8+ 마스터 — 회복 루틴존

```
[base style], seated on a small cushion in a cozy corner with a tiny side
table, the warm cup, a folded yoga mat in the background, more human relaxed
proportions, peaceful breath expression, mastery of recovery
--cref BASE_URL --sref BASE_URL --ar 1:1 --v 6.1
```

## 추가 자산 (앱 안 사용)

### 앱 아이콘 (1024 x 1024)

```
soft blob-like Formi mascot, only the head and small smile visible, centered,
warm off-white body, very small pastel accent (single tiny dot of mint green
on top), bold clean outline, vibrant flat white background, recognizable at
tiny size, no text, no shadow, no accessories, app icon style
--ar 1:1 --v 6.1
```

### 스플래시 (1284 x 2778)

```
soft blob-like Formi mascot floating gently above the lower third of the
image, calm off-white background fading to f4f7e8 below, no text, no
accessories, gentle floating shadow, a soft horizon line, splash screen for
a cozy diary app named Formi --ar 9:19 --v 6.1
```

### 빈 상태 (첫 사용자, 스냅 0)

```
soft blob-like Formi mascot looking up with curious expression, body slightly
small, holding nothing yet, surrounded by soft floating dots representing
empty habits waiting to form, white background, gentle copy space at the top
--cref BASE_URL --ar 1:1 --v 6.1
```

## 파일 명명 + 저장 위치

생성한 PNG 를 `mobile/assets/formi/` 에 다음 명명으로 저장하면 코드에서 자동 매핑합니다.

```
mobile/assets/formi/
├── icon.png                 1024x1024
├── splash.png               1284x2778
├── empty.png                1024x1024
├── seed.png                 Lv.1 (BASE)
├── study-sprout.png         Lv.2~4 공부 성향
├── study-identity.png       Lv.5~7 학습자
├── study-master.png         Lv.8+ 마스터
├── exercise-sprout.png
├── exercise-identity.png
├── exercise-master.png
├── meal-sprout.png
├── meal-identity.png
├── meal-master.png
├── reading-sprout.png
├── reading-identity.png
├── reading-master.png
├── cleaning-sprout.png
├── cleaning-identity.png
├── cleaning-master.png
├── selfcare-sprout.png
├── selfcare-identity.png
└── selfcare-master.png
```

24 장. Midjourney 생성 비용은 Basic Plan $10/월 으로 충분 (월 200 fast jobs).

## 생성 작업 순서 추천

1. Lv.1 seed 4 장 변형 → 1 장 골라 URL 확보 (BASE_URL)
2. 6 카테고리 × 3 단계 = 18 변형 일괄 (3 시간 안에 가능)
3. 아이콘 / 스플래시 / 빈 상태 3 장
4. 마음에 안 드는 결과는 `Vary (Subtle)` 또는 `Vary (Strong)` 로 재생성
5. 모두 PNG 다운로드 후 위 경로에 배치

## 다음 코드 작업

PNG 파일들이 위 경로에 있으면 Claude 가 다음을 자동 진행합니다.

1. `mobile/src/lib/formiAssets.ts` — 카테고리/레벨 별 require() 매핑
2. `mobile/src/components/FormiAvatar.tsx` — Lv.1~8+ 자동 선택 + react-native-reanimated 의 가벼운 숨쉬기 애니메이션 (scale 1 → 1.02 반복)
3. 모든 화면의 PersonaAvatar placeholder 자리에 FormiAvatar 삽입
4. 스플래시 / 아이콘 등록 (app.json)
