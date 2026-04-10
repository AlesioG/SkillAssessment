import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "../components/StatCard";
import GapBadge from "../components/GapBadge";
import { Users, Target, TrendingUp, AlertTriangle, DollarSign, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["hsl(225,73%,50%)", "hsl(160,60%,45%)", "hsl(30,80%,55%)", "hsl(280,65%,60%)"];

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const totalGaps = assessments.filter((a) => a.target_level - a.current_level > 0).length;
  const completedGaps = assessments.filter((a) => a.status === "Completed").length;
  const inProgressGaps = assessments.filter((a) => a.status === "In Progress").length;
  const criticalGaps = assessments.filter((a) => a.target_level - a.current_level >= 3).length;
  const completionRate = totalGaps > 0 ? Math.round((completedGaps / totalGaps) * 100) : 0;
  const totalBudgetPlanned = assessments.reduce((s, a) => s + (a.budget_planned || 0), 0);
  const totalBudgetUsed = assessments.reduce((s, a) => s + (a.budget_used || 0), 0);

  // Skill gap distribution
  const skillGapData = {};
  assessments.forEach((a) => {
    const gap = a.target_level - a.current_level;
    if (gap > 0) {
      skillGapData[a.skill] = (skillGapData[a.skill] || 0) + 1;
    }
  });
  const barData = Object.entries(skillGapData)
    .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, count }))
    .sort((a, b) => b.count - a.count);

  // Status distribution
  const statusData = [
    { name: "Not Started", value: assessments.filter((a) => a.status === "Not Started" || !a.status).length },
    { name: "In Progress", value: inProgressGaps },
    { name: "Completed", value: completedGaps },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of skill development across the IT division</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Employees" value={employees.length} icon={Users} color="primary" />
        <StatCard title="Total Gaps" value={totalGaps} icon={Target} color="amber" />
        <StatCard title="Completed" value={completedGaps} icon={CheckCircle} color="emerald" />
        <StatCard title="In Progress" value={inProgressGaps} icon={TrendingUp} color="primary" />
        <StatCard title="Critical Gaps" value={criticalGaps} icon={AlertTriangle} color="red" />
        <StatCard title="Completion" value={`${completionRate}%`} icon={TrendingUp} color="violet" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold mb-4">Skill Gaps by Category</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(225,73%,50%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No gap data yet</p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold mb-4">Status Distribution</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No assessment data yet</p>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Budget Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Planned Budget</p>
            <p className="text-xl font-bold mt-1">€{totalBudgetPlanned.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Used Budget</p>
            <p className="text-xl font-bold mt-1">€{totalBudgetUsed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Utilization</p>
            <p className="text-xl font-bold mt-1">
              {totalBudgetPlanned > 0 ? Math.round((totalBudgetUsed / totalBudgetPlanned) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
