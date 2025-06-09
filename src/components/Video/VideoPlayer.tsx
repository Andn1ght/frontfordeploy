import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { videoService } from '../../services/videoService';

const VideoPlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const loadVideo = async () => {
      if (!id) {
        setError('Video ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        const blob = await videoService.getProcessedVideo(id, 'video');

        console.log("BLOBLLLL::::::", blob)
        
        if (!mounted) return;

        if (!blob || !blob.type.startsWith('video/')) {
          throw new Error('Invalid video file');
        }

        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        if (retryCount < maxRetries) {
          retryTimeout = setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 2000);
        } else {
          setError('Failed to load video');
          setIsLoading(false);
        }
      }
    };

    loadVideo();

    return () => {
      mounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [id, retryCount]);

  if (isLoading) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-3" />
          <p>Loading video...</p>
          {retryCount > 0 && <p className="text-sm text-gray-400">Retry {retryCount}/{maxRetries}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black">
      <video
        className="w-full h-full"
        controls
        playsInline
        controlsList="nodownload"
      >
        <source src={videoUrl!} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
