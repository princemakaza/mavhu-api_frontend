import axios from "axios";

const BASE_URL = "/api/v1/subject";

/**
 * Service for handling subject-related API requests
 */
const SubjectService = {
  /**
   * Fetches all subjects from the backend
   * @returns {Promise} Promise containing subject data
   */
  getAllSubjects: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve subjects";
    }
  },

  /**
   * Get a specific subject by ID
   * @param {string} id - Subject ID
   * @returns {Promise} Promise with subject data
   */
  getSubjectById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/getcourse/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve subject";
    }
  },

  /**
   * Create a new subject
   * @param {Object} subjectData - Subject data to create
   * @returns {Promise} Promise with created subject data
   */
  createSubject: async (subjectData) => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, subjectData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create subject";
    }
  },

  /**
   * Update an existing subject
   * @param {string} id - Subject ID to update
   * @param {Object} subjectData - Updated subject data
   * @returns {Promise} Promise with updated subject data
   */
  updateSubject: async (id, subjectData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${id}`,
        subjectData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update subject";
    }
  },

  /**
   * Delete a subject
   * @param {string} id - Subject ID to delete
   * @returns {Promise} Promise with deletion result
   */
  deleteSubject: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete subject";
    }
  },
};

/**
 * Helper function to get authentication token from local storage
 * @returns {string} Authentication token
 */
const getAuthToken = () => {
  console.log(localStorage.getItem("adminToken"));
  return localStorage.getItem("adminToken");
};

export default SubjectService;
