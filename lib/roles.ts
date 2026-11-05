export type Role = {
  id: string;
  name: string;
  description: string | null;
  system: boolean;
  userCount: number;
};

export type RoleOption = {
  name: string;
  description: string | null;
};
