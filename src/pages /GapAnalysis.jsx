import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SkillLevelBadge from "../components/SkillLevelBadge";
import GapBadge from "../components/GapBadge";

const SKILLS = [
  "All Skills", "Artificial Intelligence", "Cloud Architecture", "DevOps", "Data Engineering",
  "Cybersecurity", "Soft Skills", "Agile Related", "Leadership Development",
];

const GAP_LEVELS = [
  { value: "all", label: "All Gaps" },
  { value: "1", label: "Low (1)" },
  { value: "2", label: "Moderate (2)" },
  { value: "3", label: "High (3)" },
  { value: "4", label: "Critical (4)" },
];

export default function GapAnalysis() {
  const [employees, setEmployees] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState("All Skills");
  const [gapFilter, setGapFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const [emps, assmts] = await Promise.all([
        base44.entities.Employee.list(),
        base44.entities.SkillAssessment.list(),
      ]);
      setEmployees(emps);
      setAssessments(assmts);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const employeeMap = {};
  employees.forEach((e) => { employeeMap[e.id] = e; });

  // Filter assessments with gaps
  const gapAssessments = assessments
    .map((a) => ({ ...a, gap: a.target_level - a.current_level }))
    .filter((a) => a.gap > 0)
    .filter((a) => skillFilter === "All Skills" || a.skill === skillFilter)
    .filter((a) => gapFilter === "all" || a.gap === Number(gapFilter))
    .filter((a) => {
      if (!search) return true;
      const emp = employeeMap[a.employee_id];
      if (!emp) return false;
      return `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => b.gap - a.gap);

  // Group by skill
  const grouped = {};
  gapAssessments.forEach((a) => {
    if (!grouped[a.skill]) grouped[a.skill] = [];
    grouped[a.skill].push(a);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Gap Analysis</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Employees grouped by skill category with development gaps
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by employee name..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SKILLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={gapFilter} onValueChange={setGapFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GAP_LEVELS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold">{gapAssessments.length}</p>
          <p className="text-xs text-muted-foreground">Total Gaps</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{gapAssessments.filter((a) => a.gap >= 3).length}</p>
          <p className="text-xs text-muted-foreground">High/Critical</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold">{Object.keys(grouped).length}</p>
          <p className="text-xs text-muted-foreground">Skill Categories</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center">
          <p className="text-2xl font-bold">{new Set(gapAssessments.map((a) => a.employee_id)).size}</p>
          <p className="text-xs text-muted-foreground">Employees</p>
        </div>
      </div>

      {/* Grouped Results */}
      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>No skill gaps found matching your filters.</p>
        </div>
      )}

      {Object.entries(grouped).map(([skill, items]) => (
        <div key={skill} className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-sm">{skill}</h3>
            <span className="text-xs text-muted-foreground">{items.length} employee{items.length > 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-border">
            {items.map((a) => {
              const emp = employeeMap[a.employee_id];
              return (
                <div key={a.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-xs">
                      {emp?.first_name?.[0]}{emp?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{emp ? `${emp.first_name} ${emp.last_name}` : "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{emp?.department} · {a.skill_topic || a.skill}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-0.5">Current</p>
                      <SkillLevelBadge level={a.current_level} />
                    </div>
                    <span className="text-muted-foreground">→</span>
                    <div className="text-center">
                      <p className="text-muted-foreground mb-0.5">Target</p>
                      <SkillLevelBadge level={a.target_level} />
                    </div>
                    <GapBadge gap={a.gap} />
                    {a.status && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                        a.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{a.status}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
