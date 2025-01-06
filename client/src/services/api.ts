import axios, { AxiosError } from 'axios';
import { Image, UploadResponse, ApiError, Tag } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

export const imageService = {
  upload: async (file: File, data: { title: string; is_public: boolean; tags?: string[] }): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', data.title);
    formData.append('is_public', String(data.is_public));
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }

    try {
      const response = await api.post<Image>('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
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
      
      // 确保返回的数据是数组
      const data = Array.isArray(response.data) ? response.data : [];
      
      // 确保每个图片对象都有必要的字段
      return data.map(image => ({
        ...image,
        tags: Array.isArray(image.tags) ? image.tags : []
      }));
    } catch (error) {
      console.error('Failed to fetch images:', error);
      return []; // 出错时返回空数组
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

  update: async (id: number, data: { title: string; is_public: boolean; tags?: string[] }): Promise<Image> => {
    try {
      const response = await api.put<Image>(`/images/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update image:', error);
      throw error;
    }
  },

  getAllTags: async (): Promise<Tag[]> => {
    try {
      console.log('Fetching tags from API...');
      const response = await api.get<Tag[]>('/images/tags');
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      throw error;
    }
  },

  getImageWithTags: async (id: number): Promise<Image> => {
    try {
      const response = await api.get<Image>(`/images/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch image:', error);
      throw error;
    }
  },

  addTags: async (imageId: number, tags: string[]): Promise<void> => {
    try {
      await api.post(`/images/${imageId}/tags`, { tags });
    } catch (error) {
      console.error('Failed to add tags:', error);
      throw error;
    }
  },

  removeTags: async (imageId: number, tagIds: number[]): Promise<void> => {
    try {
      await api.delete(`/images/${imageId}/tags`, { data: { tagIds } });
    } catch (error) {
      console.error('Failed to remove tags:', error);
      throw error;
    }
  },

  createTag: async (data: { name: string }): Promise<Tag> => {
    try {
      const response = await api.post<Tag>('/images/tags', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    }
  },

  updateTag: async (id: number, data: { name: string }): Promise<Tag> => {
    try {
      const response = await api.put<Tag>(`/images/tags/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update tag:', error);
      throw error;
    }
  },

  deleteTag: async (id: number): Promise<void> => {
    try {
      await api.delete(`/images/tags/${id}`);
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    }
  }
};

export default api; 