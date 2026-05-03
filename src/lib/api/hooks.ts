"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiFetch } from "./client";
import type {
  SectionWithNested,
  MenuSection,
  MenuCategory,
  MenuItem,
  MenuTag,
  CreateSectionBody,
  UpdateSectionBody,
  CreateCategoryBody,
  UpdateCategoryBody,
  CreateItemBody,
  UpdateItemBody,
} from "./types";

// ─── Query keys ──────────────────────────────────────────────────────────────

export const fullMenuKey = () => ["/api/menu"] as const;
export const sectionsKey = () => ["/api/sections"] as const;
export const tagsKey = () => ["/api/tags"] as const;

// ─── Full menu ────────────────────────────────────────────────────────────────

export function useGetFullMenu(
  options?: Partial<UseQueryOptions<SectionWithNested[]>>
) {
  return useQuery<SectionWithNested[]>({
    queryKey: fullMenuKey(),
    queryFn: () => apiFetch<SectionWithNested[]>("/api/menu"),
    ...options,
  });
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function useListTags() {
  return useQuery<MenuTag[]>({
    queryKey: tagsKey(),
    queryFn: () => apiFetch<MenuTag[]>("/api/tags"),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<MenuTag, "id" | "restaurantId">) =>
      apiFetch<MenuTag>("/api/tags", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: tagsKey() }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<MenuTag, "id" | "restaurantId">> }) =>
      apiFetch<MenuTag>(`/api/tags/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: tagsKey() }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/api/tags/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: tagsKey() }),
  });
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export function useListSections() {
  return useQuery<MenuSection[]>({
    queryKey: sectionsKey(),
    queryFn: () => apiFetch<MenuSection[]>("/api/sections"),
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ data }: { data: CreateSectionBody }) =>
      apiFetch<MenuSection>("/api/sections", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sectionsKey() });
      qc.invalidateQueries({ queryKey: fullMenuKey() });
    },
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSectionBody }) =>
      apiFetch<MenuSection>(`/api/sections/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sectionsKey() });
      qc.invalidateQueries({ queryKey: fullMenuKey() });
    },
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/api/sections/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sectionsKey() });
      qc.invalidateQueries({ queryKey: fullMenuKey() });
    },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: number;
      data: CreateCategoryBody;
    }) =>
      apiFetch<MenuCategory>(`/api/sections/${sectionId}/categories`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: fullMenuKey() }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryBody }) =>
      apiFetch<MenuCategory>(`/api/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: fullMenuKey() }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: fullMenuKey() }),
  });
}

// ─── Items ────────────────────────────────────────────────────────────────────

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      data,
    }: {
      data: CreateItemBody & { categoryId: number };
    }) =>
      apiFetch<MenuItem>(`/api/categories/${data.categoryId}/items`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: fullMenuKey() }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateItemBody }) =>
      apiFetch<MenuItem>(`/api/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: fullMenuKey() }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiFetch<void>(`/api/items/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: fullMenuKey() }),
  });
}
