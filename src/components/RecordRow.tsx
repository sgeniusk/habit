import { Camera } from "lucide-react";
import { getCategoryLabel, getPlaceLabel } from "../lib/personaEngine";
import type { SnapRecord } from "../types/habit";

export function RecordRow({ record }: { record: SnapRecord }) {
  const categoryLabel = getCategoryLabel(record.category);

  return (
    <article className="record-row">
      <div className={`record-icon ${record.category}`}>
        {record.imageUrl ? (
          <img
            className="record-thumbnail"
            src={record.imageUrl}
            alt={`${categoryLabel} 스냅 저장 이미지`}
          />
        ) : (
          <Camera size={17} aria-hidden="true" />
        )}
      </div>
      <div>
        <h3>{categoryLabel} 스냅</h3>
        <p>
          {getPlaceLabel(record.placeType)}
          {record.memo ? ` · ${record.memo}` : ""}
        </p>
        {record.filter || record.sticker ? (
          <small className="record-decoration">
            {[record.filter, record.sticker].filter(Boolean).join(" · ")}
          </small>
        ) : null}
      </div>
      <span>+120xp</span>
    </article>
  );
}
