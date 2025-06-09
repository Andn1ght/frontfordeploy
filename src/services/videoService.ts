import { api } from '../config/axios';
import { Video, Detection } from '../types';

export const videoService = {
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<Video> {
    console.log('[API] Starting video upload', {
      method: 'POST',
      endpoint: '/videos/upload',
      file: {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      }
    });

    if (!file) {
      console.error('[Validation Error] No file provided for upload');
      throw new Error('No file provided for upload');
    }
    console.log('[Base URL Check]', { baseURL: api.defaults.baseURL });
    if (!api.defaults.baseURL) {
      console.error('[Config Error] baseURL is not configured in axios instance');
      throw new Error('baseURL is not configured in axios instance');
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },  
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && progressEvent.total > 0) {
            const progress = Math.min(99, Math.round((progressEvent.loaded * 100) / progressEvent.total));
            console.log(`[Upload Progress] ${progress}%`, {
              loaded: progressEvent.loaded,
              total: progressEvent.total
            });
            onProgress?.(progress);
          } else {
            console.warn('[Upload Progress] Unable to calculate progress', progressEvent);
          }
        },
        timeout: 600000
      });

      console.log('[API] Upload completed', {
        status: response.status,
        data: {
          videoId: response.data?.video?.id,
          filename: response.data?.video?.original_filename
        }
      });

      if (!response.data?.video?.id) {
        console.error('[Response Error] Invalid server response: missing video ID', response.data);
        throw new Error('Invalid server response: missing video ID');
      }

      const videoInfo = response.data.video;
      onProgress?.(100);

      const videoData = {
        id: videoInfo.id,
        title: videoInfo.original_filename || file.name,
        url: `${api.defaults.baseURL}/dashboard/videos/${videoInfo.id}/processed`,
        thumbnail: '',
        uploadDate: new Date(),
        duration: 0,
        resolution: '',
        fps: 0,
        fileSize: file.size,
        status: 'processing',
        tags: [],
        userId: videoInfo.user_id || ''
      };

      console.log('[API] Video metadata prepared', videoData);
      return videoData;
    } catch (error) {
      console.error('[API] Upload failed', {
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      });
      throw error;
    }
  },

  async getProcessedVideo(id: string, title: string): Promise<Blob> {
    const endpoint = `/dashboard/videos/${id}/processed`;
    const fullUrl = `${api.defaults.baseURL}${endpoint}`;
    console.log('[API] Sending GET request', {
      method: 'GET',
      endpoint,
      fullUrl,
      params: { id, title }
    });

    if (!id) {
      console.error('[Validation Error] No video ID provided');
      throw new Error('No video ID provided');
    }

    

    console.log('[Base URL Check]', { baseURL: api.defaults.baseURL });
    if (!api.defaults.baseURL) {
      console.error('[Config Error] baseURL is not configured in axios instance');
      throw new Error('baseURL is not configured in axios instance');
    }

    try {
      console.log('[API] Sending GET request to', { fullUrl });
      const response = await api.get(endpoint, {
        responseType: 'blob',
        
        timeout: 300000
      });

      console.log("RESPONMSESESESE: " , response)

      if (!(response.data instanceof Blob)) {
        console.error('[Response Error] Expected Blob, but received:', response.data);
        throw new Error('Invalid response type: expected Blob');
      }

      console.log('[API] Video fetched successfully', {
        status: response.status,
        size: `${(response.data.size / 1024 / 1024).toFixed(2)} MB`,
        type: response.data.type
      });

      return response.data;
    } catch (error) {
      console.error('[API] GET request failed', {
        endpoint,
        fullUrl,
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      });
      throw error;
    }
  },

  async forceDownload(id: string, title: string, blob: Blob): Promise<void> {
    console.log('[Download] Starting force download', { id, title });

    if (!id || !title || !blob) {
      console.error('[Validation Error] Missing id, title, or blob', { id, title, blob });
      throw new Error('Missing id, title, or blob');
    }

    const url = URL.createObjectURL(blob);
    const filename = `${title.replace(/\s+/g, '_')}_backup.mp4`;

    console.log('[Download] Creating download link', {
      blobSize: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
      filename
    });

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('[Download] Cleanup completed');
    }, 100);

    console.log('[Download] File download initiated', { filename });
  },

  async getVideoReport(id: string): Promise<Detection[]> {
    console.log('[API] Fetching video report', {
      method: 'GET',
      endpoint: `/dashboard/videos/${id}/report`
    });

    if (!id) {
      console.error('[Validation Error] No video ID provided');
      throw new Error('No video ID provided');
    }

    try {
      const response = await api.get<Detection[]>(`/dashboard/videos/${id}/report`, {
       
      });

      console.log('[API] Report received', {
        itemCount: response.data.length,
        sample: response.data.length > 0 ? response.data[0] : null
      });

      return response.data;
    } catch (error) {
      console.error('[API] Report fetch failed', {
        endpoint: `/videos/${id}/report`,
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        }
      });
      throw error;
    }
  },
}
