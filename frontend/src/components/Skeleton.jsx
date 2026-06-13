export default function Skeleton({ width = '100%', height = 20, borderRadius = 6, style }) {
  return (
    <div
      className="xp-skeleton"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}
