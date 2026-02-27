import React, { useState } from "react";
import {
  useGetGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useMarkGoalComplete,
} from "../hooks/useQueries";
import type { Goal } from "../backend.d";
import { Priority } from "../backend.d";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  CheckCircle2,
  Pencil,
  Trash2,
  Target,
  Loader2,
  Circle,
} from "lucide-react";

const CATEGORIES = ["Math", "Science", "Language", "Life Skills", "Career", "Other"];
const PRIORITIES = [
  { value: Priority.low, label: "Low" },
  { value: Priority.medium, label: "Medium" },
  { value: Priority.high, label: "High" },
];

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning-foreground border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

type FilterType = "all" | "active" | "completed";

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  targetDate: string;
}

const defaultForm: GoalFormData = {
  title: "",
  description: "",
  category: "Other",
  priority: Priority.medium,
  targetDate: "",
};

export default function GoalsPage() {
  const { data: goals, isLoading } = useGetGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const markComplete = useMarkGoalComplete();

  const [filter, setFilter] = useState<FilterType>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(defaultForm);

  const filteredGoals = (goals ?? []).filter((g) => {
    if (filter === "active") return !g.completed;
    if (filter === "completed") return g.completed;
    return true;
  });

  const openCreate = () => {
    setForm(defaultForm);
    setEditingGoal(null);
    setShowForm(true);
  };

  const openEdit = (goal: Goal) => {
    setForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      priority: goal.priority,
      targetDate: goal.targetDate,
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const goalData: Goal = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      targetDate: form.targetDate,
      completed: editingGoal?.completed ?? false,
    };

    try {
      if (editingGoal) {
        await updateGoal.mutateAsync({ title: editingGoal.title, updatedGoal: goalData });
        toast.success("Goal updated successfully!");
      } else {
        await createGoal.mutateAsync(goalData);
        toast.success("Goal created! You've got this!");
      }
      setShowForm(false);
      setEditingGoal(null);
      setForm(defaultForm);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleMarkComplete = async (goal: Goal) => {
    if (goal.completed) return;
    try {
      await markComplete.mutateAsync(goal.title);
      toast.success("🎉 Well done! Goal completed!", {
        duration: 5000,
        description: `"${goal.title}" — you achieved it!`,
      });
    } catch {
      toast.error("Could not mark goal as complete. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGoal.mutateAsync(deleteTarget);
      toast.success("Goal deleted.");
    } catch {
      toast.error("Could not delete goal. Please try again.");
    }
    setDeleteTarget(null);
  };

  const isPending = createGoal.isPending || updateGoal.isPending;

  return (
    <div className="max-w-3xl mx-auto page-enter">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">My Goals</h1>
          <p className="text-muted-foreground mt-1">
            Set meaningful goals and track your progress.
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="lg"
          className="rounded-xl gap-2 shrink-0 shadow-xs"
          aria-label="Create a new goal"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-2 mb-6"
      >
        {(["all", "active", "completed"] as FilterType[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
            className="rounded-full capitalize"
            aria-pressed={filter === f}
            aria-label={`Show ${f} goals`}
          >
            {f === "all" ? `All (${goals?.length ?? 0})` : f === "active" ? `Active (${goals?.filter((g) => !g.completed).length ?? 0})` : `Completed (${goals?.filter((g) => g.completed).length ?? 0})`}
          </Button>
        ))}
      </div>

      {/* Goals list */}
      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center" aria-hidden="true">
              <Target className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-lg">
                {filter === "completed" ? "No completed goals yet" : "No goals here yet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "all" || filter === "active"
                  ? "Create your first goal to start your journey."
                  : "Keep working towards your goals!"}
              </p>
            </div>
            {(filter === "all" || filter === "active") && (
              <Button
                onClick={openCreate}
                size="sm"
                className="rounded-xl mt-2"
              >
                <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                Create First Goal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" aria-label={`${filter} goals`}>
          {filteredGoals.map((goal) => (
            <li key={goal.title} className="stagger-child">
              <Card
                className={`rounded-2xl shadow-card border-border transition-all hover:shadow-card-hover ${
                  goal.completed ? "opacity-75" : ""
                }`}
              >
                <CardHeader className="pb-2 pt-5 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(goal)}
                        disabled={goal.completed || markComplete.isPending}
                        className="mt-0.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full disabled:cursor-default"
                        aria-label={
                          goal.completed
                            ? `${goal.title} — already completed`
                            : `Mark "${goal.title}" as complete`
                        }
                        aria-pressed={goal.completed}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-success" aria-hidden="true" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" aria-hidden="true" />
                        )}
                      </button>
                      <CardTitle
                        className={`text-base font-semibold leading-snug ${
                          goal.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {goal.title}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">
                      <Badge
                        variant="outline"
                        className={`text-xs rounded-full ${PRIORITY_STYLES[goal.priority] || ""}`}
                        aria-label={`Priority: ${goal.priority}`}
                      >
                        {goal.priority}
                      </Badge>
                      {!goal.completed && (
                        <button
                          type="button"
                          onClick={() => openEdit(goal)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Edit goal: ${goal.title}`}
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(goal.title)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Delete goal: ${goal.title}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-3 pl-9">
                      {goal.description}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap pl-9">
                    <Badge variant="secondary" className="rounded-full text-xs">
                      {goal.category}
                    </Badge>
                    {goal.targetDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="sr-only">Target date:</span>
                        📅 {goal.targetDate}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Create/Edit Goal Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !isPending && setShowForm(open)}>
        <DialogContent
          className="sm:max-w-lg rounded-2xl"
          aria-describedby="goal-form-desc"
        >
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </DialogTitle>
            <DialogDescription id="goal-form-desc">
              {editingGoal
                ? "Update the details of your goal below."
                : "Fill in the details to set a new goal for yourself."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="goal-title" className="text-base font-medium">
                Goal Title <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="goal-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Learn multiplication tables"
                className="h-11 rounded-xl text-base"
                required
                aria-required="true"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-description" className="text-base font-medium">
                Description
              </Label>
              <Textarea
                id="goal-description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="What does achieving this goal mean to you?"
                className="rounded-xl text-base min-h-20"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-category" className="text-base font-medium">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger
                    id="goal-category"
                    className="h-11 rounded-xl text-base"
                    aria-label="Select goal category"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-base">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-priority" className="text-base font-medium">
                  Priority
                </Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v as Priority }))}
                >
                  <SelectTrigger
                    id="goal-priority"
                    className="h-11 rounded-xl text-base"
                    aria-label="Select goal priority"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {PRIORITIES.map(({ value, label }) => (
                      <SelectItem key={value} value={value} className="text-base">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-date" className="text-base font-medium">
                Target Date
              </Label>
              <Input
                id="goal-date"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="h-11 rounded-xl text-base"
                aria-label="Target completion date"
              />
            </div>

            <DialogFooter className="gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.title.trim() || isPending}
                className="rounded-xl"
                aria-label={isPending ? "Saving goal, please wait" : editingGoal ? "Save changes" : "Create goal"}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : editingGoal ? (
                  "Save Changes"
                ) : (
                  "Create Goal"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>"{deleteTarget}"</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-label={`Confirm delete goal: ${deleteTarget}`}
            >
              {deleteGoal.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
