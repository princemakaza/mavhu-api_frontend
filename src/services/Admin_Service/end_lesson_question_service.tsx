import axios from "axios";

const BASE_URL = "/api/v1/end_lesson_questions";

/**
 * Helper to fetch the admin auth token
 */
const getAuthToken = () => localStorage.getItem("adminToken");

const authHeaders = () => ({
    Authorization: `Bearer ${getAuthToken()}`,
});

/**
 * Extract a readable error payload
 */
const asError = (error, fallback) =>
    error?.response?.data || { success: false, message: fallback };

/**
 * Service for handling End-Lesson Quiz API requests
 * (matches the routes in end_lesson_question_service router)
 */
const EndLessonQuestionService = {
    // ---------- LESSON-SCOPED ROUTES (topic_content_id + lesson_id) ----------

    /**
     * Upsert (create or replace) a quiz for a specific lesson
     * POST /content/:topicContentId/lesson/:lessonId
     * @param {string} topicContentId
     * @param {string} lessonId
     * @param {{questions: Array}} payload e.g. { questions: [...] }
     */
    upsertQuizForLesson: async (topicContentId, lessonId, payload) => {
        try {
            const url = `${BASE_URL}/content/${topicContentId}/lesson/${lessonId}`;
            const res = await axios.post(url, payload, {
                headers: { ...authHeaders(), "Content-Type": "application/json" },
            });
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to upsert quiz for the lesson");
        }
    },

    /**
     * Get a quiz for a specific lesson
     * GET /content/:topicContentId/lesson/:lessonId
     */
    getQuizByContentAndLesson: async (topicContentId, lessonId) => {
        try {
            const url = `${BASE_URL}/content/${topicContentId}/lesson/${lessonId}`;
            const res = await axios.get(url, { headers: authHeaders() });
            return res.data; // { success, data }
        } catch (error) {
            throw asError(error, "Failed to retrieve quiz for the lesson");
        }
    },

    /**
     * Update quiz for a specific lesson
     * PUT /content/:topicContentId/lesson/:lessonId
     * @param {Object} data
     */
    updateQuizByContentAndLesson: async (topicContentId, lessonId, data) => {
        try {
            const url = `${BASE_URL}/content/${topicContentId}/lesson/${lessonId}`;
            const res = await axios.put(url, data, {
                headers: { ...authHeaders(), "Content-Type": "application/json" },
            });
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to update quiz for the lesson");
        }
    },

    /**
     * Soft delete quiz(es) for a specific lesson
     * PATCH /content/:topicContentId/lesson/:lessonId/soft-delete
     */
    softDeleteByContentAndLesson: async (topicContentId, lessonId) => {
        try {
            const url = `${BASE_URL}/content/${topicContentId}/lesson/${lessonId}/soft-delete`;
            const res = await axios.patch(url, {}, { headers: authHeaders() });
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to move quiz(es) to trash for the lesson");
        }
    },

    /**
     * Restore quiz(es) for a specific lesson
     * PATCH /content/:topicContentId/lesson/:lessonId/restore
     */
    restoreByContentAndLesson: async (topicContentId, lessonId) => {
        try {
            const url = `${BASE_URL}/content/${topicContentId}/lesson/${lessonId}/restore`;
            const res = await axios.patch(url, {}, { headers: authHeaders() });
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to restore quiz(es) for the lesson");
        }
    },

    /**
     * Count quizzes for a specific lesson
     * GET /content/:topicContentId/lesson/:lessonId/count
     */
    getQuizCountByContentAndLesson: async (topicContentId, lessonId) => {
        try {
            const url = `${BASE_URL}/content/${topicContentId}/lesson/${lessonId}/count`;
            const res = await axios.get(url, { headers: authHeaders() });
            return res.data; // { success, count }
        } catch (error) {
            throw asError(error, "Failed to get quiz count for the lesson");
        }
    },

    // ---------- EXISTING CONTENT-SCOPED ROUTES (topic_content_id only) ----------

    /**
     * Get quizzes by topic_content_id
     * GET /content/:topicContentId
     */
    getQuizzesByContentId: async (topicContentId) => {
        try {
            const res = await axios.get(`${BASE_URL}/content/${topicContentId}`, {
                headers: authHeaders(),
            });
            return res.data; // { success, data, count }
        } catch (error) {
            throw asError(error, "Failed to retrieve quizzes by content id");
        }
    },

    /**
     * Soft delete quizzes by topic_content_id
     * PATCH /content/:topicContentId/soft-delete
     */
    deleteQuizzesByContentId: async (topicContentId) => {
        try {
            const res = await axios.patch(
                `${BASE_URL}/content/${topicContentId}/soft-delete`,
                {},
                { headers: authHeaders() }
            );
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to move quizzes to trash");
        }
    },

    /**
     * Restore quizzes by topic_content_id
     * PATCH /content/:topicContentId/restore
     */
    restoreQuizzesByContentId: async (topicContentId) => {
        try {
            const res = await axios.patch(
                `${BASE_URL}/content/${topicContentId}/restore`,
                {},
                { headers: authHeaders() }
            );
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to restore quizzes");
        }
    },

    /**
     * Get quiz count by topic_content_id
     * GET /content/:topicContentId/count
     */
    getQuizCountByContentId: async (topicContentId) => {
        try {
            const res = await axios.get(
                `${BASE_URL}/content/${topicContentId}/count`,
                { headers: authHeaders() }
            );
            return res.data; // { success, count }
        } catch (error) {
            throw asError(error, "Failed to get quiz count");
        }
    },

    // ---------- GLOBAL / ID-SCOPED ROUTES ----------

    /**
     * Create a new quiz (expects topic_content_id & lesson_id in body)
     * POST /
     */
    createQuiz: async (data) => {
        try {
            const res = await axios.post(`${BASE_URL}/`, data, {
                headers: { ...authHeaders(), "Content-Type": "application/json" },
            });
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to create quiz");
        }
    },

    /**
     * Get all quizzes (non-deleted)
     * GET /
     */
    getAllQuizzes: async () => {
        try {
            const res = await axios.get(`${BASE_URL}/`, {
                headers: authHeaders(),
            });
            return res.data; // { success, data, count }
        } catch (error) {
            throw asError(error, "Failed to retrieve quizzes");
        }
    },

    /**
     * Get quiz by ID
     * GET /:id
     */
    getQuizById: async (id) => {
        try {
            const res = await axios.get(`${BASE_URL}/${id}`, {
                headers: authHeaders(),
            });
            return res.data; // { success, data }
        } catch (error) {
            throw asError(error, "Failed to retrieve quiz");
        }
    },

    /**
     * Update quiz by ID
     * PUT /:id
     */
    updateQuiz: async (id, data) => {
        try {
            const res = await axios.put(`${BASE_URL}/${id}`, data, {
                headers: { ...authHeaders(), "Content-Type": "application/json" },
            });
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to update quiz");
        }
    },

    /**
     * Soft delete quiz by ID
     * PATCH /:id/soft-delete
     */
    softDeleteQuiz: async (id) => {
        try {
            const res = await axios.patch(
                `${BASE_URL}/${id}/soft-delete`,
                {},
                { headers: authHeaders() }
            );
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to move quiz to trash");
        }
    },

    /**
     * Restore a soft-deleted quiz by ID
     * PATCH /:id/restore
     */
    restoreQuiz: async (id) => {
        try {
            const res = await axios.patch(
                `${BASE_URL}/${id}/restore`,
                {},
                { headers: authHeaders() }
            );
            return res.data; // { success, data, message }
        } catch (error) {
            throw asError(error, "Failed to restore quiz");
        }
    },

    /**
     * Permanently delete quiz by ID
     * DELETE /:id/permanent
     */
    permanentDeleteQuiz: async (id) => {
        try {
            const res = await axios.delete(`${BASE_URL}/${id}/permanent`, {
                headers: authHeaders(),
            });
            return res.data; // { success, message }
        } catch (error) {
            throw asError(error, "Failed to permanently delete quiz");
        }
    },

    /**
     * Get all quizzes including deleted (admin only)
     * GET /admin/all
     */
    getAllQuizzesWithDeleted: async () => {
        try {
            const res = await axios.get(`${BASE_URL}/admin/all`, {
                headers: authHeaders(),
            });
            return res.data; // { success, data, count }
        } catch (error) {
            throw asError(error, "Failed to retrieve all quizzes");
        }
    },

    /**
     * Get only deleted (trashed) quizzes
     * GET /trash/all
     */
    getDeletedQuizzes: async () => {
        try {
            const res = await axios.get(`${BASE_URL}/trash/all`, {
                headers: authHeaders(),
            });
            return res.data; // { success, data, count }
        } catch (error) {
            throw asError(error, "Failed to retrieve deleted quizzes");
        }
    },
};

export default EndLessonQuestionService;
