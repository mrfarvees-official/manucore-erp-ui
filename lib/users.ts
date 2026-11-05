export type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  active: boolean;
};

export type UserPage = {
  items: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
