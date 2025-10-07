import axios from "axios";

const BASE_URL =
  "http://13.61.185.238:4071/api/v1/library_book";

/**
 * Service for handling library book-related API requests
 */
const LibraryService = {
  /**
   * Fetches all books from the backend
   * @returns {Promise} Promise containing book data
   */
  getAllBooks: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get all books error:", error);
      throw error.response?.data || "Failed to retrieve books";
    }
  },

  /**
   * Get a specific book by ID
   * @param {string} id - book ID
   * @returns {Promise} Promise with book data
   */
  getBookById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/getbook/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get book by ID error:", error);
      throw error.response?.data || "Failed to retrieve book";
    }
  },

  /**
   * Get books by subject ID
   * @param {string} subjectId - Subject ID to filter books
   * @returns {Promise} Promise with filtered book data
   */
  getBooksBySubjectId: async (subjectId) => {
    try {
      const response = await axios.get(`${BASE_URL}/subject/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get books by subject ID error:", error);
      throw error.response?.data || "Failed to retrieve books by subject";
    }
  },

  /**
   * Create a new book
   * @param {Object} BookData - Data to create book
   * @returns {Promise} Promise with created book data
   */
  createBook: async (BookData) => {
    console.log("Creating book with data:", BookData);
    try {
      const response = await axios.post(
        `${BASE_URL}/create`,
        BookData, // Don't stringify - axios will handle this
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Create book error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      // Return more detailed error information
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { message: error.message, success: false };
      } else {
        throw { message: "Failed to create book", success: false };
      }
    }
  },

  /**
   * Delete a book
   * @param {string} id - Book ID to delete
   * @returns {Promise} Promise with deletion result
   */
  deleteBook: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Delete book error:", error);
      throw error.response?.data || "Failed to delete book";
    }
  },
};

/**
 * Helper function to get authentication token from local storage
 * @returns {string} Authentication token
 */
const getAuthToken = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    console.warn("No admin token found in localStorage");
  }
  return token;
};

export default LibraryService;
