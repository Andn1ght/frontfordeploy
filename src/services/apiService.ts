import axios from 'axios';
import { VideoAnalysisResponse, AuditLog } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Video analysis
  uploadVideo: async (file: File): Promise<VideoAnalysisResponse> => {
    const formData = new FormData();
    formData.append('video', file);

    const response = await api.post<VideoAnalysisResponse>('/videos/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
        console.log(`Upload Progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  },

  // Admin functions
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get<AuditLog[]>('/admin/audit-logs');
    return response.data;
  },

  // Error handling
  handleError: (error: unknown) => {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'An error occurred');
    }
    throw error;
  },
};