import { Camera } from "lucide-react";
import { t } from "../lib/i18n";
import { getCategoryLabel, getPlaceLabel } from "../lib/personaEngine";
import type { Locale, ProofStampId, SnapRecord } from "../types/habit";

const proofStampLabelKeys: Record<ProofStampId, Parameters<typeof t>[1]> = {
  time: "proof.time",
  count: "proof.count",
  persona: "proof.persona"
};

export function RecordRow({ locale = "ko", record }: { locale?: Locale; record: SnapRecord }) {
  const categoryLabel = getCategoryLabel(record.category, locale);
  const snapTitle = locale === "ko" ? `${categoryLabel} 스냅` : `${categoryLabel} snap`;
  const proofStampLabels = record.proofStamps?.map((stampId) =>
    t(locale, proofStampLabelKeys[stampId])
  );
  const imageAlt =
    locale === "ko"
      ? `${categoryLabel} 스냅 저장 이미지`
      : `Saved ${categoryLabel.toLowerCase()} snap image`;

  return (
    <article className="record-row">
      <div className={`record-icon ${record.category}`}>
        {record.imageUrl ? (
          <img className="record-thumbnail" src={record.imageUrl} alt={imageAlt} />
        ) : (
          <Camera size={17} aria-hidden="true" />
        )}
      </div>
      <div>
        <h3>{snapTitle}</h3>
        <p>
          {getPlaceLabel(record.placeType, locale)}
          {record.memo ? ` · ${record.memo}` : ""}
        </p>
        {record.filter || record.sticker ? (
          <small className="record-decoration">
            {[record.filter, record.sticker].filter(Boolean).join(" · ")}
          </small>
        ) : null}
        {proofStampLabels?.length ? (
          <small className="record-proof-stamps">{proofStampLabels.join(" · ")}</small>
        ) : null}
      </div>
      <span>+120xp</span>
    </article>
  );
}
