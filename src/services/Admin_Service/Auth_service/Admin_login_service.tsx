import axios from "axios";

const BASE_URL = "/api/v1/admin_route";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Admin {
  _id: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  email: string;
  contactNumber?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: Admin;
}

/**
 * Logs an admin in and persists token/admin to localStorage.
 * Server response shape: { message, token, admin }
 */
const loginAdmin = async (userData: LoginPayload): Promise<LoginResponse> => {
  try {
    console.log("User data for login:", userData);

    // axios will JSON-serialize objects automatically
    const response = await axios.post<LoginResponse>(
      `${BASE_URL}/login`,
      userData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("API Response:", response.data);
    console.log("Admin token:", response.data.token);

    const { token, admin } = response.data;

    if (token) {
      localStorage.setItem("adminToken", token);
      console.log("Token stored successfully!");
    } else {
      console.warn("No token found in response.");
    }

    if (admin) {
      localStorage.setItem("adminData", JSON.stringify(admin));
      if (admin._id) localStorage.setItem("adminId", admin._id);
    } else {
      console.warn("No admin object found in response.");
    }

    return response.data;
  } catch (error: any) {
    console.error(
      "Error logging in admin:",
      error?.response?.data || error?.message || error
    );
    throw error;
  }
};
// Forgot password - Request OTP
const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${BASE_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error("Error requesting OTP:", error.response?.data || error.message);
    throw error;
  }
};

// Verify password reset OTP
const verifyResetOTP = async (email, otp) => {
  try {
    const response = await axios.post(`${BASE_URL}/verify-reset-otp`, { email, otp });
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error.response?.data || error.message);
    throw error;
  }
};

// Reset password
const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await axios.post(`${BASE_URL}/reset-password`, {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error.response?.data || error.message);
    throw error;
  }
};

export default loginAdmin;
export { forgotPassword, verifyResetOTP, resetPassword };