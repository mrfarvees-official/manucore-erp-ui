export type Subject = {
  type: "USER" | "ROLE" | "DEPARTMENT" | "SERVICE";
  id: string;
};

export type Condition = {
  attribute: string;
  operator: string;
  value: string | null;
};

export type ConditionGroup = {
  operator: string;
  conditions: Condition[];
  groups: ConditionGroup[];
};

export type Policy = {
  id: string;
  name: string;
  description: string;
  action: string;
  resource: string;
  effect: "ALLOW" | "DENY";
  priority: "LOW" | "MODERATE" | "MEDIUM" | "HIGH" | "CRITICAL";
  subjects: Subject[];
  conditionGroups: ConditionGroup[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type PolicyPage = {
  items: Policy[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type Catalog = {
  actions: string[];
  resources: string[];
  effects: string[];
  priorities: string[];
  subjectTypes: string[];
  conditionAttributes: string[];
  conditionOperators: string[];
  logicalOperators: string[];
};
