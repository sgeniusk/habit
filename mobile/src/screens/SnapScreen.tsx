// 스냅 탭. 사진 선택 → 카테고리/장소/메모/필터/스티커/도장 → 저장.
// 이미지는 expo-file-system 으로 영구 디렉토리에 복사되어 앱 재시작 후에도 남는다.
import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon } from "lucide-react-native";

import { FormiAvatar } from "../components/FormiAvatar";
import {
  categoryOptions,
  filterOptions,
  placeOptions,
  stickerOptions
} from "../data/personaCatalog";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { filterOverlay } from "../lib/snapFilters";
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
  const { records, addRecord } = useSnapRecords();
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [category, setCategory] = useState<HabitCategory>("study");
  const [place, setPlace] = useState<PlaceType>("library");
  const [memo, setMemo] = useState("");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [selectedSticker, setSelectedSticker] = useState(stickerOptions[0]);
  const [proofStamps, setProofStamps] = useState<ProofStampId[]>(["time", "persona"]);
  const [savedToast, setSavedToast] = useState("");
  const [savedCategory, setSavedCategory] = useState<HabitCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState<"camera" | "gallery" | null>(null);

  async function handlePickedImage(uri: string) {
    setIsProcessing(true);
    setSavedToast("");
    setSavedCategory(null);
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
      setPermissionNotice("camera");
      return;
    }
    setPermissionNotice(null);
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
      setPermissionNotice("gallery");
      return;
    }
    setPermissionNotice(null);
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
    setSavedCategory(category);
    setSavedToast("스냅이 저장됐어요. 페르소나가 자라요.");
  }

  async function shareSnap() {
    const label =
      categoryOptions.find((option) => option.id === savedCategory)?.label ?? "오늘";
    try {
      await Share.share({
        message: `오늘 ${label} 한 컷을 Formi에 남겼어요. 생활 스냅이 모여 나만의 페르소나로 자라요 🌱`
      });
    } catch {
      // 공유 취소나 실패는 조용히 넘어간다.
    }
  }

  function stampText(stamp: ProofStampId): string {
    if (stamp === "time") {
      const now = new Date();
      let hour = now.getHours();
      const minute = now.getMinutes().toString().padStart(2, "0");
      const ampm = hour < 12 ? "오전" : "오후";
      hour = hour % 12 || 12;
      return `${ampm} ${hour}:${minute}`;
    }
    if (stamp === "count") {
      return `#${records.length + 1}`;
    }
    return categoryOptions.find((option) => option.id === category)?.label ?? "페르소나";
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>Snap</Text>
      <Text style={styles.title}>오늘의 한 컷</Text>

      <View style={styles.preview}>
        {pickedUri ? (
          <>
            <Image source={{ uri: pickedUri }} style={styles.previewImage} resizeMode="cover" />
            {filterOverlay(selectedFilter) ? (
              <View
                style={[StyleSheet.absoluteFill, filterOverlay(selectedFilter)!]}
                pointerEvents="none"
              />
            ) : null}
          </>
        ) : (
          <View style={styles.previewPlaceholder}>
            <FormiAvatar category={category} level={3} size={108} />
            <Text style={styles.previewPlaceholderTitle}>사진을 골라 시작해요</Text>
            <Text style={styles.previewPlaceholderBody}>카메라로 찍거나 사진첩에서 한 컷.</Text>
          </View>
        )}
        {pickedUri ? (
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>{selectedSticker}</Text>
          </View>
        ) : null}
        {pickedUri && proofStamps.length > 0 ? (
          <View style={styles.previewStamps}>
            {proofStamps.map((stamp) => (
              <Text key={stamp} style={styles.previewStamp}>
                {stampText(stamp)}
              </Text>
            ))}
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

      {permissionNotice ? (
        <View style={styles.permissionNotice}>
          <Text style={styles.permissionTitle}>
            {permissionNotice === "camera" ? "카메라 권한이 꺼져 있어요" : "사진첩 권한이 꺼져 있어요"}
          </Text>
          <Text style={styles.permissionBody}>
            {permissionNotice === "camera"
              ? "설정에서 카메라 접근을 허용하면 바로 촬영할 수 있어요. 권한 없이도 사진첩으로 기록할 수 있어요."
              : "설정에서 사진 접근을 허용하면 사진첩에서 고를 수 있어요. 권한 없이도 카메라로 기록할 수 있어요."}
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={() => {
              Linking.openSettings();
            }}
          >
            <Text style={styles.permissionButtonText}>설정 열기</Text>
          </Pressable>
        </View>
      ) : null}

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
          <Pressable
            style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}
            onPress={shareSnap}
          >
            <Text style={styles.shareButtonText}>공유하기</Text>
          </Pressable>
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
  previewPlaceholderTitle: { color: colors.ink, fontWeight: "700", fontSize: 18 },
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
  previewBadgeText: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  previewStamps: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    maxWidth: "78%"
  },
  previewStamp: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: colors.ink,
    color: colors.ink,
    fontWeight: "700",
    fontSize: 11,
    overflow: "hidden"
  },
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
  actionText: { color: colors.ink, fontWeight: "700", fontSize: 14 },
  actionPrimaryText: { color: colors.white, fontWeight: "700", fontSize: 14 },
  processingHint: { color: colors.muted, fontWeight: "700", fontSize: 12, marginTop: 4 },
  permissionNotice: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.coralSoft,
    borderWidth: 1,
    borderColor: "#ffd2cc",
    gap: 6
  },
  permissionTitle: { color: colors.ink, fontWeight: "700", fontSize: 14 },
  permissionBody: { color: colors.muted, fontWeight: "700", fontSize: 12, lineHeight: 18 },
  permissionButton: {
    alignSelf: "flex-start",
    marginTop: 2,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.ink
  },
  permissionButtonText: { color: colors.white, fontWeight: "700", fontSize: 12 },
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
  chipText: { color: colors.ink, fontWeight: "600", fontSize: 13 },
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
  saveButtonText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  toast: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.leafSoft,
    borderWidth: 1,
    borderColor: "#cce8d0",
    gap: 10
  },
  toastText: { color: colors.leaf, fontWeight: "700", fontSize: 13 },
  shareButton: {
    alignSelf: "flex-start",
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: radii.sm,
    backgroundColor: colors.leaf
  },
  shareButtonPressed: { opacity: 0.85 },
  shareButtonText: { color: colors.white, fontWeight: "700", fontSize: 13 }
});
