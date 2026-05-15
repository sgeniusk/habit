// expo-image-picker 가 돌려준 임시 URI 를 앱 영구 디렉토리로 복사한다.
// 앱 재시작 후에도 사진이 유지되도록. SDK 54 의 새 API 와 호환되도록 legacy 모듈 사용.
import * as FileSystem from "expo-file-system/legacy";

const SNAPS_DIR = `${FileSystem.documentDirectory ?? ""}snaps/`;

export async function persistPickedImage(sourceUri: string): Promise<string> {
  try {
    await ensureSnapsDirectory();

    const extension = guessExtension(sourceUri);
    const filename = `snap-${Date.now()}-${randomToken()}${extension}`;
    const targetUri = `${SNAPS_DIR}${filename}`;

    await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
    return targetUri;
  } catch {
    // 복사 실패하면 원본 URI 그대로 (임시지만 일단 표시는 됨)
    return sourceUri;
  }
}

async function ensureSnapsDirectory() {
  try {
    const info = await FileSystem.getInfoAsync(SNAPS_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(SNAPS_DIR, { intermediates: true });
    }
  } catch {
    // makeDirectory 가 실패해도 다음 단계에서 자연 복구
  }
}

function guessExtension(uri: string) {
  const match = uri.match(/\.(jpe?g|png|heic|webp)(\?.*)?$/i);
  return match ? `.${match[1].toLowerCase()}` : ".jpg";
}

function randomToken() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
