"use client";

import { useState, useEffect } from "react";
import { useGetFullMenu, useListTags, useDeleteItem } from "@/lib/api/hooks";
import { MenuTree } from "@/components/admin/MenuTree";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckSquare, ChevronsRight, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type SelectableItem = { id: number; name: string; categoryId: number };

function MassDeleteDialog({
  open,
  onOpenChange,
  items,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SelectableItem[];
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

  const itemsToDelete = items.filter((i) => !toKeep.has(i.id));
  const itemsToKeep = items.filter((i) => toKeep.has(i.id));

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

        <div className="flex gap-3 min-h-40 mt-2">
          {/* Left: items to delete */}
          <div className="flex-1 space-y-2">
            {itemsToDelete.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                Geen items om te verwijderen
              </p>
            ) : (
              itemsToDelete.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded bg-destructive/5 border border-destructive/20"
                >
                  <Checkbox
                    checked={checkedForRescue.has(item.id)}
                    onCheckedChange={(checked) => toggleChecked(item.id, !!checked)}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
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

          {/* Right: items to keep */}
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-sm mb-2">Laat deze items staan</h4>
            {itemsToKeep.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                Geen items geselecteerd
              </p>
            ) : (
              itemsToKeep.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 rounded bg-green-500/10 border border-green-500/20"
                >
                  <span className="text-sm font-medium">{item.name}</span>
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
            onClick={() => onDelete(itemsToDelete.map((i) => i.id))}
            disabled={itemsToDelete.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Verwijder{itemsToDelete.length > 0 ? ` (${itemsToDelete.length})` : ""}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminDashboardPage() {
  const { data: menu, isLoading, error } = useGetFullMenu();
  const { data: tagDefs = [] } = useListTags();
  const { toast } = useToast();
  const deleteItem = useDeleteItem();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectableItem[]>([]);
  const [massDeleteOpen, setMassDeleteOpen] = useState(false);

  const selectedItemIds = new Set(selectedItems.map((i) => i.id));

  const toggleSelectMode = () => {
    setSelectMode((prev) => {
      if (prev) setSelectedItems([]);
      return !prev;
    });
  };

  const onToggleItem = (item: SelectableItem) => {
    setSelectedItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const handleMassDelete = async (idsToDelete: number[]) => {
    setMassDeleteOpen(false);
    let failed = 0;
    await Promise.all(
      idsToDelete.map(
        (id) =>
          new Promise<void>((resolve) => {
            deleteItem.mutate(
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
    setSelectedItems((prev) => prev.filter((i) => !idsToDelete.includes(i.id)));
    if (failed > 0) {
      toast({
        title: `${failed} item(s) konden niet worden verwijderd`,
        variant: "destructive",
      });
    } else {
      toast({ title: `${idsToDelete.length} item(s) verwijderd` });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load menu data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage Products
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {selectMode && selectedItems.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setMassDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Verwijder ({selectedItems.length})
            </Button>
          )}
          <Button
            variant={selectMode ? "secondary" : "outline"}
            size="sm"
            onClick={toggleSelectMode}
          >
            {selectMode ? (
              <>
                <X className="mr-2 h-4 w-4" /> Annuleer selectie
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" /> Selecteer
              </>
            )}
          </Button>
        </div>
      </div>

      {menu && menu.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-lg bg-card/50">
          <h3 className="text-lg font-medium">No sections found</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            You need to create a section before you can add categories and items.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {menu?.map((section) => (
            <MenuTree
              key={section.id}
              section={section}
              tagDefs={tagDefs}
              selectMode={selectMode}
              selectedItemIds={selectedItemIds}
              onToggleItem={onToggleItem}
            />
          ))}
        </div>
      )}

      <MassDeleteDialog
        open={massDeleteOpen}
        onOpenChange={setMassDeleteOpen}
        items={selectedItems}
        onDelete={handleMassDelete}
      />
    </div>
  );
}
