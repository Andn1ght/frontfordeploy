import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, Download, AlertCircle } from 'lucide-react';
import { api } from '../../config/axios';
import { Video } from '../../types/video';
import { formatDuration } from '../../utils/validation';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/videos');
      const transformedVideos = response.data.map((video: any) => ({
        id: video.id,
        title: video.original_filename || t('untitled'),
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
      toast.error(t('videosFetchFailed'));
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm(t('deleteConfirmation'))) {
      return;
    }

    try {
      await api.delete(`/dashboard/videos/${videoId}`);
      setVideos(videos.filter(video => video.id !== videoId));
      toast.success(t('videoDeleted'));
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error(t('videoDeleteFailed'));
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

      toast.success(t('reportDownloaded'));
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error(t('reportDownloadFailed'));
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
          {loading ? t('loading') : t('loadVideos')}
        </button>
      </div>

      <div className="bg-white dark:bg-dark-700 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead className="bg-gray-50 dark:bg-dark-800">
            <tr>
              <th className="w-1/3 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('title')}
              </th>
              <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('duration')}
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('uploadDate')}
              </th>
              <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('actions')}
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
                      {t(video.status)}
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
                        title={video.status !== 'completed' ? t('processingNotComplete') : t('downloadReport')}
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-gray-600 hover:text-red-500"
                        title={t('deleteVideo')}
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
                    <p>{loading ? t('loading') : t('noVideos')}</p>
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
