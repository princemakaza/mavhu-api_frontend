import axios from "axios";

const BASE_URL = "/api/v1/home_banners";

/**
 * Service for handling home banner-related API requests
 */
const HomeBannerService = {
  /**
   * Create a new home banner
   * @param {Object} bannerData - Data to create banner
   * @returns {Promise} Promise with created banner data
   */
  createHomeBanner: async (bannerData) => {
    console.log("Creating HomeBanner with data:", bannerData);
    try {
      const response = await axios.post(`${BASE_URL}/create`, bannerData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Create HomeBanner error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw { message: error.message, success: false };
      } else {
        throw { message: "Failed to create HomeBanner", success: false };
      }
    }
  },

  /**
   * Fetch all home banners
   * @returns {Promise} Promise containing banners data
   */
  getAllHomeBanners: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get all HomeBanners error:", error);
      throw error.response?.data || "Failed to retrieve HomeBanners";
    }
  },

  /**
   * Get a specific home banner by ID
   * @param {string} id - Banner ID
   * @returns {Promise} Promise with banner data
   */
  getHomeBannerById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/get/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get HomeBanner by ID error:", error);
      throw error.response?.data || "Failed to retrieve HomeBanner";
    }
  },

  /**
   * Update a home banner by ID
   * @param {string} id - Banner ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise} Promise with updated banner data
   */
  updateHomeBanner: async (id, updateData) => {
    try {
      const response = await axios.put(`${BASE_URL}/update/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Update HomeBanner error:", error);
      throw error.response?.data || "Failed to update HomeBanner";
    }
  },

  /**
   * Delete a home banner by ID
   * @param {string} id - Banner ID
   * @returns {Promise} Promise with deletion result
   */
  deleteHomeBanner: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Delete HomeBanner error:", error);
      throw error.response?.data || "Failed to delete HomeBanner";
    }
  },

  /**
   * Get home banners filtered by level
   * Example levels: "O Level", "A Level" (will be URL-encoded)
   * @param {string} level
   * @returns {Promise} Promise with filtered banners
   */
  getHomeBannersByLevel: async (level) => {
    try {
      const encoded = encodeURIComponent(level);
      const response = await axios.get(`${BASE_URL}/level/${encoded}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get HomeBanners by level error:", error);
      throw error.response?.data || "Failed to retrieve HomeBanners by level";
    }
  },

  /**
   * Set the showBanner flag for a banner
   * @param {string} id - Banner ID
   * @param {boolean} showBanner - Desired value
   * @returns {Promise} Promise with updated banner
   */
  setShowBanner: async (id, showBanner) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/show/${id}`,
        { showBanner },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Set showBanner error:", error);
      throw error.response?.data || "Failed to update showBanner";
    }
  },
};

/**
 * Helper to get authentication token from local storage
 * @returns {string} Authentication token
 */
const getAuthToken = () => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    console.warn("No admin token found in localStorage");
  }
  return token;
};

export default HomeBannerService;
