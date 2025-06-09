import { useState, useEffect } from 'react';
import { api } from '../config/axios';
import { Video } from '../types/video';

export const useVideoHistory = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/videos');
      
      // Transform the raw API data into our Video type
      const transformedVideos = response.data.map((video: any) => ({
        id: video.id,
        title: video.original_filename || 'Untitled',
        duration: video.duration || 0,
        status: video.status || 'pending',
        url: video.storage_path || '',
        thumbnail: video.thumbnail_url || '',
        uploadDate: new Date(video.uploaded_at || Date.now()),
        resolution: video.resolution || 'Unknown',
        fps: video.fps || 0,
        fileSize: video.file_size || 0,
        tags: video.tags || [],
        userId: video.user_id || ''
      }));

      setVideos(transformedVideos);
      setError(null);
    } catch (err) {
      setError('Failed to load video history');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return { videos, loading, error, refetch: fetchVideos };
};