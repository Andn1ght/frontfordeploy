export interface VideoConstraints {
  maxDuration: number; // in seconds
  maxFps: number;
}

export const DEFAULT_CONSTRAINTS: VideoConstraints = {
  maxDuration: 300, // 5 minutes
  maxFps: 30
};

export const validateVideo = async (file: File, constraints: VideoConstraints = DEFAULT_CONSTRAINTS): Promise<{
  valid: boolean;
  errors: string[];
  metadata?: {
    duration: number;
    width: number;
    height: number;
    fps: number;
  };
}> => {
  try {
    const errors: string[] = [];
    
    // Create video element to check metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    
    // Wait for metadata to load
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video metadata'));
      // Set timeout in case video never loads
      setTimeout(() => reject(new Error('Timeout loading video metadata')), 5000);
    });
    
    const duration = video.duration;
    const width = video.videoWidth;
    const height = video.videoHeight;
    
    // Estimate FPS (not 100% accurate but good enough for validation)
    // In a real implementation, you'd need a more reliable way to determine FPS
    const fps = 30; // Assume 30 FPS as we can't reliably get it from HTML5 video
    
    // Check constraints
    if (duration > constraints.maxDuration) {
      errors.push(`Video duration exceeds maximum of ${constraints.maxDuration / 60} minutes`);
    }
    
    if (fps > constraints.maxFps) {
      errors.push(`Video FPS exceeds maximum of ${constraints.maxFps}`);
    }
    
    // Cleanup
    URL.revokeObjectURL(objectUrl);
    
    return {
      valid: errors.length === 0,
      errors,
      metadata: {
        duration,
        width,
        height,
        fps
      }
    };
  } catch (error) {
    return {
      valid: false,
      errors: ['Failed to validate video: ' + (error instanceof Error ? error.message : String(error))]
    };
  }
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 1000);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};