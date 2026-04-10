const levelLabels = {
  0: "No Knowledge",
  1: "Basic",
  2: "Intermediate",
  3: "Advanced",
  4: "Very Skilled",
};

const levelColors = {
  0: "bg-gray-100 text-gray-600",
  1: "bg-blue-50 text-blue-700",
  2: "bg-sky-50 text-sky-700",
  3: "bg-emerald-50 text-emerald-700",
  4: "bg-violet-50 text-violet-700",
};

export default function SkillLevelBadge({ level }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[level] || levelColors[0]}`}>
      {level} – {levelLabels[level] || "Unknown"}
    </span>
  );
}
