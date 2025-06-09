import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Download, AlertCircle } from 'lucide-react';
import { api } from '../../config/axios';
import { Video } from '../../types/video';
import { formatDuration } from '../../utils/validation';
import { toast } from 'react-hot-toast';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to fetch videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/dashboard/videos/${videoId}`);
      setVideos(videos.filter(video => video.id !== videoId));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const handleDownloadReport = async (videoId: string, videoTitle: string) => {
    try {
      const response = await api.get(`/dashboard/videos/${videoId}/report`);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${videoTitle.replace(/\s+/g, '_')}_report.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={fetchVideos}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Load Videos'}
        </button>
      </div>

      <div className="bg-white dark:bg-dark-700 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead className="bg-gray-50 dark:bg-dark-800">
            <tr>
              <th scope="col" className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Upload Date
              </th>
              <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-700 divide-y divide-gray-200 dark:divide-dark-600">
            {videos.length > 0 ? (
              videos.map((video) => (
                <motion.tr
                  key={video.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-dark-600"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
                    {video.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDuration(video.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      video.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : video.status === 'error'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(video.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleDownloadReport(video.id, video.title)}
                        disabled={video.status !== 'completed'}
                        className="text-gray-600 hover:text-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={video.status !== 'completed' ? 'Processing not complete' : 'Download Report'}
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-gray-600 hover:text-red-500"
                        title="Delete Video"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
                    <p>{loading ? 'Loading videos...' : 'No videos found'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Videos;