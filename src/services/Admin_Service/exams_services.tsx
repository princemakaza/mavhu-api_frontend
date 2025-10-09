import axios from "axios";

const BASE_URL = "/api/v1/exam";

/**
 * Service for handling exam-related API requests
 */
const ExamService = {
  /**
   * Fetches all exams from the backend
   * @returns {Promise} Promise containing exam data
   */
  getAllExams: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getall`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve exams";
    }
  },
  /**
   * Creates a new exam
   * @param {Object} examData - Data for the new exam
   * @returns {Promise} Promise containing created exam data
   */
  createExam: async (examData) => {
    try {
      const response = await axios.post(`${BASE_URL}/create`, examData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to create exam";
    }
  },

  getExamById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/get/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve exam by ID";
    }
  },


  getStudentsMarksByExamId: async (examId) => {
    try {
      const response = await axios.get(
        `${BASE_URL.replace('/exam', '')}/record_exam/exam/${examId}/top-students`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve student marks";
    }
  },
  deleteExamById: async (id: string): Promise<any> => {
    try {
      const response = await axios.delete(`${BASE_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || "Failed to delete exam";
    }
  },




  updateExam: async (id: string, examData) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/update/${id}`,
        examData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to update exam";
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

export default ExamService;
