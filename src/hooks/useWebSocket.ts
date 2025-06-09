import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { videoService } from '../services/videoService';
import { Detection } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';

export const useWebSocket = (videoId: string, onComplete?: () => void) => {
  const [isComplete, setIsComplete] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [reportRes, setReport] = useState<Detection[] | null>(null)
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!videoId || isComplete  || wsRef.current) return;
    const ws = new WebSocket(`${WS_URL}?videoId=${videoId}`);
    wsRef.current = ws;

    ws.addEventListener('message', async ({ data }) => {
      const { status, message } = JSON.parse(data);
      if ((status === 'completed' || message === 'completed') && !isComplete) {
        setIsComplete(true);
        // small delay if you need
        await new Promise(r => setTimeout(r, 500));
        try {
          const blob = await videoService.getProcessedVideo(videoId, 'video');
          const url = URL.createObjectURL(blob);
          setProcessedVideoUrl(url);
          const report = await videoService.getVideoReport(videoId)
          setReport(report)
          const jsonString = JSON.stringify(report.detection_json, null, 2);

          const blobReport = new Blob([jsonString], { type: 'application/json' });
          const urlReport = URL.createObjectURL(blobReport);
          setReportUrl(urlReport)
          toast.success('Video ready to preview!');
          onComplete?.();
        } catch {
          toast.error('Failed to load video');
        } finally {
          ws.close();
        }
      }
    });

    ws.addEventListener('error', console.error);
    ws.addEventListener('open', () => console.log('WS open'));
    ws.addEventListener('close', () => console.log('WS closed'));

    return () => {
      ws.close();
      if (processedVideoUrl) {
        URL.revokeObjectURL(processedVideoUrl);
      }
    };
  }, [videoId, isComplete, onComplete, processedVideoUrl]);

  return { isComplete, processedVideoUrl, reportUrl, reportRes };
};