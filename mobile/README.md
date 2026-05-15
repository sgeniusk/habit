# Persona Habit Mobile (Expo)

iOS/Android 출시를 위한 Expo React Native 앱입니다. 현재는 5 탭 빈 화면 셋업 단계. 도메인 로직은 `../src/lib/*` (web 코드) 의 순수 함수를 점진적으로 가져옵니다.

## 실행

```bash
cd mobile
npm install
npm run start
```

`start` 가 Expo DevTools 를 띄웁니다. 옵션.

- `npm run ios` — iOS Simulator (Xcode 필요)
- `npm run android` — Android Emulator (Android Studio 필요)
- `npm run start` → 터미널에서 `w` 키로 웹, QR 로 실제 디바이스 (Expo Go 앱) 시연.

## 디바이스 확인

- iOS Simulator. `xcrun simctl list devices` 로 시뮬레이터 확인.
- Android Emulator. Android Studio → Device Manager 에서 AVD 생성.
- 실기 시연. App Store 에서 "Expo Go" 설치 후 QR 스캔.

## 어댑터 매핑 계획

웹의 `src/lib/adapters/*` 4 종을 다음 네이티브 라이브러리로 채웁니다.

| 어댑터 | 네이티브 구현 |
|--------|---------------|
| StorageAdapter | `@react-native-async-storage/async-storage` (또는 `expo-secure-store` + MMKV) |
| ImagePickerAdapter | `expo-image-picker` |
| ShareAdapter | `expo-sharing` |
| SnapRenderer | `react-native-skia` 또는 `expo-image-manipulator` |

## 다음 작업 순서

1. 도메인 로직을 `mobile/src/lib/` 에 복사 또는 monorepo 통합. 첫 단계는 복사.
2. `expo-image-picker` 로 SnapScreen 의 사진 입력 연결.
3. `expo-location` 으로 TodayScreen 의 날씨 카드.
4. `@react-native-async-storage/async-storage` 로 영속화 어댑터.
5. EAS 빌드 셋업 (`eas.json`) 으로 iOS/Android 빌드 자동화.
