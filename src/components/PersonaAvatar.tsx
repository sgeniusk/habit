export function PersonaAvatar({ tone, accessory }: { tone: string; accessory: string }) {
  return (
    <div
      className={`persona-avatar ${tone} accessory-${accessory}`}
      aria-hidden="true"
      data-animated-persona="true"
    >
      <span className="avatar-orbit one" />
      <span className="avatar-orbit two" />
      <div className="avatar-core">
        <div className="avatar-head">
          <span className="avatar-ear left" />
          <span className="avatar-ear right" />
          <span className="avatar-eye left" />
          <span className="avatar-eye right" />
          <span className="avatar-cheek left" />
          <span className="avatar-cheek right" />
          <span className="avatar-mouth" />
        </div>
        <span className="avatar-arm left" />
        <span className="avatar-arm right" />
        <div className="avatar-body">
          <span className={`avatar-badge ${accessory}`} />
        </div>
        <span className="avatar-foot left" />
        <span className="avatar-foot right" />
      </div>
      <span className="avatar-shadow" />
    </div>
  );
}
