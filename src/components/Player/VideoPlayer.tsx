import React, { useEffect, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId }) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}/processed`);
        if (!response.ok) throw new Error('Failed to fetch video');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoId]);

  if (loading) return <p className="text-center text-gray-500">Loading video...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <video
      src={videoUrl || undefined}
      controls
      className="w-full rounded-lg shadow-md border border-gray-300"
    />
  );
};

export default VideoPlayer;
