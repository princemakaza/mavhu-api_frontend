import api from "./Auth_service/api";

/**
 * =====================
 * Types & Interfaces
 * =====================
 */

export interface Member {
    _id: string;
    company: string; // Company ID
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    role: string; // e.g., "member", "admin"
    department: string;
    phone: string;
    status: "active" | "inactive";
    joinedAt: string; // ISO date
    __v?: number;
    // password_hash is returned only on creation, not included here
}

/**
 * =====================
 * Request Payloads
 * =====================
 */

export type CreateMemberPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    title: string;
    role: string;
    department: string;
    phone: string;
    companyId: string;
};

export type UpdateMemberPayload = Partial<{
    firstName: string;
    lastName: string;
    title: string;
    role: string;
    department: string;
    phone: string;
    status: "active" | "inactive";
}>;

/**
 * =====================
 * Response Types
 * =====================
 */

export interface PaginatedMembersResponse {
    items: Member[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface MemberResponse {
    member: Member;
}

export interface CreateMemberResponse {
    message: string;
    member: Member & { password_hash?: string }; // password_hash may be present in creation response
}

export interface UpdateMemberResponse {
    message: string;
    member: Member;
}

export interface DeactivateMemberResponse {
    message: string;
    member: Member;
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
 * Members Service
 * =====================
 */

/**
 * Get members for a company (paginated)
 */
export const getMembers = async (
    companyId: string,
    page = 1,
    limit = 20
): Promise<PaginatedMembersResponse> => {
    try {
        const { data } = await api.get<PaginatedMembersResponse>(
            `/members?companyId=${companyId}&page=${page}&limit=${limit}`
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to fetch members"
            );
        }
        throw new Error("Failed to fetch members");
    }
};

/**
 * Get a single member by ID (if endpoint exists)
 * Note: Not explicitly shown in examples, but common pattern
 */
export const getMemberById = async (memberId: string): Promise<MemberResponse> => {
    try {
        const { data } = await api.get<MemberResponse>(`/members/${memberId}`);
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to fetch member"
            );
        }
        throw new Error("Failed to fetch member");
    }
};

/**
 * Create a new member (admin/owner only)
 */
export const createMember = async (
    payload: CreateMemberPayload
): Promise<CreateMemberResponse> => {
    try {
        const { data } = await api.post<CreateMemberResponse>(
            `/members/admin`,
            payload
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            const code = error.response?.data?.code;
            const errorMessage = error.response?.data?.error;

            // Handle MongoDB duplicate key errors (e.g., duplicate email)
            if (code === 11000) {
                if (errorMessage?.includes("email")) {
                    throw new Error("Email already in use");
                }
            }

            throw new Error(
                errorMessage ||
                error.response?.data?.message ||
                "Failed to create member"
            );
        }
        throw new Error("Failed to create member");
    }
};

/**
 * Update an existing member
 */
export const updateMember = async (
    memberId: string,
    payload: UpdateMemberPayload
): Promise<UpdateMemberResponse> => {
    try {
        const { data } = await api.patch<UpdateMemberResponse>(
            `/members/${memberId}`,
            payload
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to update member"
            );
        }
        throw new Error("Failed to update member");
    }
};

/**
 * Deactivate a member (sets status to inactive)
 */
export const deactivateMember = async (
    memberId: string
): Promise<DeactivateMemberResponse> => {
    try {
        const { data } = await api.post<DeactivateMemberResponse>(
            `/members/${memberId}/deactivate`,
            {} // Empty body as shown in example
        );
        return data;
    } catch (error: unknown) {
        if (isApiError(error)) {
            throw new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                "Failed to deactivate member"
            );
        }
        throw new Error("Failed to deactivate member");
    }
};