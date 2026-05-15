// 리포트 탭 RN 스크린. AI 인사이트 카드와 오래된 기억 모드를 점진 포팅한다.
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function ReportScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Weekly Loop</Text>
      <Text style={styles.title}>7일 생활 리포트</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI가 발견한 숨은 습관</Text>
        <Text style={styles.cardBody}>
          personaEngine.findHiddenHabitInsights 결과를 카드로 표시하고, 근거 라인을 카드 상단으로
          가져옵니다. 기본 톤은 "순한 표현" 으로 시작합니다.
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
    borderColor: "#d8e2d1",
    gap: 6
  },
  cardTitle: { color: "#1c2733", fontWeight: "900", fontSize: 18 },
  cardBody: { color: "#1c2733", fontWeight: "700", fontSize: 14, lineHeight: 20 }
});
