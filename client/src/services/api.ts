import axios, { AxiosError } from 'axios';
import { Image, UploadResponse, ApiError } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const imageService = {
  upload: async (file: File, data: { title: string; is_public: boolean }): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', data.title);
    formData.append('is_public', String(data.is_public));

    try {
      const response = await api.post<Image>('/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded));
          console.log(`Upload Progress: ${percent}%`);
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Upload failed:', error);
      if (error instanceof AxiosError && error.response?.data) {
        const apiError = error.response.data as ApiError;
        return {
          success: false,
          error: apiError.error || apiError.details || '上传失败'
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      };
    }
  },

  getAll: async (search: string = ''): Promise<Image[]> => {
    try {
      const response = await api.get<Image[]>('/images', {
        params: { search }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch images:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/images/${id}`);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  },

  update: async (id: number, data: { title: string; is_public: boolean }): Promise<Image> => {
    try {
      const response = await api.put<Image>(`/images/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update image:', error);
      throw error;
    }
  },
};

export default api; 