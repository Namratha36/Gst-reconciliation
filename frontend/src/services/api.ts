import axios from "axios";
import { tokenStore } from "@/services/authenticationService";

const API_URL = "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      tokenStore.clear();
      // Force reload to trigger ProtectedRoute logic
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
