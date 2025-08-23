import axios from "axios";

const BASE_URL = "/api/v1/admin_route";

const SignUpAdmin = async (userData) => {
  try {
    console.log("Sending JSON data to API");

    // For JSON data, we use application/json content type
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Make the API call with JSON data
    const response = await axios.post(`${BASE_URL}/signup`, userData, config);

    // Extract the token from the response
    console.log("API Response:", response.data);
    console.log("Admin signup token:", response.data.token);

    // Store the token if it exists
    if (response.data.token) {
      localStorage.setItem("adminToken", response.data.token);
      console.log("Token stored successfully!");
    } else {
      console.warn("No token received during signup");
    }

    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error("Error signing up admin:", error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);

      // Throw a more specific error message if available
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `Server error: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
      throw new Error("Network error: No response from server");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
      throw new Error(error.message);
    }
  }
};

export default SignUpAdmin;
