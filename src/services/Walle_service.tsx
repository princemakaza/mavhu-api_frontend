import axios from "axios";

// Make sure getAuthToken is imported or defined somewhere
// import { getAuthToken } from './auth'; // example

const BASE_URL = "/api/wallet";

/**
 * Service for handling wallet-related API requests
 */
const WalletService = {
  /**
   * Fetches wallet dashboard data from the backend
   * @returns {Promise} Promise containing wallet dashboard data
   */
  getDashboardData: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve wallet data";
    }
  },

  // You can add other wallet-related methods here as needed
  // For example:
  // makeDeposit: async (amount, description) => {...},
  // getTransactions: async () => {...},
  // etc.
};

const getAuthToken = () => {
  console.log(localStorage.getItem("adminToken"));
  return localStorage.getItem("adminToken");
};
export default WalletService;
