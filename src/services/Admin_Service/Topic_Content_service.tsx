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

  addLesson: async (topicContentId: string, lessonData: any) => {
    try {
      console.log("Adding lesson with data:", lessonData);
      const jsonData = JSON.stringify(lessonData);
      console.log("JSON data to be sent:", jsonData);

      // Construct endpoint URL dynamically using topicContentId
      const response = await axios.post(
        `${BASE_URL}/topic-contents/${topicContentId}/lessons`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error adding lesson:", error);
      throw error.response?.data || "Failed to add lesson";
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
 * Fetches lesson information by Topic Content ID and Lesson ID
 * @param {string} topicContentId - The ID of the topic content
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise} Promise with lesson data
 */
  getLessonByTopicContentIdAndLessonId: async (topicContentId: string, lessonId: string) => {
    console.warn("Fetching lesson info for:", { topicContentId, lessonId });
    try {
      const response = await axios.get(
        `${BASE_URL}/lessonInfo/${topicContentId}/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      console.warn("Fetched lesson info:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching lesson info:", error);
      throw error.response?.data || "Failed to retrieve lesson info";
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
 * Deletes a lesson from a topic content by IDs
 * @param {string} topicContentId - The ID of the topic content
 * @param {string} lessonId - The ID of the lesson to delete
 * @returns {Promise} Promise with the API response
 */
deleteLesson: async (topicContentId: string, lessonId: string) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/v1/topic_content/topic-contents/${topicContentId}/lessons/${lessonId}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || "Failed to delete lesson";
  }
},

  /**
 * Reorders lessons within a topic content by topic content ID
 * @param {string} topicContentId - The ID of the topic content
 * @param {string[]} order - Array of lesson IDs in the desired order
 * @returns {Promise} Promise with the API response
 */
  reorderLessons: async (topicContentId: string, order: string[]) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/topic-contents/${topicContentId}/lessons/reorder`,
        { order },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || "Failed to reorder lessons";
    }
  },


  /**
 * Updates a specific lesson by Topic Content ID and Lesson ID
 * @param {string} topicContentId - The ID of the topic content
 * @param {string} lessonId - The ID of the lesson
 * @param {object} lessonData - The lesson data to update
 * @returns {Promise} Promise with updated lesson data
 */
  editLessonByTopicContentIdAndLessonId: async (
    topicContentId: string,
    lessonId: string,
    lessonData: any
  ) => {
    console.warn("Updating lesson:", { topicContentId, lessonId, lessonData });
    try {
      const response = await axios.patch(
        `${BASE_URL}/topic-contents/${topicContentId}/lessons/${lessonId}`,
        lessonData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.warn("Lesson updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating lesson:", error);
      throw error.response?.data || "Failed to update lesson";
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

      // Extract contents safely
      const contents = response.data.data || [];
      console.log(`Contents fetched for topic ${topicId}: ${contents.length}`);

      return {
        message: "Topic contents retrieved successfully",
        data: contents,
      };
    } catch (error) {
      console.error(`Error fetching contents for topic ${topicId}:`, error);

      // ✅ Handle 404 specifically — return an empty array instead of throwing
      if (error.response?.status === 404) {
        console.warn(`No contents found for topic ${topicId} (404). Returning [].`);
        return {
          message: "No topic contents found",
          data: [],
        };
      }

      // ❌ Other errors should still throw
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
  /**
   * Fetches lean topic contents for a specific topic
   * @param {string} topicId - The ID of the topic
   * @returns {Promise} Promise with lean topic content data
   */
  getTopicContentByTopicIdLean: async (topicId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/topic-contents/topic/${topicId}/lean`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      console.log("Lean topic contents response:", response.data);
      return response.data;
    } catch (error: any) {
      // Don't throw error for 404 - return empty array instead
      if (error.response?.status === 404) {
        console.log("No topic content found for topic:", topicId);
        return []; // Return empty array for 404
      }
      // Only throw for other errors
      throw error.response?.data || "Failed to retrieve lean topic contents";
    }
  },

  /**
   * Fetches a specific lesson’s content by Topic Content ID and Lesson ID
   * @param {string} topicContentId - The ID of the topic content
   * @param {string} lessonId - The ID of the lesson
   * @returns {Promise} Promise with the lesson content data
   */
  getLessonContentByTopicContentAndLessonId: async (
    topicContentId: string,
    lessonId: string
  ) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/lessonInfo/${topicContentId}/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve lesson content";
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