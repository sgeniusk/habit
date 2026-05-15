// 스냅 탭. 사진 선택 → 카테고리/장소/메모/필터/스티커/도장 → 저장.
// 이미지는 expo-file-system 으로 영구 디렉토리에 복사되어 앱 재시작 후에도 남는다.
import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon } from "lucide-react-native";

import {
  categoryOptions,
  filterOptions,
  placeOptions,
  stickerOptions
} from "../data/personaCatalog";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { persistPickedImage } from "../lib/imagePersistence";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";
import type { HabitCategory, PlaceType, ProofStampId, SnapRecord } from "../types/habit";

const placeLabelsKo: Record<PlaceType, string> = {
  home: "집",
  library: "도서관",
  school: "학교",
  cafe: "카페",
  gym: "헬스장",
  restaurant: "식당",
  outdoors: "야외",
  other: "기타"
};

const proofStampOptions: { id: ProofStampId; label: string }[] = [
  { id: "time", label: "시간" },
  { id: "count", label: "횟수" },
  { id: "persona", label: "페르소나" }
];

export function SnapScreen() {
  const { addRecord } = useSnapRecords();
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [category, setCategory] = useState<HabitCategory>("study");
  const [place, setPlace] = useState<PlaceType>("library");
  const [memo, setMemo] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [selectedSticker, setSelectedSticker] = useState(stickerOptions[0]);
  const [proofStamps, setProofStamps] = useState<ProofStampId[]>(["time", "persona"]);
  const [savedToast, setSavedToast] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  async function handlePickedImage(uri: string) {
    setIsProcessing(true);
    try {
      const persisted = await persistPickedImage(uri);
      setPickedUri(persisted);
    } finally {
      setIsProcessing(false);
    }
  }

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
      await handlePickedImage(result.assets[0].uri);
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
      await handlePickedImage(result.assets[0].uri);
    }
  }

  function toggleProofStamp(id: ProofStampId) {
    setProofStamps((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  }

  function saveSnap() {
    const record: SnapRecord = {
      id: createRecordId(),
      category,
      placeType: place,
      memo: memo.trim() || undefined,
      filter: selectedFilter,
      sticker: selectedSticker,
      proofStamps,
      imageUrl: pickedUri ?? undefined,
      createdAt: new Date().toISOString()
    };
    addRecord(record);
    setPickedUri(null);
    setMemo("");
    setSavedToast("스냅이 저장됐어요. 페르소나가 자라요.");
    setTimeout(() => setSavedToast(""), 2200);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Snap</Text>
      <Text style={styles.title}>오늘의 한 컷</Text>

      <View style={styles.preview}>
        {pickedUri ? (
          <Image source={{ uri: pickedUri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewPlaceholderTitle}>사진을 골라 시작해요</Text>
            <Text style={styles.previewPlaceholderBody}>카메라로 찍거나 사진첩에서 한 컷.</Text>
          </View>
        )}
        {pickedUri ? (
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>{selectedSticker}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, styles.actionPrimary]}
          onPress={pickFromCamera}
          disabled={isProcessing}
        >
          <Camera size={18} color={colors.white} />
          <Text style={styles.actionPrimaryText}>카메라</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={pickFromGallery} disabled={isProcessing}>
          <ImageIcon size={18} color={colors.ink} />
          <Text style={styles.actionText}>사진첩</Text>
        </Pressable>
      </View>
      {isProcessing ? <Text style={styles.processingHint}>사진 정리 중...</Text> : null}

      <Text style={styles.sectionTitle}>필터</Text>
      <View style={styles.chipRow}>
        {filterOptions.map((option) => (
          <Pressable
            key={option}
            style={[styles.chip, selectedFilter === option && styles.chipActive]}
            onPress={() => setSelectedFilter(option)}
          >
            <Text style={[styles.chipText, selectedFilter === option && styles.chipTextActive]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>스티커</Text>
      <View style={styles.chipRow}>
        {stickerOptions.map((option) => (
          <Pressable
            key={option}
            style={[styles.chip, selectedSticker === option && styles.chipActive]}
            onPress={() => setSelectedSticker(option)}
          >
            <Text style={[styles.chipText, selectedSticker === option && styles.chipTextActive]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>인증 도장</Text>
      <View style={styles.chipRow}>
        {proofStampOptions.map((option) => {
          const active = proofStamps.includes(option.id);
          return (
            <Pressable
              key={option.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleProofStamp(option.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {active ? "✓ " : ""}
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>어떤 순간인가요?</Text>
      <View style={styles.chipRow}>
        {categoryOptions.map((option) => (
          <Pressable
            key={option.id}
            style={[styles.chip, category === option.id && styles.chipActive]}
            onPress={() => setCategory(option.id)}
          >
            <Text style={[styles.chipText, category === option.id && styles.chipTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>어디에서 남겼나요?</Text>
      <View style={styles.chipRow}>
        {placeOptions.map((option) => (
          <Pressable
            key={option}
            style={[styles.chip, place === option && styles.chipActive]}
            onPress={() => setPlace(option)}
          >
            <Text style={[styles.chipText, place === option && styles.chipTextActive]}>
              {placeLabelsKo[option]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>한 줄 감정</Text>
      <TextInput
        value={memo}
        onChangeText={setMemo}
        placeholder="예: 맑아서 조금 더 걸었다"
        placeholderTextColor={colors.muted}
        multiline
        style={styles.memoInput}
      />

      <Pressable
        style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
        onPress={saveSnap}
      >
        <Text style={styles.saveButtonText}>꾸며서 올리기</Text>
      </Pressable>

      {savedToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{savedToast}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function createRecordId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `record-${globalThis.crypto.randomUUID()}`;
  }
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `record-${Date.now()}-${randomPart}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
  eyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  title: { ...typography.title, color: colors.ink },
  preview: {
    aspectRatio: 1,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
    position: "relative"
  },
  previewImage: { width: "100%", height: "100%" },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: spacing.xl
  },
  previewPlaceholderTitle: { color: colors.ink, fontWeight: "900", fontSize: 18 },
  previewPlaceholderBody: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center"
  },
  previewBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: colors.ink
  },
  previewBadgeText: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  actionRow: { flexDirection: "row", gap: 10 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  actionPrimary: { backgroundColor: colors.ink, borderColor: colors.ink },
  actionText: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  actionPrimaryText: { color: colors.white, fontWeight: "900", fontSize: 14 },
  processingHint: { color: colors.muted, fontWeight: "700", fontSize: 12, marginTop: 4 },
  sectionTitle: { ...typography.h3, color: colors.ink, marginTop: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  chipActive: { borderColor: colors.leaf, backgroundColor: colors.leafSoft },
  chipText: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  chipTextActive: { color: colors.leaf },
  memoInput: {
    minHeight: 80,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontWeight: "700",
    fontSize: 14,
    textAlignVertical: "top"
  },
  saveButton: {
    marginTop: spacing.sm,
    paddingVertical: 16,
    borderRadius: radii.md,
    backgroundColor: colors.ink,
    alignItems: "center",
    ...shadows.card
  },
  saveButtonPressed: { opacity: 0.85 },
  saveButtonText: { color: colors.white, fontWeight: "900", fontSize: 15 },
  toast: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.leafSoft,
    borderWidth: 1,
    borderColor: "#cce8d0"
  },
  toastText: { color: colors.leaf, fontWeight: "900", fontSize: 13 }
});
