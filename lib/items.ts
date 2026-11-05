export const ITEM_TYPES = [
  "RAW_MATERIAL",
  "COMPONENT",
  "FINISHED_GOOD",
  "PACKAGING",
  "CONSUMABLE",
] as const;

export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  RAW_MATERIAL: "Raw material",
  COMPONENT: "Component",
  FINISHED_GOOD: "Finished good",
  PACKAGING: "Packaging",
  CONSUMABLE: "Consumable",
};

export type Item = {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  category: string | null;
  type: ItemType | null;
  description: string | null;
  reorderLevel: number | null;
  active: boolean;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ItemPage = {
  items: Item[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CatalogSummary = {
  activeItems: number;
  lowStock: number;
  outOfStock: number;
  categories: string[];
};

export type Adjustment = {
  id: string;
  itemId: string;
  sku: string;
  itemName: string;
  delta: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string | null;
  actorId: string | null;
  createdAt: string;
};

export type AdjustmentPage = {
  items: Adjustment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};