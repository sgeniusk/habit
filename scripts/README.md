# Formi 자산 생성 스크립트

Formi 캐릭터 24 종 (씨앗 1 + 변형 18 + 아이콘/스플래시/빈상태 3) 을 Nano Banana (Gemini 2.5 Flash Image) 로 생성합니다. web/mobile 본체와 분리된 일회성 도구라 별도 `package.json` 을 둡니다.

## 사용법

```bash
cd scripts
npm install
export GEMINI_API_KEY=your-google-api-key
npm run generate
```

## 동작

1. `GEMINI_API_KEY` (또는 `GOOGLE_API_KEY`) 환경변수를 읽습니다.
2. 씨앗 캐릭터 (`mobile/assets/formi/seed.png`) 를 다음 우선순위로 준비합니다.
   - `seed.png` 가 이미 있으면 그대로 기준 캐릭터로 사용합니다.
   - 없고 `raw-seed.png` 가 있으면, 그림자 제거 + 표정 중립화로 **정규화**해 `seed.png` 를 만듭니다. Midjourney 등에서 만든 원본 (그림자/웃음이 있어도) 을 `raw-seed.png` 로 두면 됩니다.
   - 둘 다 없으면 텍스트 프롬프트로 씨앗을 생성합니다.
3. `seed.png` 를 입력 이미지로, 23 변형을 "이 캐릭터를 유지하면서 X 만 바꿔라" 편집 프롬프트로 생성합니다.
4. 결과를 `mobile/assets/formi/<name>.png` 로 저장합니다.
5. 이미 존재하는 파일은 건너뜁니다 — 실패한 항목만 재실행으로 다시 시도할 수 있습니다.

## 비용

이미지당 약 $0.04. 24 장 = $1 미만. Google AI Studio 무료 티어로도 시도 가능합니다.

## 생성 후

`mobile/assets/formi/` 에 PNG 가 차면 Claude 에게 알려주세요. `FormiAvatar` 컴포넌트 + react-native-reanimated 숨쉬기 애니메이션 + 5 화면 통합을 진행합니다.

프롬프트 원본과 진화 단계 설명은 [../docs/design/2026-05-16-formi-character-prompts.md](../docs/design/2026-05-16-formi-character-prompts.md) 에 있습니다.
