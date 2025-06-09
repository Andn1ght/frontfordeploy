import { useState } from 'react';
import { videoService } from '../services/videoService';
import { Video, VideoProcessingStatus } from '../types/video';
import { toast } from 'react-hot-toast';

export const useVideo = (videoId?: string) => {
  const [video, setVideo] = useState<Video | null>(null);
  const [status, setStatus] = useState<VideoProcessingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadVideo = async (file: File, onProgress?: (progress: number) => void) => {
    try {
      setLoading(true);
      const uploadedVideo = await videoService.uploadVideo(file, onProgress);
      setVideo(uploadedVideo);
      toast.success('Video uploaded successfully');
      return uploadedVideo;
    } catch (err) {
      setError('Failed to upload video');
      toast.error('Failed to upload video');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async () => {
    if (!video?.id) return;

    try {
      setLoading(true);
      await videoService.deleteVideo(video.id);
      setVideo(null);
      toast.success('Video deleted successfully');
    } catch (err) {
      setError('Failed to delete video');
      toast.error('Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  return {
    video,
    status,
    loading,
    error,
    uploadVideo,
    deleteVideo,
  };
};