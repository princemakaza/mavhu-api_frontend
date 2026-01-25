import api from "./api";

/**
 * =====================
 * Types & Interfaces
 * =====================
 */

export interface RegisterPayload {
    full_name: string;
    email: string;
    phone: string;
    password: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface User {
    _id: string;
    full_name: string;
    email: string;
    phone: string;
    status: "pending" | "active";
    email_verified: boolean;
    created_at?: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    user: User;
}

export interface VerifyOtpResponse {
    success: boolean;
    message: string;
    user: User;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
}

/**
 * =====================
 * Auth Service Methods
 * =====================
 */

export const registerUser = async (
    payload: RegisterPayload
): Promise<RegisterResponse> => {
    try {
        const { data } = await api.post<RegisterResponse>(
            "/users/register",
            payload
        );
        return data;
    } catch (error: any) {
        const errorMessage = error.response?.data?.error;
        const code = error.response?.data?.code;

        // Handle duplicate phone (MongoDB duplicate key error)
        if (code === 11000 && errorMessage.includes('phone_1')) {
            throw new Error("Phone number already in use");
        }
        // Handle duplicate email (which might not have code 11000)
        if (errorMessage && errorMessage.toLowerCase().includes('email already in use')) {
            throw new Error("Email already in use");
        }
        // For other errors
        throw new Error(errorMessage || error.response?.data?.message || "Registration failed");
    }
};

export const verifyEmailOtp = async (
    payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
    const { data } = await api.post<VerifyOtpResponse>(
        "/users/verify-email-otp",
        payload
    );
    return data;
};

export const loginUser = async (
    payload: LoginPayload
): Promise<LoginResponse> => {
    try {
        const { data } = await api.post<LoginResponse>(
            "/users/login",
            payload
        );

        if (data.token) {
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("userData", JSON.stringify(data.user));
            localStorage.setItem("userId", data.user._id);
        }

        return data;
    } catch (error: any) {
        // If we get a 401, the error response has the structure above
        if (error.response?.status === 401) {
            throw new Error(error.response?.data?.error || "Invalid email or password");
        }
        // For any other error, throw the error message from the server or a generic one
        throw new Error(error.response?.data?.error || error.response?.data?.message || "Login failed");
    }
};

export const logoutUser = () => {
    localStorage.clear();
};