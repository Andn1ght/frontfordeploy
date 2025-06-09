import React from 'react';
import { useVideoHistory } from '../../hooks/useVideoHistory';
import { Clock, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { videoService } from '../../services/videoService';
import { toast } from 'react-hot-toast';
import { api } from '../../config/axios';

interface SidebarProps {
  onVideoSelect?: (videoUrl: string, reportData: any, reportUrl: string) => void;
  initialVideo?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onVideoSelect, initialVideo }) => {
  const { videos, loading, error, refetch } = useVideoHistory();

  const handleVideoClick = async (videoId: string, videoTitle: string) => {
    try {
      const [videoBlob, reportData] = await Promise.all([
        videoService.getProcessedVideo(videoId, videoTitle),
        videoService.getVideoReport(videoId)
      ]);

      const videoUrl = URL.createObjectURL(videoBlob);

      // Создаём blob URL для отчёта
      const reportJson = JSON.stringify(reportData, null, 2);
      const reportBlob = new Blob([reportJson], { type: 'application/json' });
      const reportUrl = URL.createObjectURL(reportBlob);

      onVideoSelect?.(videoUrl, reportData, reportUrl);
      toast.success('Video loaded successfully');
    } catch (err) {
      toast.error('Failed to load video');
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data;
      localStorage.setItem('auth_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await refetch();
      toast.success('History updated successfully');
    } catch (err) {
      toast.error('Failed to update history');
    }
  };

  return (
    <div className="w-64 border-r border-gray-200 dark:border-dark-600 h-full flex flex-col bg-gray-50 dark:bg-dark-800">
      <div className="p-6 border-b border-gray-200 dark:border-dark-600">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong>SecureVision</strong> is an AI-powered system for analyzing surveillance footage.
          It automatically detects weapons, suspicious objects, and unusual behavior.
          <br /><br />
          Upload your video to receive a processed version with visual annotations and a detailed report of detected threats.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-700 dark:text-gray-300 font-semibold flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Video History
          </h2>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50"
            title="Update History"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 text-primary-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-danger">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No videos yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {videos.map((video) => (
              <motion.button
                key={video.id}
                onClick={() => handleVideoClick(video.id, video.title)}
                className={`w-full p-3 rounded-lg bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 
                          transition-colors duration-200 shadow-sm group`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-500">
                      {video.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(video.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
