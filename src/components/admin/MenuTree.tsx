"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Star, ChevronDown, ChevronRight } from "lucide-react";
import { useDeleteCategory, useDeleteItem } from "@/lib/api/hooks";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CategoryForm } from "./forms/CategoryForm";
import { ItemForm } from "./forms/ItemForm";
import type { SectionWithNested, CategoryWithItems, MenuItem } from "@/lib/api/types";

export function MenuTree({ section }: { section: SectionWithNested }) {
  const [isOpen, setIsOpen] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithItems | null>(null);
  const { toast } = useToast();
  const deleteCategory = useDeleteCategory();

  const handleDeleteCategory = (id: number) => {
    deleteCategory.mutate(
      { id },
      {
        onSuccess: () => toast({ title: "Category deleted" }),
        onError: () => toast({ title: "Failed to delete category. Might not be empty.", variant: "destructive" }),
      }
    );
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

            {section.categories.length === 0 && !addingCategory && (
              <div className="text-center py-8 text-muted-foreground text-sm">No categories in {section.title}.</div>
            )}

            <div className="space-y-6">
              {section.categories.map((category) => (
                <div key={category.id} className="rounded-lg border border-border/50 bg-card">
                  <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/10">
                    <div>
                      <h3 className="font-semibold text-lg">{category.label}</h3>
                      {category.note && <p className="text-sm text-muted-foreground">{category.note}</p>}
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
                    <CategoryItemsList category={category} />
                  </div>
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

function CategoryItemsList({ category }: { category: CategoryWithItems }) {
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();
  const deleteItem = useDeleteItem();

  const handleDelete = (id: number) => {
    deleteItem.mutate(
      { id },
      {
        onSuccess: () => toast({ title: "Item deleted" }),
        onError: () => toast({ title: "Failed to delete item", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-3">
      {category.items.length === 0 && !addingItem && (
        <div className="text-sm text-muted-foreground italic py-2 pl-2">No items yet.</div>
      )}

      <div className="space-y-2">
        {category.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded bg-background border border-border gap-4">
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
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-accent text-accent-foreground rounded-sm">{tag}</span>
                  ))}
                </div>
              )}
            </div>

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
          </div>
        ))}
      </div>

      {addingItem && (
        <div className="mt-4 p-4 border border-primary/30 bg-primary/5 rounded-lg">
          <h4 className="font-medium mb-3 text-primary">New Item</h4>
          <ItemForm categoryId={category.id} onSuccess={() => setAddingItem(false)} onCancel={() => setAddingItem(false)} />
        </div>
      )}

      {!addingItem && (
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
