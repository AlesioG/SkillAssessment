import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { User, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import GapBadge from "../components/GapBadge";

export default function MyTeam() {
  const [employees, setEmployees] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function load() {
      const [user, emps, assmts] = await Promise.all([
        base44.auth.me(),
        base44.entities.Employee.list(),
        base44.entities.SkillAssessment.list(),
      ]);
      setCurrentUser(user);
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

  // Filter team based on role
  const userRole = currentUser?.role;
  const userEmployeeId = currentUser?.employee_id;

  let teamEmployees = employees;
  if (userRole === "tech_lead") {
    teamEmployees = employees.filter(
      (e) => e.tech_lead_id === userEmployeeId || e.id === userEmployeeId
    );
  } else if (userRole === "line_manager") {
    // Line managers see tech leads and employees under them
    const directReports = employees.filter((e) => e.line_manager_id === userEmployeeId);
    const directReportIds = directReports.map((e) => e.id);
    // Also include employees under their tech leads
    const indirectReports = employees.filter(
      (e) => directReportIds.includes(e.tech_lead_id) || directReportIds.includes(e.line_manager_id)
    );
    const allIds = new Set([userEmployeeId, ...directReportIds, ...indirectReports.map((e) => e.id)]);
    teamEmployees = employees.filter((e) => allIds.has(e.id));
  }

  const filtered = teamEmployees.filter((e) => {
    const name = `${e.first_name} ${e.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const getEmployeeStats = (empId) => {
    const empAssessments = assessments.filter((a) => a.employee_id === empId);
    const gaps = empAssessments.filter((a) => a.target_level - a.current_level > 0);
    const completed = empAssessments.filter((a) => a.status === "Completed");
    const maxGap = Math.max(0, ...empAssessments.map((a) => a.target_level - a.current_level));
    return { total: empAssessments.length, gaps: gaps.length, completed: completed.length, maxGap };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">My Team</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {userRole === "tech_lead" ? "Manage assessments for your team members" : 
           userRole === "line_manager" ? "View your direct reports and their teams" : 
           "All employees in the division"}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No employees found</p>
          </div>
        )}
        {filtered.map((emp) => {
          const stats = getEmployeeStats(emp.id);
          return (
            <Link
              key={emp.id}
              to={`/assessments?employee=${emp.id}`}
              className="flex items-center justify-between bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {emp.first_name?.[0]}{emp.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{emp.first_name} {emp.last_name}</p>
                  <p className="text-xs text-muted-foreground">{emp.job_position || emp.role} · {emp.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{stats.total} skills</span>
                  <span>·</span>
                  <span>{stats.gaps} gaps</span>
                  <span>·</span>
                  <span>{stats.completed} done</span>
                </div>
                {stats.maxGap > 0 && <GapBadge gap={stats.maxGap} />}
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
