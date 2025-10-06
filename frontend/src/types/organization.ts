export type OrganizationKind = "client" | "vendor" | "internal";

export type Organization = {
  id: string;
  name: string;
  kind: OrganizationKind;
  industry: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationCreateInput = {
  name: string;
  kind: OrganizationKind;
  industry: string;
  isActive?: boolean;
};

export type OrganizationUpdateInput = {
  id: string;
  name?: string;
  kind?: OrganizationKind;
  industry?: string;
  isActive?: boolean;
};

export type OrganizationIdInput = {
  id: string;
};
