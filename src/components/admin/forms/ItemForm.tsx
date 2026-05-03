"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { useCreateItem, useUpdateItem, useListTags } from "@/lib/api/hooks";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { MenuItem } from "@/lib/api/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.string().min(1, "Price is required"),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  featuredBadge: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface Props {
  categoryId: number;
  initialData?: MenuItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ItemForm({ categoryId, initialData, onSuccess, onCancel }: Props) {
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const { data: availableTags = [] } = useListTags();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      price: initialData?.price ?? "",
      tags: initialData?.tags ?? [],
      featured: initialData?.featured ?? false,
      featuredBadge: initialData?.featuredBadge ?? "",
      active: initialData?.active ?? true,
    },
  });

  const onSubmit = (data: FormData) => {
    if (initialData) {
      updateItem.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => { toast({ title: "Item updated" }); onSuccess(); },
          onError: () => toast({ title: "Failed to update item", variant: "destructive" }),
        }
      );
    } else {
      createItem.mutate(
        { data: { ...data, categoryId, sortOrder: 0 } },
        {
          onSuccess: () => { toast({ title: "Item created" }); onSuccess(); },
          onError: () => toast({ title: "Failed to create item", variant: "destructive" }),
        }
      );
    }
  };

  const isPending = createItem.isPending || updateItem.isPending;
  const tags = form.watch("tags");

  const toggleTag = (tag: string) => {
    form.setValue("tags", tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl><Input placeholder="e.g. Latte Macchiato" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl><Input placeholder="e.g. 3.50" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
            <FormControl>
              <Textarea placeholder="Ingredients, allergens, etc." className="resize-none h-16" {...field} value={field.value ?? ""} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Tags</h4>
            {availableTags.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nog geen tags. Maak ze aan via <strong>Tags</strong> in het menu.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = tags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleTag(tag.value)}
                      className={`text-xs px-3 py-1.5 rounded border font-semibold transition-all ${active ? "ring-2 ring-primary ring-offset-1" : "opacity-60 hover:opacity-100"}`}
                      style={active
                        ? { background: tag.bgColor, color: tag.textColor, borderColor: tag.borderColor }
                        : { background: "transparent", color: "var(--muted-foreground)", borderColor: "var(--border)" }
                      }
                    >
                      {active && <X className="h-3 w-3 inline mr-1 -mt-0.5" />}
                      {tag.icon} {tag.label}
                    </button>
                  );
                })}
              </div>
            )}

            <FormField control={form.control} name="active" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Visible to customers</FormLabel>
                  <FormDescription>Uncheck to hide this item from the public menu.</FormDescription>
                </div>
              </FormItem>
            )} />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Featuring</h4>
            <FormField control={form.control} name="featured" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 border-secondary/30 bg-secondary/5">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-secondary">Highlight item</FormLabel>
                  <FormDescription>Makes the item stand out on the menu.</FormDescription>
                </div>
              </FormItem>
            )} />
            {form.watch("featured") && (
              <FormField control={form.control} name="featuredBadge" render={({ field }) => (
                <FormItem>
                  <FormLabel>Highlight Badge Text</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Our Bestseller, Chef's Choice" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>Cancel</Button>
          <Button type="submit" disabled={isPending}>
            {initialData ? "Save Changes" : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
