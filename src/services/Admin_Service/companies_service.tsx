import api from "./Auth_service/api";

/**
 * =====================
 * Types & Interfaces
 * =====================
 */

export interface Coordinate {
    lat: number;
    lon: number;
    _id?: string;
}

export interface AreaOfInterestMetadata {
    name: string;
    area_covered: string;
    coordinates: Coordinate[];
}

export interface EsgContactPerson {
    name: string;
    email: string;
    phone: string;
}

export interface Company {
    _id: string;
    name: string;
    registrationNumber: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
    country: string;
    industry: string;
    description?: string;
    purpose?: string;
    scope?: string;
    data_source?: string[]; // Made optional
    area_of_interest_metadata?: AreaOfInterestMetadata;
    data_range?: string;
    data_processing_workflow?: string;
    analytical_layer_metadata?: string;
    esg_reporting_framework?: string[]; // Made optional
    esg_contact_person?: EsgContactPerson;
    latest_esg_report_year?: number;
    esg_data_status?: "not_collected" | "partial" | "complete";
    has_esg_linked_pay?: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * =====================
 * Request Payloads
 * =====================
 */

export type CreateCompanyPayload = Omit<Company, "_id" | "created_at" | "updated_at">

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>

/**
 * =====================
 * Response Types
 * =====================
 */

export interface PaginatedCompaniesResponse {
    items: Company[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface CompanyResponse {
    company: Company;
}

export interface CreateCompanyResponse {
    message: string;
    company: Company;
}

export interface UpdateCompanyResponse {
    message: string;
    company: Company;
}

export interface DeleteCompanyResponse {
    message: string;
}

/**
 * Error type for better type safety
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

/**
 * Type guard for API errors
 */
const isApiError = (error: unknown): error is ApiError => {
    return typeof error === 'object' && error !== null;
};

/**
 * =====================
 * Companies Service
 * =====================
 */

/**
 * Get all companies (Admin)
 */
export const getCompanies = async (
    page = 1,
    limit = 20
): Promise<PaginatedCompaniesResponse> => {
    try {
        const { data } = await api.get<PaginatedCompaniesResponse>(
            `/companies/admin?page=${page}&limit=${limit}`
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to fetch companies"
            );
        }
        throw new Error("Failed to fetch companies");
    }
};

/**
 * Get company by ID (Admin)
 */
export const getCompanyById = async (
    companyId: string
): Promise<CompanyResponse> => {
    try {
        const { data } = await api.get<CompanyResponse>(
            `/companies/admin/${companyId}`
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to fetch company"
            );
        }
        throw new Error("Failed to fetch company");
    }
};




export const getCompanyByIdMe = async (
    companyId: string
): Promise<CompanyResponse> => {
    try {
        const { data } = await api.get<CompanyResponse>(
            `/companies/me`
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to fetch company"
            );
        }
        throw new Error("Failed to fetch company");
    }
};

/**
 * Create company (Admin)
 */
export const createCompany = async (
    payload: CreateCompanyPayload
): Promise<CreateCompanyResponse> => {
    try {
        const { data } = await api.post<CreateCompanyResponse>(
            `/companies/admin/register`,
            payload
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const code = error.response?.data?.code;
            const errorMessage = error.response?.data?.error;

            // Handle MongoDB duplicate key errors
            if (code === 11000) {
                if (errorMessage?.includes("registrationNumber")) {
                    throw new Error("Registration number already exists");
                }
                if (errorMessage?.includes("email")) {
                    throw new Error("Email already in use");
                }
                if (errorMessage?.includes("phone")) {
                    throw new Error("Phone number already in use");
                }
            }

            throw new Error(
                errorMessage ||
                error.response?.data?.message ||
                "Company registration failed"
            );
        }
        throw new Error("Company registration failed");
    }
};

/**
 * Update company (Admin)
 */
export const updateCompany = async (
    companyId: string,
    payload: UpdateCompanyPayload
): Promise<UpdateCompanyResponse> => {
    try {
        const { data } = await api.patch<UpdateCompanyResponse>(
            `/companies/admin/${companyId}`,
            payload
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to update company"
            );
        }
        throw new Error("Failed to update company");
    }
};

/**
 * Delete company (Admin)
 */
export const deleteCompany = async (
    companyId: string
): Promise<DeleteCompanyResponse> => {
    try {
        const { data } = await api.delete<DeleteCompanyResponse>(
            `/companies/admin/${companyId}`
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to delete company"
            );
        }
        throw new Error("Failed to delete company");
    }
};