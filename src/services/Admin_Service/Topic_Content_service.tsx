import axios from "axios";

// Base URL for the TopicContent API
const BASE_URL = "/api/v1/topic_content";

/**
 * Service for handling topic content-related API requests
 */
const TopicContentService = {
  /**
   * Creates a new topic content
   * @param {Object} contentData - Data for the new topic content
   * @returns {Promise} Promise with created topic content data
   */
  createTopicContent: async (contentData: any) => {
    try {
      console.log("Creating topic content with data:", contentData);

      // Convert contentData to JSON string
      const jsonData = JSON.stringify(contentData);
      console.log("JSON data to be sent:", jsonData);
      const response = await axios.post(`${BASE_URL}/create`, jsonData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating topic content:", error);
      throw error.response?.data || "Failed to create topic content";
    }
  },

  /**
   * Fetches all topic contents
   * @returns {Promise} Promise containing topic content data
   */
  getAllTopicContents: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve topic contents";
    }
  },

  /**
   * Fetches a specific topic content by ID
   * @param {string} contentId - The ID of the topic content
   * @returns {Promise} Promise with topic content data
   */
  getTopicContentById: async (contentId: string) => {
    console.warn("contentId =======================================:", contentId);
    try {
      const response = await axios.get(`${BASE_URL}/${contentId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      console.warn("Fetched topic content:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve topic content";
    }
  },

  /**
   * Updates an existing topic content
   * @param {string} contentId - The ID of the topic content
   * @param {Object} contentData - Updated data for the topic content
   * @returns {Promise} Promise with updated topic content data
   */
  updateTopicContent: async (contentId: string, contentData: any) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${contentId}`,
        contentData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update topic content";
    }
  },

  /**
   * Deletes a topic content
   * @param {string} contentId - The ID of the topic content
   * @returns {Promise} Promise with deletion result
   */
  deleteTopicContent: async (contentId: string) => {
    try {
      const response = await axios.put(`${BASE_URL}/trash/${contentId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete topic content";
    }
  },

  /**
   * Fetches all topic contents for a specific topic
   * @param {string} topicId - The ID of the topic
   * @returns {Promise} Promise containing filtered topic content data
   */
  getTopicContentByTopicId: async (topicId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/by-topic/${topicId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      // Get contents from response
      const contents = response.data.data || [];
      console.log(`Contents fetched for topic ${topicId}: ${contents.length}`);

      return {
        message: "Topic contents retrieved successfully",
        data: contents,
      };
    } catch (error) {
      console.error(`Error fetching contents for topic ${topicId}:`, error);
      throw error.response?.data || "Failed to retrieve topic contents";
    }
  },

  /**
   * Add a comment to a lesson
   * @param {string} contentId - The ID of the topic content
   * @param {number} lessonIndex - The index of the lesson
   * @param {Object} commentData - The comment data
   * @returns {Promise} Promise with comments data
   */
  addComment: async (contentId: string, lessonIndex: number, commentData: any) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comment`,
        commentData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to add comment";
    }
  },

  /**
   * Add a reply to a comment
   * @param {string} contentId - The ID of the topic content
   * @param {number} lessonIndex - The index of the lesson
   * @param {number} commentIndex - The index of the comment
   * @param {Object} replyData - The reply data
   * @returns {Promise} Promise with replies data
   */
  addReplyToComment: async (contentId: string, lessonIndex: number, commentIndex: number, replyData: any) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comment/${commentIndex}/reply`,
        replyData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to add reply";
    }
  },

  /**
   * Add or update a reaction
   * @param {string} contentId - The ID of the topic content
   * @param {number} lessonIndex - The index of the lesson
   * @param {Object} reactionData - The reaction data
   * @returns {Promise} Promise with reactions data
   */
  addReaction: async (contentId: string, lessonIndex: number, reactionData: any) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${contentId}/lesson/${lessonIndex}/reaction`,
        reactionData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to add reaction";
    }
  },

  /**
   * Get comments for a lesson
   * @param {string} contentId - The ID of the topic content
   * @param {number} lessonIndex - The index of the lesson
   * @returns {Promise} Promise with comments data
   */
  getComments: async (contentId: string, lessonIndex: number) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comments`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve comments";
    }
  },

  /**
   * Get reactions for a lesson
   * @param {string} contentId - The ID of the topic content
   * @param {number} lessonIndex - The index of the lesson
   * @returns {Promise} Promise with reactions data
   */
  getReactions: async (contentId: string, lessonIndex: number) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/${contentId}/lesson/${lessonIndex}/reactions`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve reactions";
    }
  },

  /**
   * Move topic content to trash
   * @param {string} contentId - The ID of the topic content
   * @returns {Promise} Promise with trashed content data
   */
  moveToTrash: async (contentId: string) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/trash/${contentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to move topic content to trash";
    }
  },

  /**
   * Restore topic content from trash
   * @param {string} contentId - The ID of the topic content
   * @returns {Promise} Promise with restored content data
   */
  restoreFromTrash: async (contentId: string) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/restore/${contentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to restore topic content";
    }
  },

  /**
   * Get all trashed contents
   * @returns {Promise} Promise with trashed contents data
   */
  getTrashedContents: async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/trash/all`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve trashed contents";
    }
  },

  /**
   * Permanently delete topic content
   * @param {string} contentId - The ID of the topic content
   * @returns {Promise} Promise with deletion result
   */
  deletePermanently: async (contentId: string) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/permanent-delete/${contentId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to permanently delete topic content";
    }
  },

  /**
   * Delete a comment from a lesson
   * @param {string} contentId - The ID of the topic content
   * @param {number} lessonIndex - The index of the lesson
   * @param {number} commentIndex - The index of the comment
   * @returns {Promise} Promise with updated comments data
   */
  deleteComment: async (contentId: string, lessonIndex: number, commentIndex: number) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/${contentId}/lesson/${lessonIndex}/comment/${commentIndex}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete comment";
    }
  },

  /**
   * Delete a reaction from a lesson
   * @param {string} contentId - The ID of the topic content
   * @param {number} lessonIndex - The index of the lesson
   * @param {number} reactionIndex - The index of the reaction
   * @returns {Promise} Promise with updated reactions data
   */
  deleteReaction: async (contentId: string, lessonIndex: number, reactionIndex: number) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/${contentId}/lesson/${lessonIndex}/reaction/${reactionIndex}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete reaction";
    }
  },
};
/**
 * Helper function to get authentication token from local storage
 * @returns {string} Authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem("adminToken") || "";
};

export default TopicContentService;