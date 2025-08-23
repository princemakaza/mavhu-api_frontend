import axios from "axios";

const BASE_URL =
  "/api/v1/community_service";

/**
 * Service for handling community service (chat group) API requests
 */
const ChatService = {
  /**
   * Fetches all chat groups from the backend
   * @returns {Promise} Promise containing group data
   */
  getAllChatGroups: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve groups";
    }
  },

  /**
   * Create a new group
   * @param {Object} GroupData - Data to create group
   * @returns {Promise} Promise with created group data
   */
  createGroup: async (GroupData) => {
    console.log(GroupData);
    try {
      const response = await axios.post(
        `${BASE_URL}/create`,
        JSON.stringify(GroupData),
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create group";
    }
  },

  /**
   * Create a new message in a group
   * @param {string} groupId - ID of the group to post message to
   * @param {Object} messageData - Message content and metadata
   * @returns {Promise} Promise with created message data
   */
  createMessage: async (groupId, messageData) => {
    try {
      // Fixed URL - removed duplicate BASE_URL and quotes
      const response = await axios.post(
        `${BASE_URL}/message_community_route/create/${groupId}/messages`,
        messageData, // No need to stringify, axios handles this
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Create message error:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get a specific chat group by ID
   * @param {string} id - Group ID
   * @returns {Promise} Promise with group data
   */
  getChatById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/getchat/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve group";
    }
  },

  /**
   * Exit a group
   * @param {string} id - Group ID to exit
   * @returns {Promise} Promise with operation result
   */
  exitGroup: async (id) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${id}`,
        {}, // No data required for exiting
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to exit group";
    }
  },

  /**
   * Delete a group
   * @param {string} id - Group ID to delete
   * @returns {Promise} Promise with deletion result
   */
  deletegroup: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete group";
    }
  },

  /**
   * Update a group
   * @param {string} id - Group ID to update
   * @param {Object} updatedData - Updated group data
   * @returns {Promise} Promise with updated group result
   */
  updateGroup: async (id, updatedData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${id}`,
        JSON.stringify(updatedData),
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update group";
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

export default ChatService;
