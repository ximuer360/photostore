export interface Image {
  id: number;
  title: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  is_public: boolean;
  created_at: string;
}

export interface UploadResponse {
  success: boolean;
  data?: Image;
  error?: string;
}

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
} 