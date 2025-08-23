import axios from "axios";

// Base URL for the TopicInSubject API
const BASE_URL =
  "/api/v1/topic_in_subject";

/**
 * Service for handling topic-related API requests within a subject
 */
const TopicInSubjectService = {
  /**
   * Fetches all topics
   * @returns {Promise} Promise containing topic data
   */
  getAllTopics: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve topics";
    }
  },

  /**
   * Fetches all topics for a specific subject
   * @param {string} subjectId - The ID of the subject
   * @returns {Promise} Promise containing filtered topic data
   */

  // Updated getTopicsBySubjectId function for TopicInSubjectService
  getTopicsBySubjectId: async (subjectId: string) => {
    try {
      // Update API call to include the subject ID in the URL path
      const response = await axios.get(
        `${BASE_URL}/gettopicbysubjectid/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      // Get topics from response
      const topics = response.data.data || [];
      console.log(`Topics fetched for subject ${subjectId}: ${topics.length}`);

      return {
        message: "Topics retrieved successfully",
        data: topics,
      };
    } catch (error) {
      console.error(`Error fetching topics for subject ${subjectId}:`, error);
      throw error.response?.data || "Failed to retrieve topics";
    }
  },
  /**
   * Fetches a specific topic by ID
   * @param {string} topicId - The ID of the topic
   * @returns {Promise} Promise with topic data
   */
  getTopicById: async (topicId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/get/${topicId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve topic";
    }
  },

  /**
   * Creates a new topic
   * @param {Object} topicData - Data for the new topic
   * @returns {Promise} Promise with created topic data
   */
  createTopic: async (topicData: any) => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, topicData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create topic";
    }
  },

  /**
   * Updates an existing topic
   * @param {string} topicId - The ID of the topic
   * @param {Object} topicData - Updated data for the topic
   * @returns {Promise} Promise with updated topic data
   */
  updateTopic: async (topicId: string, topicData: any) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${topicId}`,
        topicData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update topic";
    }
  },

  /**
   * Deletes a topic
   * @param {string} topicId - The ID of the topic
   * @returns {Promise} Promise with deletion result
   */
  deleteTopic: async (topicId: string) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${topicId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to delete topic";
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

export default TopicInSubjectService;
