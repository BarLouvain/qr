"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCategory, useUpdateCategory } from "@/lib/api/hooks";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MenuCategory } from "@/lib/api/types";

const schema = z.object({
  label: z.string().min(1, "Label is required"),
  note: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  sectionId: number;
  initialData?: MenuCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ sectionId, initialData, onSuccess, onCancel }: Props) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { label: initialData?.label ?? "", note: initialData?.note ?? "" },
  });

  const onSubmit = (data: FormData) => {
    if (initialData) {
      updateCategory.mutate(
        { id: initialData.id, data },
        {
          onSuccess: () => { toast({ title: "Category updated" }); onSuccess(); },
          onError: () => toast({ title: "Failed to update", variant: "destructive" }),
        }
      );
    } else {
      createCategory.mutate(
        { sectionId, data: { ...data, sortOrder: 0 } },
        {
          onSuccess: () => { toast({ title: "Category created" }); onSuccess(); },
          onError: () => toast({ title: "Failed to create", variant: "destructive" }),
        }
      );
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Card className="border-primary/50 shadow-sm bg-card/50">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1 w-full">
              <FormField control={form.control} name="label" render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl><Input placeholder="e.g. Hot Drinks" autoFocus {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex-1 w-full">
              <FormField control={form.control} name="note" render={({ field }) => (
                <FormItem>
                  <FormLabel>Note <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                  <FormControl><Input placeholder="e.g. Served with a cookie" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="flex gap-2 sm:mt-8 w-full sm:w-auto">
              <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
                {initialData ? "Save" : "Add"}
              </Button>
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending} className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
