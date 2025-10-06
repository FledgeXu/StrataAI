import { apiClient, unwrap } from "./client";
import { ApiError, type ApiEnvelope } from "./types";

export type OrganizationKind = "client" | "vendor" | "internal";

export type Organization = {
  id: string;
  name: string;
  kind: OrganizationKind;
  industry: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export const fetchOrganization = async (id: string): Promise<Organization> =>
  unwrap<Organization>(
    apiClient.get<ApiEnvelope<Organization>>(`/organizations/${id}`),
  );

export const createOrganization = async (
  input: OrganizationCreateInput,
): Promise<Organization> =>
  unwrap<Organization>(
    apiClient.post<ApiEnvelope<Organization>>(`/organizations`, input),
  );

export const updateOrganization = async (
  input: OrganizationUpdateInput,
): Promise<Organization> => {
  const { id, ...payload } = input;
  const hasChanges = Object.values(payload).some(
    (value) => value !== undefined,
  );

  if (!hasChanges) {
    throw new ApiError(
      "At least one field is required to update an organization.",
      400,
    );
  }

  return unwrap<Organization>(
    apiClient.patch<ApiEnvelope<Organization>>(`/organizations/${id}`, payload),
  );
};

export const activateOrganization = async (
  input: OrganizationIdInput,
): Promise<Organization> =>
  unwrap<Organization>(
    apiClient.post<ApiEnvelope<Organization>>(
      `/organizations/${input.id}/activate`,
      {},
    ),
  );

export const deactivateOrganization = async (
  input: OrganizationIdInput,
): Promise<Organization> =>
  unwrap<Organization>(
    apiClient.post<ApiEnvelope<Organization>>(
      `/organizations/${input.id}/deactivate`,
      {},
    ),
  );

export const organizationApi = {
  fetch: fetchOrganization,
  create: createOrganization,
  update: updateOrganization,
  activate: activateOrganization,
  deactivate: deactivateOrganization,
};
