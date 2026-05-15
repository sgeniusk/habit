// 이미지 입력 어댑터. 웹은 sanitizeImageFile 위에 얇은 래퍼고, 네이티브는 expo-image-picker 의 결과를 같은 모양으로 돌려준다.

import { sanitizeImageFile, type SanitizeImageOptions } from "../imageSanitizer";

export type PickedImage = {
  filename: string;
  dataUrl: string;
  sanitized: boolean;
};

export type ImagePickerAdapter = {
  processFile(file: File, options?: SanitizeImageOptions): Promise<PickedImage>;
  isImageMimeType(mimeType: string | undefined | null): boolean;
};

export function getWebImagePickerAdapter(): ImagePickerAdapter {
  return {
    async processFile(file, options) {
      const dataUrl = await sanitizeImageFile(file, options);

      return {
        filename: file.name,
        dataUrl,
        sanitized: dataUrl.startsWith("data:image/jpeg")
      };
    },

    isImageMimeType(mimeType) {
      return typeof mimeType === "string" && mimeType.startsWith("image/");
    }
  };
}
