// 스냅 탭. expo-image-picker 로 카메라 또는 사진첩에서 한 컷을 가져온다.
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon } from "lucide-react-native";

export function SnapScreen() {
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [pickedFromCamera, setPickedFromCamera] = useState(false);

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("카메라 권한이 필요해요", "설정에서 카메라 접근을 허용해 주세요.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1]
    });

    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
      setPickedFromCamera(true);
    }
  }

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("사진첩 권한이 필요해요", "설정에서 사진 접근을 허용해 주세요.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: true,
      aspect: [1, 1]
    });

    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
      setPickedFromCamera(false);
    }
  }

  function resetPick() {
    setPickedUri(null);
    setPickedFromCamera(false);
  }

  const previewSource: ImageSourcePropType | undefined = pickedUri ? { uri: pickedUri } : undefined;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Snap</Text>
      <Text style={styles.title}>오늘의 한 컷</Text>

      <View style={styles.preview}>
        {previewSource ? (
          <Image source={previewSource} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderTitle}>사진을 골라 시작해요</Text>
            <Text style={styles.previewPlaceholderBody}>
              카메라로 찍거나 사진첩에서 한 컷을 가져옵니다.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <Pressable style={[styles.actionButton, styles.actionButtonPrimary]} onPress={pickFromCamera}>
          <Camera size={18} color="#ffffff" />
          <Text style={styles.actionButtonPrimaryText}>카메라로 찍기</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={pickFromGallery}>
          <ImageIcon size={18} color="#1c2733" />
          <Text style={styles.actionButtonText}>사진첩</Text>
        </Pressable>
      </View>

      {pickedUri ? (
        <Pressable style={styles.resetLink} onPress={resetPick}>
          <Text style={styles.resetLinkText}>
            {pickedFromCamera ? "카메라로 찍은 사진" : "사진첩의 사진"} 다시 고르기
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4f7e8" },
  content: { padding: 18, gap: 14 },
  eyebrow: { color: "#2f9d65", fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  title: { color: "#1c2733", fontWeight: "900", fontSize: 26, lineHeight: 30 },
  preview: {
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#1c2733"
  },
  previewImage: { width: "100%", height: "100%" },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 24
  },
  previewPlaceholderTitle: { color: "#1c2733", fontWeight: "900", fontSize: 18 },
  previewPlaceholderBody: {
    color: "#667267",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center"
  },
  actionRow: { flexDirection: "row", gap: 10 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e2d1"
  },
  actionButtonPrimary: { backgroundColor: "#1c2733", borderColor: "#1c2733" },
  actionButtonText: { color: "#1c2733", fontWeight: "900", fontSize: 14 },
  actionButtonPrimaryText: { color: "#ffffff", fontWeight: "900", fontSize: 14 },
  resetLink: { alignSelf: "center", paddingVertical: 6 },
  resetLinkText: { color: "#5477d2", fontWeight: "800", fontSize: 13 }
});
