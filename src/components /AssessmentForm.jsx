import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const SKILLS = [
  "Artificial Intelligence", "Cloud Architecture", "DevOps", "Data Engineering",
  "Cybersecurity", "Soft Skills", "Agile Related", "Leadership Development",
];
const LEVELS = [
  { value: 0, label: "0 – No Knowledge" },
  { value: 1, label: "1 – Basic" },
  { value: 2, label: "2 – Intermediate" },
  { value: 3, label: "3 – Advanced" },
  { value: 4, label: "4 – Very Skilled" },
];
const DIMENSIONS = ["Cloud", "Data", "Open Module Architecture", "Integration", "AI Related", "Agile Engineering", "Other", "Soft Skills"];
const LEARNING_OPTIONS = ["Pluralsight", "RBI Group Trainings", "DataCamp", "ODA", "Udemy", "Coursera", "Other"];
const STATUSES = ["Not Started", "In Progress", "Completed"];
const REASONS = ["Lack of budget", "Missing learning options", "Lack of engagement", "Other"];

export default function AssessmentForm({ employeeId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    skill: "", skill_topic: "", current_level: "", target_level: "",
    strategic_dimensions: [], learning_options: [], budget_planned: "",
    status: "Not Started", reason_not_completed: [], reason_other_text: "",
    learning_option_used: "", feedback: "", budget_used: "",
    year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  const gap = form.target_level !== "" && form.current_level !== ""
    ? Number(form.target_level) - Number(form.current_level)
    : null;

  function toggleArray(arr, value) {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  async function handleSave() {
    if (!form.skill || form.current_level === "" || form.target_level === "") return;
    setSaving(true);
    await base44.entities.SkillAssessment.create({
      employee_id: employeeId,
      skill: form.skill,
      skill_topic: form.skill_topic,
      current_level: Number(form.current_level),
      target_level: Number(form.target_level),
      strategic_dimensions: form.strategic_dimensions,
      learning_options: form.learning_options,
      budget_planned: form.budget_planned ? Number(form.budget_planned) : 0,
      budget_used: form.budget_used ? Number(form.budget_used) : 0,
      status: form.status,
      reason_not_completed: form.status !== "Completed" ? form.reason_not_completed : [],
      reason_other_text: form.reason_other_text,
      learning_option_used: form.status === "Completed" ? form.learning_option_used : "",
      feedback: form.feedback,
      year: form.year,
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">New Skill Assessment</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Skill */}
        <div className="space-y-1.5">
          <Label className="text-xs">Skill *</Label>
          <Select value={form.skill} onValueChange={(v) => setForm({ ...form, skill: v })}>
            <SelectTrigger><SelectValue placeholder="Select skill" /></SelectTrigger>
            <SelectContent>
              {SKILLS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Specific Topic */}
        <div className="space-y-1.5">
          <Label className="text-xs">Specific Topic</Label>
          <Input placeholder="e.g. Communication Skills" value={form.skill_topic} onChange={(e) => setForm({ ...form, skill_topic: e.target.value })} />
        </div>

        {/* Current Level */}
        <div className="space-y-1.5">
          <Label className="text-xs">Current Level *</Label>
          <Select value={String(form.current_level)} onValueChange={(v) => setForm({ ...form, current_level: v })}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => <SelectItem key={l.value} value={String(l.value)}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Target Level */}
        <div className="space-y-1.5">
          <Label className="text-xs">Target Level *</Label>
          <Select value={String(form.target_level)} onValueChange={(v) => setForm({ ...form, target_level: v })}>
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => <SelectItem key={l.value} value={String(l.value)}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gap display */}
      {gap !== null && (
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <span className="text-muted-foreground">Calculated Gap: </span>
          <span className="font-semibold">
            {gap <= 0 ? "No Gap ✓" : `${gap} – ${gap === 1 ? "Low" : gap === 2 ? "Moderate" : gap === 3 ? "High" : "Critical"}`}
          </span>
        </div>
      )}

      {/* Strategic Dimensions */}
      <div className="space-y-2">
        <Label className="text-xs">Strategic Skill Dimensions</Label>
        <div className="flex flex-wrap gap-2">
          {DIMENSIONS.map((d) => (
            <label key={d} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox
                checked={form.strategic_dimensions.includes(d)}
                onCheckedChange={() => setForm({ ...form, strategic_dimensions: toggleArray(form.strategic_dimensions, d) })}
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      {/* Learning Options */}
      <div className="space-y-2">
        <Label className="text-xs">Learning Options</Label>
        <div className="flex flex-wrap gap-2">
          {LEARNING_OPTIONS.map((l) => (
            <label key={l} className="flex items-center gap-1.5 text-xs cursor-pointer">
              <Checkbox
                checked={form.learning_options.includes(l)}
                onCheckedChange={() => setForm({ ...form, learning_options: toggleArray(form.learning_options, l) })}
              />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget */}
        <div className="space-y-1.5">
          <Label className="text-xs">Budget Planned (EUR)</Label>
          <Input type="number" placeholder="0" value={form.budget_planned} onChange={(e) => setForm({ ...form, budget_planned: e.target.value })} />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Budget Used */}
        <div className="space-y-1.5">
          <Label className="text-xs">Budget Used (EUR)</Label>
          <Input type="number" placeholder="0" value={form.budget_used} onChange={(e) => setForm({ ...form, budget_used: e.target.value })} />
        </div>
      </div>

      {/* Conditional: Reason not completed */}
      {form.status !== "Completed" && form.status !== "" && (
        <div className="space-y-2">
          <Label className="text-xs">Reason for Not Completed</Label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <label key={r} className="flex items-center gap-1.5 text-xs cursor-pointer">
                <Checkbox
                  checked={form.reason_not_completed.includes(r)}
                  onCheckedChange={() => setForm({ ...form, reason_not_completed: toggleArray(form.reason_not_completed, r) })}
                />
                {r}
              </label>
            ))}
          </div>
          {form.reason_not_completed.includes("Other") && (
            <Input placeholder="Specify other reason" value={form.reason_other_text} onChange={(e) => setForm({ ...form, reason_other_text: e.target.value })} />
          )}
        </div>
      )}

      {/* Conditional: Learning option used */}
      {form.status === "Completed" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Learning Option Used</Label>
          <Select value={form.learning_option_used} onValueChange={(v) => setForm({ ...form, learning_option_used: v })}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              {LEARNING_OPTIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Feedback */}
      <div className="space-y-1.5">
        <Label className="text-xs">Feedback on Skills Development</Label>
        <Textarea rows={2} placeholder="Year-end feedback..." value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !form.skill || form.current_level === "" || form.target_level === ""} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Assessment"}
        </Button>
      </div>
    </div>
  );
}
