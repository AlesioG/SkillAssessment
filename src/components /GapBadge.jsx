export default function GapBadge({ gap }) {
  if (gap <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
        No Gap
      </span>
    );
  }

  const config = {
    1: { label: "Low", className: "bg-yellow-50 text-yellow-700" },
    2: { label: "Moderate", className: "bg-orange-50 text-orange-700" },
    3: { label: "High", className: "bg-red-50 text-red-700" },
    4: { label: "Critical", className: "bg-red-100 text-red-800" },
  };

  const c = config[gap] || config[4];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.className}`}>
      Gap {gap} – {c.label}
    </span>
  );
}
