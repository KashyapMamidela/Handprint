export default function RankAvatar({ initials, bg, color, size = 44, fontSize = 14 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize,
        background: bg,
        color,
      }}
    >
      {initials}
    </div>
  );
}
