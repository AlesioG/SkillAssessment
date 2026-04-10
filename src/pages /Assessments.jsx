import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import SkillLevelBadge from "../components/SkillLevelBadge";
import GapBadge from "../components/GapBadge";
import AssessmentForm from "../components/AssessmentForm";

const SKILLS = [
  "Artificial Intelligence", "Cloud Architecture", "DevOps", "Data Engineering",
  "Cybersecurity", "Soft Skills", "Agile Related", "Leadership Development",
];

export default function Assessments() {
  const urlParams = new URLSearchParams(window.location.search);
  const employeeId = urlParams.get("employee");

  const [employee, setEmployee] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(employeeId || "");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function load() {
      const emps = await base44.entities.Employee.list();
      setEmployees(emps);
      if (employeeId) {
        const emp = emps.find((e) => e.id === employeeId);
        setEmployee(emp);
        setSelectedEmpId(employeeId);
      }
      setLoading(false);
    }
    load();
  }, [employeeId]);

  useEffect(() => {
    if (selectedEmpId) {
      loadAssessments(selectedEmpId);
    }
  }, [selectedEmpId]);

  async function loadAssessments(empId) {
    const assmts = await base44.entities.SkillAssessment.filter({ employee_id: empId });
    setAssessments(assmts);
    const emp = employees.find((e) => e.id === empId);
    setEmployee(emp);
  }

  async function handleDelete(id) {
    await base44.entities.SkillAssessment.delete(id);
    setAssessments((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Assessment deleted" });
  }

  async function handleSaved() {
    setShowForm(false);
    await loadAssessments(selectedEmpId);
    toast({ title: "Assessment saved" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/team">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Skill Assessments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {employee ? `${employee.first_name} ${employee.last_name}` : "Select an employee"}
          </p>
        </div>
      </div>

      {/* Employee Selector */}
      {!employeeId && (
        <div className="max-w-sm">
          <Select value={selectedEmpId} onValueChange={(v) => setSelectedEmpId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.first_name} {e.last_name} — {e.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {selectedEmpId && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Skill Assessment
            </Button>
          </div>

          {showForm && (
            <AssessmentForm
              employeeId={selectedEmpId}
              onSaved={handleSaved}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Assessment List */}
          <div className="space-y-3">
            {assessments.length === 0 && !showForm && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No skill assessments yet. Click "Add Skill Assessment" to get started.</p>
              </div>
            )}
            {assessments.map((a) => {
              const gap = a.target_level - a.current_level;
              return (
                <div key={a.id} className="bg-card rounded-xl border border-border p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm">{a.skill}</h3>
                      {a.skill_topic && <p className="text-xs text-muted-foreground mt-0.5">{a.skill_topic}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="text-xs space-y-0.5">
                      <p className="text-muted-foreground">Current</p>
                      <SkillLevelBadge level={a.current_level} />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="text-muted-foreground">Target</p>
                      <SkillLevelBadge level={a.target_level} />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="text-muted-foreground">Gap</p>
                      <GapBadge gap={gap} />
                    </div>
                    {a.status && (
                      <div className="text-xs space-y-0.5">
                        <p className="text-muted-foreground">Status</p>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          a.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                          a.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{a.status}</span>
                      </div>
                    )}
                    {a.budget_planned > 0 && (
                      <div className="text-xs space-y-0.5">
                        <p className="text-muted-foreground">Budget</p>
                        <span className="text-xs font-medium">€{a.budget_planned}</span>
                      </div>
                    )}
                  </div>
                  {a.strategic_dimensions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {a.strategic_dimensions.map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded bg-primary/5 text-primary text-xs">{d}</span>
                      ))}
                    </div>
                  )}
                  {a.learning_options?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Learning: {a.learning_options.join(", ")}
                    </p>
                  )}
                  {a.feedback && (
                    <p className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                      <span className="font-medium">Feedback:</span> {a.feedback}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
