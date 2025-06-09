export interface Video {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  uploadDate: Date;
  duration: number;
  resolution: string;
  fps: number;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  tags: string[];
  userId: string;
}

export interface Detection {
  id: string;
  videoId: string;
  objectType: 'person' | 'gun' | 'knife' | 'drugs' | 'deadbody' | 'other';
  timestamp: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  description: string;
  relatedDetections?: string[];
  createdAt: Date;
}

export interface VideoUploadResponse {
  id: string;
  status: string;
  message: string;
}

export interface VideoProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
}