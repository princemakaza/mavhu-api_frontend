import axios from "axios";
import { API_BASE_URL } from "../../../config/env";

/**
 * Central API instance
 * Handles baseURL and global configs
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach token automatically if available
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
