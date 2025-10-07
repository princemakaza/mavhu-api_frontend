import axios from "axios";

const BASE_URL =
  "http://13.61.185.238:4071/api/v1/message_community_route";

/**
 * Service for handling community message-related API requests
 */
const CommunityMessageService = {
  /**
   * Create a new community message
   * @param {string} communityId - Community ID
   * @param {Object} messageData - Message payload
   * @returns {Promise} Promise containing response data
   */
  createMessage: async (communityId, messageData) => {
    try {
      const payload = {
        community: communityId,
        sender: messageData.sender, // This maps to 'sender' field in your schema
        message: messageData.message, // This maps to 'message' field in your schema
        // imagePath: messageData.imagePath || [] // Add if you need image support
      };

      console.log("Payload being sent to backend:", payload);

      const response = await axios.post(
        `${BASE_URL}/create`,
        payload, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Create message error:", error);
      throw error;
    }
  },

  /**
   * Get all messages for a specific community
   * @param {string} communityId - Community ID
   * @returns {Promise} Promise containing message list
   */
  getMessagesByCommunity: async (communityId) => {
    try {
      const response = await axios.get(`${BASE_URL}/community/${communityId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve messages";
    }
  },

  /**
   * Get a specific message by ID
   * @param {string} id - Message ID
   * @returns {Promise} Promise with message data
   */
  getMessageById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/get/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve message";
    }
  },

  /**
   * Update a message by ID
   * @param {string} id - Message ID
   * @param {Object} updatedData - Data to update
   * @returns {Promise} Promise with updated message
   */
  updateMessage: async (id, updatedData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update message";
    }
  },

  /**
   * Delete a message by ID
   * @param {string} id - Message ID
   * @returns {Promise} Promise confirming deletion
   */
  deleteMessage: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete message";
    }
  },

  /**
   * Get messages by sender ID
   * @param {string} senderId - Sender ID
   * @returns {Promise} Promise containing message list
   */
  getMessagesBySender: async (senderId) => {
    try {
      const response = await axios.get(`${BASE_URL}/sender/${senderId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve sender messages";
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

export default CommunityMessageService;
