import axios from "axios";

const BASE_URL = "/api/v1/student_route";

/**
 * Service for handling student-related API requests
 */
const StudentService = {
  /**
   * Fetches all students from the backend
   * @returns {Promise} Promise containing student d
   */
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getallstudents`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve students";
    }
  },

  /**
   * Get a specific student by ID
   * @param {string} id - Student ID
   * @returns {Promise} Promise with student data
   */
  getStudentById: async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/getstudent/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to retrieve student";
    }
  },

  /**
   * Delete student by ID
   */
  deleteStudent: async (id) => {
    try {
      const response = await axios.delete(`${BASE_URL}/deletestudent/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data; // { message: "Student deleted successfully" }
    } catch (error) {
      throw error.response?.data || "Failed to delete student";
    }
  },

  /**
   * Fetches dashboard statistics (students count, levels, subjects, etc.)
   */
  getAllDashboardData: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/dashboard`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to fetch dashboard data";
    }
  },

  /**
   * Approve profile picture (admin only)
   */
  approveProfilePicture: async (id) => {
    try {
      console.log("Approving profile picture for student ID:", id);
      const response = await axios.put(
        `${BASE_URL}/approve-profile-picture/${id}`,
        {}, // no body required
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to approve profile picture";
    }
  },

  /**
   * Reject profile picture (admin only) with reason
   */
  rejectProfilePicture: async (id, rejectionReason) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/reject-profile-picture/${id}`,
        { rejection_reason: rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to reject profile picture";
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

export default StudentService;
