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
  tags: string[];
}

export interface Detection {
  id: string;
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
  detection_json: string
  relatedDetections?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
}