"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Star, ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { useDeleteCategory, useDeleteItem, fullMenuKey } from "@/lib/api/hooks";
import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryForm } from "./forms/CategoryForm";
import { ItemForm } from "./forms/ItemForm";
import type { SectionWithNested, CategoryWithItems, MenuItem, MenuTag } from "@/lib/api/types";

type SelectableItem = { id: number; name: string; categoryId: number };

interface MenuTreeProps {
  section: SectionWithNested;
  tagDefs?: MenuTag[];
  selectMode?: boolean;
  selectedItemIds?: Set<number>;
  onToggleItem?: (item: SelectableItem) => void;
}

export function MenuTree({
  section,
  tagDefs = [],
  selectMode = false,
  selectedItemIds = new Set(),
  onToggleItem,
}: MenuTreeProps) {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithItems | null>(null);
  const { toast } = useToast();
  const deleteCategory = useDeleteCategory();

  const [orderedCategories, setOrderedCategories] = useState<CategoryWithItems[]>(section.categories);
  const [catDragIndex, setCatDragIndex] = useState<number | null>(null);
  const [catDragOverIndex, setCatDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setOrderedCategories(section.categories);
  }, [section.categories]);

  const handleDeleteCategory = (id: number) => {
    deleteCategory.mutate(
      { id },
      {
        onSuccess: () => toast({ title: "Category deleted" }),
        onError: () => toast({ title: "Failed to delete category. Might not be empty.", variant: "destructive" }),
      }
    );
  };

  const handleCategoryDrop = async (targetIndex: number) => {
    if (catDragIndex === null || catDragIndex === targetIndex) {
      setCatDragIndex(null);
      setCatDragOverIndex(null);
      return;
    }

    const reordered = [...orderedCategories];
    const [moved] = reordered.splice(catDragIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updates = reordered
      .map((cat, i) => ({ cat, newOrder: i }))
      .filter(({ cat, newOrder }) => cat.sortOrder !== newOrder);

    const withNewSortOrders = reordered.map((c, i) => ({ ...c, sortOrder: i }));
    setOrderedCategories(withNewSortOrders);
    qc.setQueryData(fullMenuKey(), (old: SectionWithNested[] | undefined) => {
      if (!old) return old;
      return old.map(s => s.id === section.id ? { ...s, categories: withNewSortOrders } : s);
    });
    setCatDragIndex(null);
    setCatDragOverIndex(null);

    await Promise.all(
      updates.map(({ cat, newOrder }) =>
        apiFetch(`/api/categories/${cat.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: newOrder }) })
      )
    );
    qc.invalidateQueries({ queryKey: fullMenuKey() });
  };

  return (
    <Card className="border-border overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
            <Badge variant="secondary" className="ml-2 font-mono text-xs">
              {section.categories.length} categories
            </Badge>
          </div>
          <Button size="sm" onClick={() => setAddingCategory(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-6">
            {addingCategory && (
              <CategoryForm sectionId={section.id} onSuccess={() => setAddingCategory(false)} onCancel={() => setAddingCategory(false)} />
            )}

            {orderedCategories.length === 0 && !addingCategory && (
              <div className="text-center py-8 text-muted-foreground text-sm">No categories in {section.title}.</div>
            )}

            <div className="space-y-6">
              {orderedCategories.map((category, index) => (
                <div key={category.id}>
                  {catDragIndex !== null && catDragOverIndex === index && catDragIndex > index && (
                    <div className="h-0.5 bg-primary rounded-full mb-3" />
                  )}
                  <div
                    className={`rounded-lg border border-border/50 bg-card transition-opacity ${catDragIndex === index ? "opacity-40" : ""}`}
                    draggable
                    onDragStart={() => setCatDragIndex(index)}
                    onDragOver={(e) => { e.preventDefault(); setCatDragOverIndex(index); }}
                    onDrop={() => handleCategoryDrop(index)}
                    onDragEnd={() => { setCatDragIndex(null); setCatDragOverIndex(null); }}
                  >
                    <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/10">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
                        <div>
                          <h3 className="font-semibold text-lg">{category.label}</h3>
                          {category.note && <p className="text-sm text-muted-foreground">{category.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingCategory(category)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{category.label}&quot;. All items inside must be deleted first.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="p-3">
                      <CategoryItemsList
                        category={category}
                        tagDefs={tagDefs}
                        selectMode={selectMode}
                        selectedItemIds={selectedItemIds}
                        onToggleItem={onToggleItem}
                      />
                    </div>
                  </div>
                  {catDragIndex !== null && catDragOverIndex === index && catDragIndex < index && (
                    <div className="h-0.5 bg-primary rounded-full mt-3" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          {editingCategory && (
            <CategoryForm
              sectionId={section.id}
              initialData={editingCategory}
              onSuccess={() => setEditingCategory(null)}
              onCancel={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface CategoryItemsListProps {
  category: CategoryWithItems;
  tagDefs?: MenuTag[];
  selectMode?: boolean;
  selectedItemIds?: Set<number>;
  onToggleItem?: (item: SelectableItem) => void;
}

function CategoryItemsList({
  category,
  tagDefs = [],
  selectMode = false,
  selectedItemIds = new Set(),
  onToggleItem,
}: CategoryItemsListProps) {
  const qc = useQueryClient();
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();
  const deleteItem = useDeleteItem();

  const [orderedItems, setOrderedItems] = useState<MenuItem[]>(category.items);
  const [itemDragIndex, setItemDragIndex] = useState<number | null>(null);
  const [itemDragOverIndex, setItemDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setOrderedItems(category.items);
  }, [category.items]);

  const handleDelete = (id: number) => {
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => toast({ title: "Item deleted" }),
        onError: () => toast({ title: "Failed to delete item", variant: "destructive" }),
      }
    );
  };

  const handleItemDrop = async (targetIndex: number) => {
    if (itemDragIndex === null || itemDragIndex === targetIndex) {
      setItemDragIndex(null);
      setItemDragOverIndex(null);
      return;
    }

    const reordered = [...orderedItems];
    const [moved] = reordered.splice(itemDragIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const updates = reordered
      .map((item, i) => ({ item, newOrder: i }))
      .filter(({ item, newOrder }) => item.sortOrder !== newOrder);

    const withNewSortOrders = reordered.map((item, i) => ({ ...item, sortOrder: i }));
    setOrderedItems(withNewSortOrders);
    qc.setQueryData(fullMenuKey(), (old: SectionWithNested[] | undefined) => {
      if (!old) return old;
      return old.map((s) => ({
        ...s,
        categories: s.categories.map((c) =>
          c.id === category.id ? { ...c, items: withNewSortOrders } : c
        ),
      }));
    });
    setItemDragIndex(null);
    setItemDragOverIndex(null);

    await Promise.all(
      updates.map(({ item, newOrder }) =>
        apiFetch(`/api/items/${item.id}`, { method: "PATCH", body: JSON.stringify({ sortOrder: newOrder }) })
      )
    );
    qc.invalidateQueries({ queryKey: fullMenuKey() });
  };

  return (
    <div className="space-y-3">
      {orderedItems.length === 0 && !addingItem && (
        <div className="text-sm text-muted-foreground italic py-2 pl-2">No items yet.</div>
      )}

      <div className="space-y-2">
        {orderedItems.map((item, index) => (
          <div key={item.id}>
            {itemDragIndex !== null && itemDragOverIndex === index && itemDragIndex > index && (
              <div className="h-0.5 bg-primary rounded-full mb-1" />
            )}
            <div
              className={`flex items-center justify-between p-3 rounded bg-background border border-border gap-4 transition-opacity ${itemDragIndex === index ? "opacity-40" : ""}`}
              draggable={!selectMode}
              onDragStart={() => !selectMode && setItemDragIndex(index)}
              onDragOver={(e) => { e.preventDefault(); setItemDragOverIndex(index); }}
              onDrop={() => handleItemDrop(index)}
              onDragEnd={() => { setItemDragIndex(null); setItemDragOverIndex(null); }}
            >
              {selectMode ? (
                <div className="shrink-0">
                  <Checkbox
                    checked={selectedItemIds.has(item.id)}
                    onCheckedChange={() =>
                      onToggleItem?.({ id: item.id, name: item.name, categoryId: item.categoryId })
                    }
                  />
                </div>
              ) : (
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {!item.active && (
                    <Badge variant="outline" className="text-muted-foreground border-dashed shrink-0">Hidden</Badge>
                  )}
                  <span className={`font-medium ${!item.active ? "text-muted-foreground line-through" : ""}`}>{item.name}</span>
                  <span className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">€{item.price}</span>
                  {item.featured && <Star className="h-3 w-3 text-secondary fill-secondary shrink-0" />}
                  {item.featuredBadge && <Badge variant="secondary" className="text-xs bg-secondary/20 text-secondary border-none">{item.featuredBadge}</Badge>}
                </div>
                {item.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{item.description}</p>}
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {item.tags.map((tagValue) => {
                      const def = tagDefs.find(t => t.value === tagValue);
                      return def ? (
                        <span
                          key={tagValue}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                          style={{ background: def.bgColor, color: def.textColor, border: `1px solid ${def.borderColor}` }}
                        >
                          {def.icon} {def.label}
                        </span>
                      ) : (
                        <span key={tagValue} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-accent text-accent-foreground rounded-sm">{tagValue}</span>
                      );
                    })}
                  </div>
                )}
              </div>

              {!selectMode && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingItem(item)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to delete &quot;{item.name}&quot;?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
            {itemDragIndex !== null && itemDragOverIndex === index && itemDragIndex < index && (
              <div className="h-0.5 bg-primary rounded-full mt-1" />
            )}
          </div>
        ))}
      </div>

      {!selectMode && addingItem && (
        <div className="mt-4 p-4 border border-primary/30 bg-primary/5 rounded-lg">
          <h4 className="font-medium mb-3 text-primary">New Item</h4>
          <ItemForm categoryId={category.id} onSuccess={() => setAddingItem(false)} onCancel={() => setAddingItem(false)} />
        </div>
      )}

      {!selectMode && !addingItem && (
        <Button variant="outline" size="sm" className="mt-2 w-full border-dashed" onClick={() => setAddingItem(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      )}

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          {editingItem && (
            <ItemForm
              categoryId={category.id}
              initialData={editingItem}
              onSuccess={() => setEditingItem(null)}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
