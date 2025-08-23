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
   * Get admin dashboard data
   * @returns {Promise} Promise containing dashboard data
   */
  getAdminDashboard: async () => {
    try {
      const response = await axios.get(`/api/v1/dashboards/dashboard`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve dashboard data";
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