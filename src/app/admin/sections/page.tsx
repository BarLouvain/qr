"use client";

import { useState } from "react";
import { Plus, GripVertical, Edit2, Trash2, Save, X } from "lucide-react";
import { useListSections, useCreateSection, useUpdateSection, useDeleteSection } from "@/lib/api/hooks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SectionsPage() {
  const { data: sections, isLoading } = useListSections();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [newSection, setNewSection] = useState({ title: "", slug: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: "", slug: "" });

  const handleCreate = () => {
    if (!newSection.title || !newSection.slug) {
      toast({ title: "Validation Error", description: "Title and slug are required", variant: "destructive" });
      return;
    }
    createSection.mutate(
      { data: { ...newSection, sortOrder: sections ? sections.length : 0 } },
      {
        onSuccess: () => { setIsCreating(false); setNewSection({ title: "", slug: "" }); toast({ title: "Section created successfully" }); },
        onError: () => toast({ title: "Error creating section", variant: "destructive" }),
      }
    );
  };

  const handleUpdate = (id: number) => {
    if (!editData.title || !editData.slug) return;
    updateSection.mutate(
      { id, data: editData },
      {
        onSuccess: () => { setEditingId(null); toast({ title: "Section updated successfully" }); },
        onError: () => toast({ title: "Error updating section", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteSection.mutate(
      { id },
      {
        onSuccess: () => toast({ title: "Section deleted" }),
        onError: () => toast({ title: "Error deleting section. It might not be empty.", variant: "destructive" }),
      }
    );
  };

  const startEdit = (section: { id: number; title: string; slug: string }) => {
    setEditingId(section.id);
    setEditData({ title: section.title, slug: section.slug });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Sections</h1>
          <p className="text-muted-foreground mt-1">Top-level categories like &quot;Food&quot;, &quot;Drinks&quot;, etc.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="mr-2 h-4 w-4" /> Add Section
        </Button>
      </div>

      <div className="space-y-3">
        {isCreating && (
          <Card className="border-primary/50 shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Title</label>
                  <Input
                    placeholder="e.g. Drinks"
                    value={newSection.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setNewSection({ title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") });
                    }}
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-medium">Slug</label>
                  <Input
                    placeholder="e.g. drinks"
                    value={newSection.slug}
                    onChange={(e) => setNewSection({ ...newSection, slug: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5 sm:mt-0">
                <Button size="sm" onClick={handleCreate} disabled={createSection.isPending}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
        ) : sections?.length === 0 && !isCreating ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No sections yet. Click &quot;Add Section&quot; to get started.
          </div>
        ) : (
          sections?.map((section) => (
            <Card key={section.id} className="group">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="text-muted-foreground/50 cursor-grab hidden sm:block">
                  <GripVertical className="h-5 w-5" />
                </div>

                {editingId === section.id ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <Input value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                    <Input value={editData.slug} onChange={(e) => setEditData({ ...editData, slug: e.target.value })} />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <span className="font-semibold">{section.title}</span>
                    <span className="text-sm text-muted-foreground font-mono">/{section.slug}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                  {editingId === section.id ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => handleUpdate(section.id)} disabled={updateSection.isPending}>
                        <Save className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => startEdit(section)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. You must delete all categories inside this section first.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(section.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
