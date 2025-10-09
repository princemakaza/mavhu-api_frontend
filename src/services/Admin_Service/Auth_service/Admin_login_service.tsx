import axios from "axios";

const BASE_URL = "/api/v1/admin_route";

const loginAdmin = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, userData);

    // Extract the token from the response
    console.log(" my  to token", response.data.token);

    // Store the token using the TokenStorageService
    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminData", JSON.stringify(response.data.admin)); // 👈 store role & info
      localStorage.setItem("adminId", response.data.admin._id);               // convenience ID
      console.log("Token stored successfully!");
    }
    // Store the token using the TokenStorageService
    if (!response.data.token) {
      alert("Error storing token!");
    }

    return response.data;
  } catch (error) {
    console.error("Error login user:", error.response?.data || error.message);
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