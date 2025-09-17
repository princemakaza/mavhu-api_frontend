import axios from "axios";

const BASE_URL = "/api/v1/admin_student_chat";

/**
 * Service for handling help desk chat-related API requests
 */
const HelpDeskService = {
  /**
   * Sends a new chat message
   * @param {Object} messageData - Data for the new message
   * @returns {Promise} Promise containing the sent message data
   */
  sendMessage: async (messageData) => {
    try {
      const response = await axios.post(`${BASE_URL}/send`, messageData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to send message";
    }
  },

  /**
   * Gets conversation between a student and an admin
   * @param {string} studentId - ID of the student
   * @param {string} adminId - ID of the admin
   * @returns {Promise} Promise containing the conversation data
   */
  getConversation: async (studentId, adminId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/conversation/${studentId}/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve conversation";
    }
  },

  /**
   * Gets all conversations for an admin (grouped by student)
   * @param {string} adminId - ID of the admin
   * @returns {Promise} Promise containing admin conversations
   */
  getAdminConversations: async (adminId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/admin-conversations/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve admin conversations";
    }
  },

  /**
   * Gets all conversations for a student (grouped by admin)
   * @param {string} studentId - ID of the student
   * @returns {Promise} Promise containing student conversations
   */
  getStudentConversations: async (studentId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/student-conversations/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve student conversations";
    }
  },

  /**
   * Marks messages as viewed between a student and admin
   * @param {string} studentId - ID of the student
   * @param {string} adminId - ID of the admin
   * @returns {Promise} Promise containing the update result
   */
  markMessagesAsViewed: async (studentId, adminId) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/mark-viewed/${studentId}/${adminId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to mark messages as viewed";
    }
  },

  /**
   * Deletes a whole conversation between a student and admin
   * @param {string} studentId - ID of the student
   * @param {string} adminId - ID of the admin
   * @returns {Promise} Promise containing the deletion result
   */
  deleteConversation: async (studentId, adminId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/conversation/${studentId}/${adminId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete conversation";
    }
  },

  /**
   * Deletes a single message by ID
   * @param {string} messageId - ID of the message to delete
   * @returns {Promise} Promise containing the deletion result
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/message/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete message";
    }
  },
};

/**
 * Helper function to get authentication token from local storage
 * @returns {string} Authentication token
 */
const getAuthToken = () => {
  // You might want to check if we're in a browser environment
  if (typeof window !== "undefined") {
    return localStorage.getItem("adminToken");
  }
  return null;
};

export default HelpDeskService;