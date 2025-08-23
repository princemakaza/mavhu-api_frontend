import axios from "axios";

// Base URL for the TopicContent API
const BASE_URL =
  "/api/v1/topic_content";

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
    try {
      const response = await axios.get(`${BASE_URL}/get/${contentId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
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
      const response = await axios.delete(`${BASE_URL}/delete/${contentId}`, {
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
};

/**
 * Helper function to get authentication token from local storage
 * @returns {string} Authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem("adminToken") || "";
};

export default TopicContentService;
