// 스냅 export 렌더러 어댑터. 웹은 canvas + downloadSnapBlob, 네이티브는 expo-image-manipulator + Skia 등으로 같은 인터페이스를 만족한다.

import {
  buildSnapExportFilename,
  createSnapExportBlob,
  downloadSnapBlob,
  type SnapExportRequest
} from "../snapExport";

export type RenderedSnap = {
  blob: Blob;
  filename: string;
};

export type SnapRenderer = {
  renderSnap(request: SnapExportRequest): Promise<RenderedSnap>;
  downloadSnap(snap: RenderedSnap): void;
};

export function getWebSnapRenderer(): SnapRenderer {
  return {
    async renderSnap(request) {
      const blob = await createSnapExportBlob(request);
      const filename = buildSnapExportFilename(request.photoName || "snap");

      return { blob, filename };
    },

    downloadSnap({ blob, filename }) {
      downloadSnapBlob(blob, filename);
    }
  };
}
