import axios from "axios";

// Base URL for the TopicInSubject API
const BASE_URL = "/api/v1/topic_in_subject";

/**
 * Helper: get authentication token from local storage
 */
const getAuthToken = () => localStorage.getItem("adminToken") || "";

/**
 * Shared headers
 */
const authHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
  "Content-Type": "application/json",
});

/**
 * Service for handling topic-related API requests within a subject
 */
const TopicInSubjectService = {
  /**
   * Fetches all topics
   */
  getAllTopics: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: authHeaders(),
      });
      return response.data; // { message, data }
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve topics";
    }
  },

  /**
   * Fetches all topics for a specific subject
   */
  getTopicsBySubjectId: async (subjectId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/gettopicbysubjectid/${subjectId}`,
        { headers: authHeaders() }
      );
      const topics = response.data?.data || [];
      console.log(`Topics fetched for subject ${subjectId}: ${topics.length}`);

      return {
        message: "Topics retrieved successfully",
        data: topics,
      };
    } catch (error: any) {
      console.error(
        `Error fetching topics for subject ${subjectId}:`,
        error
      );
      throw error.response?.data || "Failed to retrieve topics";
    }
  },

  /**
   * Fetch 5 random topics for a subject
   * GET /getfivetopicsbysubjectid/:id
   */
  getRandomFiveTopicsBySubjectId: async (subjectId: string) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/getfivetopicsbysubjectid/${subjectId}`,
        { headers: authHeaders() }
      );
      return response.data; // { message, data: [...] }
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve 5 random topics";
    }
  },

  /**
   * Fetch a specific topic by ID
   */
  getTopicById: async (topicId: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/get/${topicId}`, {
        headers: authHeaders(),
      });
      return response.data; // { message, data }
    } catch (error: any) {
      throw error.response?.data || "Failed to retrieve topic";
    }
  },

  /**
   * Create a new topic
   */
  createTopic: async (topicData: any) => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, topicData, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to create topic";
    }
  },

  /**
   * Update an existing topic
   */
  updateTopic: async (topicId: string, topicData: any) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${topicId}`,
        topicData,
        { headers: authHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to update topic";
    }
  },

  /**
   * Delete a topic (hard delete)
   */
  deleteTopic: async (topicId: string) => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${topicId}`, {
        headers: authHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to delete topic";
    }
  },

  /**
   * Increment topicContentRequests by 1
   * POST /:id/topic-content-request
   * (Route isn't auth-protected in your router; still sending token is fine.)
   */
  incrementTopicContentRequests: async (topicId: string) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/${topicId}/topic-content-request`,
        {},
        { headers: authHeaders() }
      );
      return response.data; // server returns the updated subject/topic payload
    } catch (error: any) {
      throw error.response?.data || "Failed to increment content requests";
    }
  },

  /**
   * Soft delete (move to trash)
   * PATCH /trash/:id
   */
  softDeleteTopic: async (topicId: string) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/trash/${topicId}`,
        {},
        { headers: authHeaders() }
      );
      return response.data; // { message, data }
    } catch (error: any) {
      throw error.response?.data || "Failed to move topic to trash";
    }
  },

  /**
   * Restore from trash
   * PATCH /trash/:id/restore
   */
  restoreTopic: async (topicId: string) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/trash/${topicId}/restore`,
        {},
        { headers: authHeaders() }
      );
      return response.data; // { message, data }
    } catch (error: any) {
      throw error.response?.data || "Failed to restore topic";
    }
  },

  /**
   * List trashed topics
   * GET /trash
   */
  getDeletedTopics: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/trash`, {
        headers: authHeaders(),
      });
      return response.data; // { message, data: [...] }
    } catch (error: any) {
      throw error.response?.data || "Failed to fetch trashed topics";
    }
  },

  /**
   * Permanently delete a trashed topic
   * DELETE /trash/:id/permanent
   */
  permanentDeleteTopic: async (topicId: string) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/trash/${topicId}/permanent`,
        { headers: authHeaders() }
      );
      return response.data; // { message }
    } catch (error: any) {
      throw error.response?.data || "Failed to permanently delete topic";
    }
  },

  /**
   * Set topic visibility
   * PATCH /visibility/:id  with body { showTopic: boolean }
   */
setTopicVisibility: async (topicId: string, showTopic: boolean) => {
  console.log("showTopic", showTopic);
  console.log("topicId", topicId);
  try {
    const response = await axios.patch(
      `${BASE_URL}/visibility/${topicId}`,
      JSON.stringify({ "showTopic": showTopic }), // ensure JSON payload
      {
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json", // explicitly specify JSON
        },
      }
    );
    return response.data; // { message, data }
  } catch (error: any) {
    throw error.response?.data || "Failed to update topic visibility";
  }
},
};

export default TopicInSubjectService;
