import type { OrganizationKind } from "@lib/types";

export const COLLECTION_TAG = "yellow-books";
export const CATEGORY_TAG = "yellow-books:categories";

export type FilterState = {
  search?: string;
  categorySlug?: string;
  organizationType?: OrganizationKind;
  tag?: string;
};

export const ORGANIZATION_LABELS: Record<OrganizationKind, string> = {
  BUSINESS: "Business",
  GOVERNMENT: "Government",
  MUNICIPAL: "Municipal",
  NGO: "NGO",
  SERVICE: "Service",
};

export function normalizeFilters(params: Record<string, string | string[] | undefined>): FilterState {
  const filters: FilterState = {};

  const extract = (key: string) => {
    const value = params[key];
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  };

  const search = extract("search");
  const category = extract("category");
  const organizationType = extract("organizationType");
  const tag = extract("tag");

  if (typeof search === "string") {
    const sanitized = search.trim();
    if (sanitized) {
      filters.search = sanitized;
    }
  }

  if (typeof category === "string" && category !== "all") {
    filters.categorySlug = category;
  }

  if (typeof tag === "string" && tag) {
    filters.tag = tag;
  }

  if (typeof organizationType === "string" && organizationType in ORGANIZATION_LABELS) {
    filters.organizationType = organizationType as OrganizationKind;
  }

  return filters;
}

export function createHref(current: FilterState, overrides: Partial<FilterState>): string {
  const merged: FilterState = { ...current, ...overrides };
  const params = new URLSearchParams();

  if (merged.search) {
    params.set("search", merged.search);
  }
  if (merged.categorySlug) {
    params.set("category", merged.categorySlug);
  }
  if (merged.organizationType) {
    params.set("organizationType", merged.organizationType);
  }
  if (merged.tag) {
    params.set("tag", merged.tag);
  }

  const query = params.toString();
  return query ? `/yellow-books?${query}` : "/yellow-books";
}
