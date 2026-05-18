// 매일 정해진 시간에 "오늘의 스냅" 로컬 알림을 예약하는 모듈. 서버 없이 기기에서 동작한다.
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const ANDROID_CHANNEL_ID = "daily-reminder";

// 웹에서는 로컬 알림 예약이 불안정해 모두 비활성(no-op)으로 둔다.
const isSupported = Platform.OS !== "web";

// 앱이 켜져 있을 때도 배너를 보여준다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

// 알림 권한을 요청하고 최종 허용 여부를 돌려준다.
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isSupported) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const next = await Notifications.requestPermissionsAsync();
    return next.granted;
  } catch {
    return false;
  }
}

// 안드로이드는 알림 채널이 있어야 표시된다.
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "오늘의 스냅",
    importance: Notifications.AndroidImportance.DEFAULT
  });
}

// 기존 예약을 모두 지우고 매일 hour:minute 에 반복 알림을 새로 건다.
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  if (!isSupported) return;
  try {
    await ensureAndroidChannel();
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "오늘의 스냅, 아직이에요",
        body: "하루를 한 컷으로 남기고 페르소나를 키워볼까요?"
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: ANDROID_CHANNEL_ID
      }
    });
  } catch {
    // 예약 실패는 다음 변경에서 자연 재시도
  }
}

// 예약된 알림을 모두 취소한다.
export async function cancelDailyReminder(): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // 무시
  }
}
