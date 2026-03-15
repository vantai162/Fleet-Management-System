export default function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-gray-400">{hint}</div> : null}
    </div>
  );
}
