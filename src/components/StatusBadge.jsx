import { BADGE } from '../utils/badgeStyles';

export default function StatusBadge({ status }) {
  const style = BADGE[status] ?? BADGE.pending;
  return (
    <span
      className="rounded-full px-3 py-1.5 text-xs font-bold capitalize"
      style={{ background: style.bg, color: style.color, boxShadow: style.shadow }}
    >
      {status}
    </span>
  );
}
