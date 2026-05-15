// 집 탭 RN 스크린. 대표 페르소나의 방과 꾸미기 UI 를 점진 포팅한다.
import { ScrollView, StyleSheet, Text, View } from "react-native";

export function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Home</Text>
      <Text style={styles.title}>페르소나의 집</Text>
      <View style={styles.stage}>
        <Text style={styles.badge}>★ 대표</Text>
        <Text style={styles.stageBody}>대표 페르소나의 방 화면이 이 자리에 들어갑니다.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4f7e8" },
  content: { padding: 18, gap: 12 },
  eyebrow: { color: "#2f9d65", fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  title: { color: "#1c2733", fontWeight: "900", fontSize: 26, lineHeight: 30 },
  stage: {
    marginTop: 6,
    padding: 16,
    minHeight: 200,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#1c2733"
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#1c2733",
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 11,
    overflow: "hidden"
  },
  stageBody: { color: "#1c2733", fontWeight: "700", marginTop: 12, fontSize: 14 }
});
