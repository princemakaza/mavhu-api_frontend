import api from "./api";

export interface MemberLoginPayload {
    email: string;
    password: string;
}

export interface Member {
    _id: string;
    company: string;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    role: string;
    department?: string;
    phone?: string;
    status?: string;
    joinedAt?: string;
    __v?: number;
}

export interface MemberLoginResponse {
    message: string;
    token: string;
    member: Member;
}

/**
 * Logs in a member and stores authentication data in localStorage.
 * 
 * On success:
 * - authToken        -> token
 * - userData         -> member object (stringified)
 * - userId           -> member._id
 * - companyId        -> member.company
 * - loggedInCustomer -> "true"
 */
export const loginMember = async (
    payload: MemberLoginPayload
): Promise<MemberLoginResponse> => {
    try {
        const { data } = await api.post<MemberLoginResponse>(
            "/members/login",      // adjust endpoint if needed (e.g., "/login")
            payload
        );

        if (data.token) {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userData", JSON.stringify(data.member));
            localStorage.setItem("userId", data.member._id);
            localStorage.setItem("companyId", data.member.company); // <-- added
            localStorage.setItem("loggedInCustomer", "true");
        }

        return data;
    } catch (error: any) {
        // Handle 401 Unauthorized (invalid credentials)
        if (error.response?.status === 401) {
            throw new Error(error.response?.data?.error || "Invalid email or password");
        }
        // For any other error, throw the error message from the server or a generic one
        throw new Error(
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Login failed"
        );
    }
};