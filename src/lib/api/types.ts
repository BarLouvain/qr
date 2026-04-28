export type MenuSection = {
  id: number;
  title: string;
  slug: string;
  sortOrder: number;
};

export type MenuCategory = {
  id: number;
  sectionId: number;
  label: string;
  note: string | null;
  sortOrder: number;
};

export type MenuItem = {
  id: number;
  categoryId: number;
  name: string;
  description: string | null;
  price: string;
  tags: string[];
  featured: boolean;
  featuredBadge: string | null;
  active: boolean;
  sortOrder: number;
};

export type CategoryWithItems = MenuCategory & { items: MenuItem[] };
export type SectionWithNested = MenuSection & { categories: CategoryWithItems[] };

export type CreateSectionBody = { title: string; slug: string; sortOrder?: number };
export type UpdateSectionBody = Partial<CreateSectionBody>;

export type CreateCategoryBody = { label: string; note?: string | null; sortOrder?: number };
export type UpdateCategoryBody = Partial<CreateCategoryBody>;

export type CreateItemBody = {
  name: string;
  description?: string | null;
  price: string;
  tags?: string[];
  featured?: boolean;
  featuredBadge?: string | null;
  active?: boolean;
  sortOrder?: number;
  categoryId?: number;
};
export type UpdateItemBody = Partial<CreateItemBody>;
