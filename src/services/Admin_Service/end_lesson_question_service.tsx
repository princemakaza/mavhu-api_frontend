import axios from "axios";

const BASE_URL = "/api/v1/end_lesson_questions";

/**
 * Service for handling End-Lesson Quiz API requests
 * (matches the routes in end_lesson_question_service router)
 */
const EndLessonQuestionService = {
    /**
     * Create a new quiz
     * @param {Object} data - quiz payload
     */
    createQuiz: async (data) => {
        try {
            const response = await axios.post(`${BASE_URL}/`, data, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data; // { success, data, message }
        } catch (error) {
            throw error.response?.data || "Failed to create quiz";
        }
    },

    /**
     * Get all quizzes (non-deleted)
     */
    getAllQuizzes: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, data, count }
        } catch (error) {
            throw error.response?.data || "Failed to retrieve quizzes";
        }
    },

    /**
     * Get quiz by ID
     * @param {string} id
     */
    getQuizById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, data }
        } catch (error) {
            throw error.response?.data || "Failed to retrieve quiz";
        }
    },

    /**
     * Get quizzes by topic_content_id
     * @param {string} topicContentId
     */
    getQuizzesByContentId: async (topicContentId) => {
        try {
            const response = await axios.get(`${BASE_URL}/content/${topicContentId}`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, data, count }
        } catch (error) {
            throw error.response?.data || "Failed to retrieve quizzes by content id";
        }
    },

    /**
     * Update quiz by ID
     * @param {string} id
     * @param {Object} data
     */
    updateQuiz: async (id, data) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, data, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data; // { success, data, message }
        } catch (error) {
            throw error.response?.data || "Failed to update quiz";
        }
    },

    /**
     * Soft delete quiz by ID
     * @param {string} id
     */
    softDeleteQuiz: async (id) => {
        try {
            const response = await axios.patch(`${BASE_URL}/${id}/soft-delete`, {}, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, data, message }
        } catch (error) {
            throw error.response?.data || "Failed to move quiz to trash";
        }
    },

    /**
     * Restore a soft-deleted quiz by ID
     * @param {string} id
     */
    restoreQuiz: async (id) => {
        try {
            const response = await axios.patch(`${BASE_URL}/${id}/restore`, {}, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, data, message }
        } catch (error) {
            throw error.response?.data || "Failed to restore quiz";
        }
    },

    /**
     * Permanently delete quiz by ID
     * @param {string} id
     */
    permanentDeleteQuiz: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}/permanent`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, message }
        } catch (error) {
            throw error.response?.data || "Failed to permanently delete quiz";
        }
    },

    /**
     * Get all quizzes including deleted (admin only)
     */
    getAllQuizzesWithDeleted: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/all`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, data, count }
        } catch (error) {
            throw error.response?.data || "Failed to retrieve all quizzes";
        }
    },

    /**
     * Get only deleted (trashed) quizzes
     */
    getDeletedQuizzes: async () => {
        try {
            const response = await axios.get(`${BASE_URL}/trash/all`, {
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });
            return response.data; // { success, data, count }
        } catch (error) {
            throw error.response?.data || "Failed to retrieve deleted quizzes";
        }
    },

    /**
     * Soft delete quizzes by topic_content_id
     * @param {string} topicContentId
     */
    deleteQuizzesByContentId: async (topicContentId) => {
        try {
            const response = await axios.patch(
                `${BASE_URL}/content/${topicContentId}/soft-delete`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                }
            );
            return response.data; // { success, data, message }
        } catch (error) {
            throw error.response?.data || "Failed to move quizzes to trash";
        }
    },

    /**
     * Restore quizzes by topic_content_id
     * @param {string} topicContentId
     */
    restoreQuizzesByContentId: async (topicContentId) => {
        try {
            const response = await axios.patch(
                `${BASE_URL}/content/${topicContentId}/restore`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                }
            );
            return response.data; // { success, data, message }
        } catch (error) {
            throw error.response?.data || "Failed to restore quizzes";
        }
    },

    /**
     * Get quiz count by topic_content_id
     * @param {string} topicContentId
     */
    getQuizCountByContentId: async (topicContentId) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/content/${topicContentId}/count`,
                {
                    headers: {
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                }
            );
            return response.data; // { success, count }
        } catch (error) {
            throw error.response?.data || "Failed to get quiz count";
        }
    },
};

/**
 * Helper to fetch the admin auth token
 */
const getAuthToken = () => {
    return localStorage.getItem("adminToken");
};

export default EndLessonQuestionService;
