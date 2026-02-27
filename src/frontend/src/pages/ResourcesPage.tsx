import React, { useState } from "react";
import {
  useGetResources,
  useAddResource,
  useUpdateResource,
  useDeleteResource,
} from "../hooks/useQueries";
import type { Resource } from "../backend.d";
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
import { Plus, Pencil, Trash2, Library, ExternalLink, Loader2 } from "lucide-react";

const CATEGORIES = ["Math", "Science", "Language", "Life Skills", "Career", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  Math: "bg-primary/10 text-primary border-primary/20",
  Science: "bg-success/10 text-success border-success/20",
  Language: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  "Life Skills": "bg-accent/10 text-accent-foreground border-accent/20",
  Career: "bg-warning/10 text-warning-foreground border-warning/20",
  Other: "bg-muted text-muted-foreground border-border",
};

interface ResourceForm {
  title: string;
  url: string;
  category: string;
  notes: string;
}

const defaultForm: ResourceForm = {
  title: "",
  url: "",
  category: "Other",
  notes: "",
};

export default function ResourcesPage() {
  const { data: resources, isLoading } = useGetResources();
  const addResource = useAddResource();
  const updateResource = useUpdateResource();
  const deleteResource = useDeleteResource();

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceForm>(defaultForm);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = ["All", ...CATEGORIES];
  const filteredResources = (resources ?? []).filter(
    (r) => categoryFilter === "All" || r.category === categoryFilter
  );

  const openCreate = () => {
    setForm(defaultForm);
    setEditingResource(null);
    setShowForm(true);
  };

  const openEdit = (resource: Resource) => {
    setForm({
      title: resource.title,
      url: resource.url,
      category: resource.category,
      notes: resource.notes ?? "",
    });
    setEditingResource(resource);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;

    const resourceData: Resource = {
      title: form.title.trim(),
      url: form.url.trim(),
      category: form.category,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (editingResource) {
        await updateResource.mutateAsync({
          title: editingResource.title,
          updatedResource: resourceData,
        });
        toast.success("Resource updated!");
      } else {
        await addResource.mutateAsync(resourceData);
        toast.success("Resource saved!");
      }
      setShowForm(false);
      setEditingResource(null);
      setForm(defaultForm);
    } catch {
      toast.error("Could not save resource. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResource.mutateAsync(deleteTarget);
      toast.success("Resource deleted.");
    } catch {
      toast.error("Could not delete resource. Please try again.");
    }
    setDeleteTarget(null);
  };

  const isPending = addResource.isPending || updateResource.isPending;

  return (
    <div className="max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground mt-1">
            Save helpful links, tools, and materials.
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="lg"
          className="rounded-xl gap-2 shrink-0 shadow-xs"
          aria-label="Save a new resource"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          <span className="hidden sm:inline">Save Resource</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(cat)}
            className="rounded-full"
            aria-pressed={categoryFilter === cat}
            aria-label={`Show ${cat} resources`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Resources grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4" aria-busy="true">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="py-12 flex flex-col items-center text-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center"
              aria-hidden="true"
            >
              <Library className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-lg">
                {categoryFilter === "All" ? "No resources saved yet" : `No ${categoryFilter} resources`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {categoryFilter === "All"
                  ? "Save useful links and materials to build your library."
                  : "Save resources in this category to see them here."}
              </p>
            </div>
            <Button onClick={openCreate} size="sm" className="rounded-xl mt-2">
              <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
              Save First Resource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4" aria-label={`${categoryFilter} resources`}>
          {filteredResources.map((resource) => (
            <li key={resource.title} className="stagger-child">
              <Card className="rounded-2xl shadow-card border-border hover:shadow-card-hover transition-shadow h-full flex flex-col">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full shrink-0 ${CATEGORY_COLORS[resource.category] || CATEGORY_COLORS["Other"]}`}
                      aria-label={`Category: ${resource.category}`}
                    >
                      {resource.category}
                    </Badge>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(resource)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Edit resource: ${resource.title}`}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(resource.title)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Delete resource: ${resource.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <CardTitle className="text-base font-semibold text-foreground mt-2 leading-snug">
                    {resource.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4 flex-1 flex flex-col justify-between gap-3">
                  {resource.notes && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resource.notes}
                    </p>
                  )}
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded py-1 mt-auto"
                    aria-label={`Open resource: ${resource.title} (opens in new tab)`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{resource.url.replace(/^https?:\/\//, "")}</span>
                  </a>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Add/Edit Resource Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !isPending && setShowForm(open)}>
        <DialogContent className="sm:max-w-md rounded-2xl" aria-describedby="resource-form-desc">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {editingResource ? "Edit Resource" : "Save New Resource"}
            </DialogTitle>
            <DialogDescription id="resource-form-desc">
              {editingResource
                ? "Update this resource's details."
                : "Add a link or resource to your library."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="resource-title" className="text-base font-medium">
                Title <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="resource-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Khan Academy — Fractions"
                className="h-11 rounded-xl text-base"
                required
                aria-required="true"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-url" className="text-base font-medium">
                URL <span aria-hidden="true">*</span>
              </Label>
              <Input
                id="resource-url"
                type="url"
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://..."
                className="h-11 rounded-xl text-base"
                required
                aria-required="true"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-category" className="text-base font-medium">
                Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger
                  id="resource-category"
                  className="h-11 rounded-xl text-base"
                  aria-label="Select resource category"
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
              <Label htmlFor="resource-notes" className="text-base font-medium">
                Notes (optional)
              </Label>
              <Textarea
                id="resource-notes"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Why is this useful? What did you use it for?"
                className="rounded-xl text-base min-h-20"
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2">
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
                disabled={!form.title.trim() || !form.url.trim() || isPending}
                className="rounded-xl"
                aria-label={isPending ? "Saving resource, please wait" : editingResource ? "Save changes" : "Save resource"}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : editingResource ? (
                  "Save Changes"
                ) : (
                  "Save Resource"
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
            <AlertDialogTitle className="font-serif">Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>"{deleteTarget}"</strong>? This cannot be undone.
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
