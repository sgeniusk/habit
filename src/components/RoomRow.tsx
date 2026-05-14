import type { LucideIcon } from "lucide-react";

export function RoomRow({
  title,
  subtitle,
  value,
  icon: Icon
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <article className="room-row">
      <div className="room-icon">
        <Icon size={19} aria-hidden="true" />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <strong>{value}</strong>
    </article>
  );
}
