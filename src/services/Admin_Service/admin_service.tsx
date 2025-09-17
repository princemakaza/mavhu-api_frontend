import axios from "axios";
const BASE_URL = "/api/v1/admin_route";

/**
 * Service for handling admin-related API requests
 */
const AdminService = {
  /**
   * Fetches all admins from the backend
   * @returns {Promise} Promise containing admin data
   */
  getAllAdmins: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getalladmins`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve admins";
    }
  },

  /**
   * Get a specific admin by ID
   * @param {string} id - Admin ID
   * @returns {Promise} Promise with admin data
   */
  getAdminById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/admins/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve admin";
    }
  },

  /**
   * Get a specific admin by email
   * @param {string} email - Admin email
   * @returns {Promise} Promise with admin data
   */
  getAdminByEmail: async (email) => {
    try {
      const response = await axios.get(`${BASE_URL}/getadmin/${email}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve admin";
    }
  },

  /**
   * Delete an admin by ID
   * @param {string} id - Admin ID
   * @returns {Promise} Promise with success message
   */
  deleteAdminById: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/deleteadmin/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete admin";
    }
  },

  /**
   * Get admin dashboard data
   * @returns {Promise} Promise containing dashboard data
   */
  getAdminDashboard: async () => {
    try {
      const response = await axios.get(
        `/api/v1/dashboards/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve dashboard data";
    }
  },

  /**
   * Get wallet dashboard data
   * @returns {Promise} Promise containing wallet analytics data
   */
  getWalletDashboard: async () => {
    try {
      const response = await axios.get(
        `/api/v1/dashboards/wallet-analytics`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve wallet dashboard data";
    }
  },

  /**
   * Get student activities for a specific student ID
   * @param {string} studentId - The ID of the student
   * @returns {Promise} Promise containing student activities data
   */
  getStudentActivities: async (studentId) => {
    try {
      const config = {
        method: "get",
        url: `/api/v1/dashboards/student-activities/${studentId}`,
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      };
      const response = await axios.request(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      } else if (error.request) {
        throw "Network error: No response from server";
      } else {
        throw error.message || "Failed to retrieve student activities";
      }
    }
  },
};

/**
 * Helper function to get authentication token from local storage
 * @returns {string} Authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem("adminToken");
};

export default AdminService;