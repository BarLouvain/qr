"use client";

import { useGetFullMenu, useListTags } from "@/lib/api/hooks";
import { MenuTree } from "@/components/admin/MenuTree";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: menu, isLoading, error } = useGetFullMenu();
  const { data: tagDefs = [] } = useListTags();

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
        <AlertDescription>Failed to load menu data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Products</h1>
          
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
            <MenuTree key={section.id} section={section} tagDefs={tagDefs} />
          ))}
        </div>
      )}
    </div>
  );
}
