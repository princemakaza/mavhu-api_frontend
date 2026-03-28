import api from "./Auth_service/api";

/**
 * =====================
 * Types & Interfaces
 * =====================
 */

export interface Permission {
    _id: string;
    // company can be either a string ID or a populated object (as seen in GET/PATCH responses)
    company: string | { _id: string; name: string; registrationNumber: string; email: string };
    soilHealthCarbon: boolean;
    cropYieldForecastRisk: boolean;
    ghgEmissions: boolean;
    biodiversityLandUse: boolean;
    irrigationWater: boolean;
    farmManagementCompliance: boolean;
    energyConsumptionRenewables: boolean;
    wasteManagement: boolean;
    workforceDiversity: boolean;
    healthSafety: boolean;
    governanceBoardMetrics: boolean;
    communityEngagement: boolean;
    overallESGScore: boolean;
    // createdBy and updatedBy can be string IDs or populated user objects
    createdBy: string | { _id: string; email: string; full_name: string };
    updatedBy: string | { _id: string; email: string; full_name: string };
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

/**
 * Payload for creating permissions.
 * Only the boolean flags are required; company ID is passed as a URL parameter.
 */
export type CreatePermissionPayload = {
    soilHealthCarbon: boolean;
    cropYieldForecastRisk: boolean;
    ghgEmissions: boolean;
    biodiversityLandUse: boolean;
    irrigationWater: boolean;
    farmManagementCompliance: boolean;
    energyConsumptionRenewables: boolean;
    wasteManagement: boolean;
    workforceDiversity: boolean;
    healthSafety: boolean;
    governanceBoardMetrics: boolean;
    communityEngagement: boolean;
    overallESGScore: boolean;
};

/**
 * Payload for updating permissions.
 * All fields are optional, allowing partial updates.
 */
export type UpdatePermissionPayload = Partial<CreatePermissionPayload>;

/**
 * =====================
 * Response Types
 * =====================
 */

export interface PermissionResponse {
    permissions: Permission;
}

export interface CreatePermissionResponse {
    message: string;
    permissions: Permission;
}

export interface UpdatePermissionResponse {
    message: string;
    permissions: Permission;
}

export interface DeletePermissionResponse {
    message: string;
}

/**
 * =====================
 * Error Handling Utilities
 * =====================
 */

interface ApiError {
    response?: {
        data?: {
            error?: string;
            message?: string;
            code?: number;
        };
    };
    message?: string;
}

const isApiError = (error: unknown): error is ApiError => {
    return typeof error === 'object' && error !== null;
};

/**
 * =====================
 * Permissions Service Functions
 * =====================
 */

/**
 * Create permissions for a specific company.
 * POST /permissions/company/{companyId}
 */
export const createCompanyPermission = async (
    companyId: string,
    payload: CreatePermissionPayload
): Promise<CreatePermissionResponse> => {
    try {
        const { data } = await api.post<CreatePermissionResponse>(
            `/permissions/company/${companyId}`,
            payload
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to create permissions"
            );
        }
        throw new Error("Failed to create permissions");
    }
};

/**
 * Get permissions for a specific company.
 * GET /permissions/company/{companyId}
 */
export const getCompanyPermission = async (
    companyId: string
): Promise<PermissionResponse> => {
    try {
        const { data } = await api.get<PermissionResponse>(
            `/permissions/company/${companyId}`
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to fetch permissions"
            );
        }
        throw new Error("Failed to fetch permissions");
    }
};

/**
 * Update permissions for a specific company.
 * PATCH /permissions/company/{companyId}
 */
export const updateCompanyPermission = async (
    companyId: string,
    payload: UpdatePermissionPayload
): Promise<UpdatePermissionResponse> => {
    try {
        const { data } = await api.patch<UpdatePermissionResponse>(
            `/permissions/company/${companyId}`,
            payload
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to update permissions"
            );
        }
        throw new Error("Failed to update permissions");
    }
};

/**
 * Delete permissions for a specific company.
 * DELETE /permissions/company/{companyId}
 */
export const deleteCompanyPermission = async (
    companyId: string
): Promise<DeletePermissionResponse> => {
    try {
        const { data } = await api.delete<DeletePermissionResponse>(
            `/permissions/company/${companyId}`
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to delete permissions"
            );
        }
        throw new Error("Failed to delete permissions");
    }
};