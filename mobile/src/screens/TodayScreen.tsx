// 오늘 탭 RN 스크린. 웹의 TodayView 를 점진적으로 포팅한다.
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function TodayScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Today</Text>
      <Text style={styles.title}>오늘의 기록</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>지금 한 컷 남기면 페르소나가 바로 자라요</Text>
        <Text style={styles.cardHint}>RN 포팅 예정 화면입니다.</Text>
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
    backgroundColor: "#1c2733"
  },
  cardTitle: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  cardHint: { color: "rgba(255,255,255,0.78)", fontWeight: "700", fontSize: 12, marginTop: 4 }
});
