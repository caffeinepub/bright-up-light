import React, { useState } from "react";
import {
  useGetStudySessions,
  useAddStudySession,
  useDeleteStudySession,
} from "../hooks/useQueries";
import type { StudySession } from "../backend.d";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, BookOpen, Clock, Loader2 } from "lucide-react";

const today = () => new Date().toISOString().split("T")[0];

interface SessionForm {
  subject: string;
  durationMinutes: string;
  date: string;
  notes: string;
}

const defaultForm: SessionForm = {
  subject: "",
  durationMinutes: "",
  date: today(),
  notes: "",
};

export default function StudyLogPage() {
  const { data: sessions, isLoading } = useGetStudySessions();
  const addSession = useAddStudySession();
  const deleteSession = useDeleteStudySession();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SessionForm>(defaultForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const sortedSessions = [...(sessions ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const totalMinutes = (sessions ?? []).reduce(
    (acc, s) => acc + Number(s.durationMinutes),
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(form.durationMinutes, 10);
    if (!form.subject.trim() || !mins || mins <= 0) return;

    const session: StudySession = {
      subject: form.subject.trim(),
      durationMinutes: BigInt(mins),
      date: form.date,
      notes: form.notes.trim() || undefined,
    };

    try {
      await addSession.mutateAsync(session);
      toast.success("Study session logged! Great work!");
      setShowForm(false);
      setForm(defaultForm);
    } catch {
      toast.error("Could not save session. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSession.mutateAsync(deleteTarget);
      toast.success("Session deleted.");
    } catch {
      toast.error("Could not delete session. Please try again.");
    }
    setDeleteTarget(null);
  };

  return (
    <div className="max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Study Log</h1>
          <p className="text-muted-foreground mt-1">
            Track every study session, no matter how small.
          </p>
        </div>
        <Button
          onClick={() => { setForm(defaultForm); setShowForm(true); }}
          size="lg"
          className="rounded-xl gap-2 shrink-0 shadow-xs"
          aria-label="Log a new study session"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Log Session</span>
          <span className="sm:hidden">Log</span>
        </Button>
      </div>

      {/* Total summary */}
      <Card className="rounded-2xl shadow-card border-border mb-6 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Clock className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Study Time</p>
              {isLoading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  <span className="sr-only">Total study time: {totalHours} hours and {remainingMins} minutes</span>
                  <span aria-hidden="true">{totalHours}h {remainingMins}m</span>
                </p>
              )}
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-muted-foreground">Sessions</p>
              {isLoading ? (
                <Skeleton className="h-8 w-12 mt-1 ml-auto" />
              ) : (
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  <span className="sr-only">{sessions?.length ?? 0} total sessions</span>
                  <span aria-hidden="true">{sessions?.length ?? 0}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions list */}
      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : sortedSessions.length === 0 ? (
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center"
              aria-hidden="true"
            >
              <BookOpen className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-lg">No sessions logged yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Log your first study session to start tracking your time.
              </p>
            </div>
            <Button
              onClick={() => { setForm(defaultForm); setShowForm(true); }}
              size="sm"
              className="rounded-xl mt-2"
            >
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
              Log First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3" aria-label="Study sessions list">
          {sortedSessions.map((session) => (
            <li key={`${session.subject}-${session.date}`} className="stagger-child">
              <Card className="rounded-2xl shadow-card border-border hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold text-foreground truncate">
                          {session.subject}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          <span className="sr-only">Date: </span>
                          {session.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary tabular-nums">
                          <span className="sr-only">{Number(session.durationMinutes)} minutes</span>
                          <span aria-hidden="true">{Number(session.durationMinutes)}m</span>
                        </p>
                        <p className="text-xs text-muted-foreground">duration</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(session.subject)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Delete study session: ${session.subject}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                {session.notes && (
                  <CardContent className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground pl-13">
                      <span className="sr-only">Notes: </span>
                      {session.notes}
                    </p>
                  </CardContent>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Log Session Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !addSession.isPending && setShowForm(open)}>
        <DialogContent className="sm:max-w-md rounded-2xl" aria-describedby="session-form-desc">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Log Study Session</DialogTitle>
            <DialogDescription id="session-form-desc">
              Record what you studied, how long, and any notes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="session-subject" className="text-base font-medium">
                Subject <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="session-subject"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Reading comprehension"
                className="h-11 rounded-xl text-base"
                required
                aria-required="true"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-duration" className="text-base font-medium">
                  Duration (minutes) <span aria-hidden="true">*</span>
                </Label>
                <Input
                  id="session-duration"
                  type="number"
                  min="1"
                  max="600"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                  placeholder="30"
                  className="h-11 rounded-xl text-base"
                  required
                  aria-required="true"
                  aria-label="Study duration in minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-date" className="text-base font-medium">
                  Date
                </Label>
                <Input
                  id="session-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="h-11 rounded-xl text-base"
                  aria-label="Session date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-notes" className="text-base font-medium">
                Notes (optional)
              </Label>
              <Textarea
                id="session-notes"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="What did you learn or achieve?"
                className="rounded-xl text-base min-h-20"
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={addSession.isPending}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.subject.trim() || !form.durationMinutes || addSession.isPending}
                className="rounded-xl"
                aria-label={addSession.isPending ? "Saving session, please wait" : "Save study session"}
              >
                {addSession.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  "Log Session"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Delete the study session for <strong>"{deleteTarget}"</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
