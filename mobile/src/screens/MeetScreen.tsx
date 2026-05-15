// 모임 탭 RN 스크린. socialEngine 의 모임 제안과 초대 흐름을 점진 포팅한다.
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function MeetScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Together</Text>
      <Text style={styles.title}>모임</Text>
      <View style={styles.card}>
        <Text style={styles.cardEyebrow}>AI 모임 제안</Text>
        <Text style={styles.cardTitle}>친구와 함께할 루틴을 찾는 중</Text>
        <Text style={styles.cardBody}>
          socialEngine.buildMeetSuggestions 의 결과 카드를 이 자리에 RN 으로 포팅합니다.
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
  cardEyebrow: { color: "#2f9d65", fontWeight: "800", fontSize: 11, textTransform: "uppercase" },
  cardTitle: { color: "#1c2733", fontWeight: "900", fontSize: 18 },
  cardBody: { color: "#1c2733", fontWeight: "700", fontSize: 14, lineHeight: 20 }
});
