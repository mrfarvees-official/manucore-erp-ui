export type Item = {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
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
