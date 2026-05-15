// 스냅 탭 RN 스크린. expo-image-picker + expo-camera 로 카메라/사진첩 연결 예정.
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function SnapScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Snap</Text>
      <Text style={styles.title}>오늘의 한 컷</Text>
      <View style={styles.card}>
        <Text style={styles.cardBody}>
          여기에서 카메라 또는 사진첩으로 스냅을 남깁니다. expo-image-picker 연결 예정.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4f7e8" },
  content: { padding: 18, gap: 12 },
  eyebrow: { color: "#2f9d65", fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  title: { color: "#1c2733", fontWeight: "900", fontSize: 26, lineHeight: 30 },
  card: {
    marginTop: 6,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e2d1"
  },
  cardBody: { color: "#1c2733", fontWeight: "700", fontSize: 14, lineHeight: 20 }
});
