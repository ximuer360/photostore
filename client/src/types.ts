export interface Image {
  id: number;
  title: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  is_public: boolean;
  created_at: string;
  tags?: string[];
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
  usage_count: number;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface UploadResponse {
  success: boolean;
  data?: Image;
  error?: string;
}