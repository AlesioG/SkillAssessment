import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, X, Save, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "tech_lead", label: "Tech Lead" },
  { value: "line_manager", label: "Line Manager" },
  { value: "ld_expert", label: "L&D Expert" },
];

const emptyForm = {
  first_name: "", last_name: "", email: "", department: "", unit: "",
  job_position: "", role: "employee", line_manager_id: "", tech_lead_id: "",
};

export default function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const emps = await base44.entities.Employee.list();
    setEmployees(emps);
    setLoading(false);
  }

  function openNew() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowDialog(true);
  }

  function openEdit(emp) {
    setForm({
      first_name: emp.first_name || "",
      last_name: emp.last_name || "",
      email: emp.email || "",
      department: emp.department || "",
      unit: emp.unit || "",
      job_position: emp.job_position || "",
      role: emp.role || "employee",
      line_manager_id: emp.line_manager_id || "",
      tech_lead_id: emp.tech_lead_id || "",
    });
    setEditingId(emp.id);
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.first_name || !form.last_name || !form.department) return;
    if (editingId) {
      await base44.entities.Employee.update(editingId, form);
    } else {
      await base44.entities.Employee.create(form);
    }
    setShowDialog(false);
    await loadEmployees();
    toast({ title: editingId ? "Employee updated" : "Employee created" });
  }

  async function handleDelete(id) {
    await base44.entities.Employee.delete(id);
    await loadEmployees();
    toast({ title: "Employee deleted" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const managers = employees.filter((e) => e.role === "line_manager");
  const techLeads = employees.filter((e) => e.role === "tech_lead");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Employees</h1>
          <p className="text-muted-foreground text-sm mt-1">Add and manage employee profiles</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No employees yet. Add your first employee to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-card rounded-xl border border-border p-4 flex items-start justify-between group hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                {emp.first_name?.[0]}{emp.last_name?.[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{emp.first_name} {emp.last_name}</p>
                <p className="text-xs text-muted-foreground">{emp.job_position || emp.role} · {emp.department}</p>
                <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  emp.role === "tech_lead" ? "bg-violet-50 text-violet-700" :
                  emp.role === "line_manager" ? "bg-blue-50 text-blue-700" :
                  emp.role === "ld_expert" ? "bg-amber-50 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>{ROLES.find((r) => r.value === emp.role)?.label || emp.role}</span>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => openEdit(emp)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">First Name *</Label>
                <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Last Name *</Label>
                <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Department *</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit</Label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Job Position</Label>
                <Input value={form.job_position} onChange={(e) => setForm({ ...form, job_position: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Line Manager</Label>
                <Select value={form.line_manager_id} onValueChange={(v) => setForm({ ...form, line_manager_id: v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {managers.map((m) => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tech Lead</Label>
                <Select value={form.tech_lead_id} onValueChange={(v) => setForm({ ...form, tech_lead_id: v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {techLeads.map((t) => <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.first_name || !form.last_name || !form.department} className="gap-2">
                <Save className="h-4 w-4" /> {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
