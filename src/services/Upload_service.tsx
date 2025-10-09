// Upload_service.js
import axios from "axios";

const BASE_URL =
  "/api/v1/library_book";

/**
 * Service for handling file upload and update operations
 */
const UploadService = {
  /**
   * Upload a new book
   * @param {FormData} formData - Form data containing file and book info
   * @returns {Promise} Promise with upload result
   */
  // Upload_service.tsx
uploadBook: async (bookData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found. Please login again.");
    }

    console.log("Request payload:", bookData);

    const response = await axios.post(`${BASE_URL}/create`, bookData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error: any) {
    console.error("Full error object:", error);
    if (error.isAxiosError) {
      const serverMessage = error.response?.data?.message || "Server error";
      const validationErrors = error.response?.data?.error || "Validation failed";

      throw {
        message: serverMessage,
        error: validationErrors,
        details: error.response?.data,
        status: error.response?.status,
      };
    }
    throw {
      message: "Upload failed",
      error: error.message,
      details: error.stack,
    };
  }
}
,
  /**
   * Update an existing book
   * @param {string} id - Book ID to update
   * @param {FormData} formData - Form data containing updated book info
   * @returns {Promise} Promise with update result
   */
  updateBook: async (id, formData) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await axios.put(`${BASE_URL}/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout for file uploads
      });

      return response.data;
    } catch (error) {
      console.error("Update service error:", error);

      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please login again.");
      }

      if (error.response?.status === 404) {
        throw new Error("Book not found.");
      }

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        throw {
          message: errorData.message || "Bad request",
          error: errorData.error || "Invalid data provided",
        };
      }

      throw (
        error.response?.data || {
          message: "Failed to update book",
          error: error.message || "Network error occurred",
        }
      );
    }
  },
};

/**
 * Helper function to get authentication token from local storage
 * @returns {string|null} Authentication token
 */
const getAuthToken = () => {
  try {
    const token = localStorage.getItem("adminToken");
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export default UploadService;
