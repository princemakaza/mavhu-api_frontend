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

export default loginAdmin;
