"use client";

import { useState, useEffect } from "react";
import { Plus, GripVertical, Edit2, Trash2, Save, X, CheckSquare, ChevronsRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useListSections, useCreateSection, useUpdateSection, useDeleteSection, sectionsKey, fullMenuKey } from "@/lib/api/hooks";
import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { MenuSection } from "@/lib/api/types";

type SelectableSection = { id: number; title: string };

function MassDeleteDialog({
  open,
  onOpenChange,
  sections,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: SelectableSection[];
  onDelete: (idsToDelete: number[]) => void;
}) {
  const [toKeep, setToKeep] = useState<Set<number>>(new Set());
  const [checkedForRescue, setCheckedForRescue] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      setToKeep(new Set());
      setCheckedForRescue(new Set());
    }
  }, [open]);

  const sectionsToDelete = sections.filter((s) => !toKeep.has(s.id));
  const sectionsToKeep = sections.filter((s) => toKeep.has(s.id));

  const handleRescue = () => {
    setToKeep((prev) => new Set([...prev, ...checkedForRescue]));
    setCheckedForRescue(new Set());
  };

  const toggleChecked = (id: number, checked: boolean) => {
    setCheckedForRescue((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ben je zeker dat je deze wilt verwijderen?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground -mt-1">
          Sections kunnen enkel verwijderd worden als ze leeg zijn (geen categorieën).
        </p>

        <div className="flex gap-3 min-h-40 mt-2">
          {/* Left: sections to delete */}
          <div className="flex-1 space-y-2">
            {sectionsToDelete.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                Geen sections om te verwijderen
              </p>
            ) : (
              sectionsToDelete.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-2 p-2 rounded bg-destructive/5 border border-destructive/20"
                >
                  <Checkbox
                    checked={checkedForRescue.has(section.id)}
                    onCheckedChange={(checked) => toggleChecked(section.id, !!checked)}
                  />
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
              ))
            )}
          </div>

          {/* Center: arrow button */}
          <div className="flex flex-col items-center justify-center px-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRescue}
              disabled={checkedForRescue.size === 0}
              title="Verplaats naar 'laat staan'"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Right: sections to keep */}
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm mb-2">Laat deze sections staan</h4>
            {sectionsToKeep.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                Geen sections geselecteerd
              </p>
            ) : (
              sectionsToKeep.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20"
                >
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuleer
          </Button>
          <Button
            variant="destructive"
            onClick={() => onDelete(sectionsToDelete.map((s) => s.id))}
            disabled={sectionsToDelete.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Verwijder{sectionsToDelete.length > 0 ? ` (${sectionsToDelete.length})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SectionsPage() {
  const { data: sections, isLoading } = useListSections();
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const { toast } = useToast();

  const qc = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newSection, setNewSection] = useState({ title: "", slug: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ title: "", slug: "" });

  const [ordered, setOrdered] = useState<MenuSection[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedSections, setSelectedSections] = useState<SelectableSection[]>([]);
  const [massDeleteOpen, setMassDeleteOpen] = useState(false);

  const selectedIds = new Set(selectedSections.map((s) => s.id));

  useEffect(() => {
    if (sections) setOrdered(sections);
  }, [sections]);

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedSections([]);
      return !prev;
    });
  };

  const onToggleSection = (section: SelectableSection) => {
    setSelectedSections((prev) =>
      prev.some((s) => s.id === section.id)
        ? prev.filter((s) => s.id !== section.id)
        : [...prev, section]
    );
  };

  const handleMassDelete = async (idsToDelete: number[]) => {
    setMassDeleteOpen(false);
    let failed = 0;
    await Promise.all(
      idsToDelete.map(
        (id) =>
          new Promise<void>((resolve) => {
            deleteSection.mutate(
              { id },
              {
                onSuccess: resolve,
                onError: () => {
                  failed++;
                  resolve();
                },
              }
            );
          })
      )
    );
    setSelectedSections((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
    if (failed > 0) {
      toast({
        title: `${failed} section(s) konden niet worden verwijderd (mogelijk niet leeg)`,
        variant: "destructive",
      });
    } else {
      toast({ title: `${idsToDelete.length} section(s) verwijderd` });
    }
  };

  const handleCreate = () => {
    if (!newSection.title || !newSection.slug) {
      toast({ title: "Validation Error", description: "Title and slug are required", variant: "destructive" });
      return;
    }
    createSection.mutate(
      { data: { ...newSection, sortOrder: ordered.length } },
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

  const startEdit = (section: MenuSection) => {
    setEditingId(section.id);
    setEditData({ title: section.title, slug: section.slug });
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...ordered];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updates = reordered
      .map((section, i) => ({ section, newOrder: i }))
      .filter(({ section, newOrder }) => section.sortOrder !== newOrder);

    const withNewSortOrders = reordered.map((s, i) => ({ ...s, sortOrder: i }));
    setOrdered(withNewSortOrders);
    qc.setQueryData(sectionsKey(), withNewSortOrders);
    setDragIndex(null);
    setDragOverIndex(null);

    await Promise.all(
      updates.map(({ section, newOrder }) =>
        apiFetch(`/api/sections/${section.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: newOrder }) })
      )
    );
    qc.invalidateQueries({ queryKey: sectionsKey() });
    qc.invalidateQueries({ queryKey: fullMenuKey() });
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Sections</h1>
          <p className="text-muted-foreground mt-1">Top-level categories like &quot;Food&quot;, &quot;Drinks&quot;, etc.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectMode && selectedSections.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setMassDeleteOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Verwijder ({selectedSections.length})
            </Button>
          )}
          <Button variant={selectMode ? "secondary" : "outline"} size="sm" onClick={toggleSelectMode}>
            {selectMode ? (
              <><X className="mr-2 h-4 w-4" /> Annuleer selectie</>
            ) : (
              <><CheckSquare className="mr-2 h-4 w-4" /> Selecteer</>
            )}
          </Button>
          {!selectMode && (
            <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          )}
        </div>
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
        ) : ordered.length === 0 && !isCreating ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
            No sections yet. Click &quot;Add Section&quot; to get started.
          </div>
        ) : (
          ordered.map((section, index) => (
            <div key={section.id}>
              {dragIndex !== null && dragOverIndex === index && dragIndex > index && (
                <div className="h-0.5 bg-primary rounded-full mb-3" />
              )}
              <Card
                className={`group transition-opacity ${dragIndex === index ? "opacity-40" : ""} ${selectedIds.has(section.id) ? "ring-2 ring-primary/50" : ""}`}
                draggable={!selectMode}
                onDragStart={() => !selectMode && handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
              >
                <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  {selectMode ? (
                    <Checkbox
                      checked={selectedIds.has(section.id)}
                      onCheckedChange={() => onToggleSection({ id: section.id, title: section.title })}
                    />
                  ) : (
                    <div className="text-muted-foreground/50 cursor-grab active:cursor-grabbing hidden sm:block">
                      <GripVertical className="h-5 w-5" />
                    </div>
                  )}

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

                  {!selectMode && (
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
                  )}
                </CardContent>
              </Card>
              {dragIndex !== null && dragOverIndex === index && dragIndex < index && (
                <div className="h-0.5 bg-primary rounded-full mt-3" />
              )}
            </div>
          ))
        )}
      </div>

      <MassDeleteDialog
        open={massDeleteOpen}
        onOpenChange={setMassDeleteOpen}
        sections={selectedSections}
        onDelete={handleMassDelete}
      />
    </div>
  );
}
