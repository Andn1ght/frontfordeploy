import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, AlertCircle, Shield, Play } from 'lucide-react';
import { validateVideo } from '../../utils/validation';
import { videoService } from '../../services/videoService';
import { useWebSocket } from '../../hooks/useWebSocket';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';



interface UploadZoneProps {
  initialVideo?: string;
  initialReport?: any;
  initialReportUrl?: string;
}


const UploadZone: React.FC<UploadZoneProps> = ({ initialVideo, initialReport, initialReportUrl }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'validating' | 'uploading' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const navigate = useNavigate();
  

  const { isComplete, processedVideoUrl, reportUrl, reportRes } = useWebSocket(currentVideoId || '', () => {
    if (currentVideoId && processedVideoUrl) {
      navigate(`/dashboard/${currentVideoId}/processed`);
    }
  });
  const downloadLink = reportUrl || initialReportUrl || '#';

  useEffect(() => {
    if (initialVideo && initialReport) {
      setPreviewUrl(initialVideo);
      setUploadState('processing');
      setSelectedFile(null);
    }
  }, [initialVideo, initialReport]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadState('validating');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const validationResult = await validateVideo(file);

      if (!validationResult.valid) {
        setUploadState('error');
        setErrorMessage(validationResult.errors.join(', '));
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
      setUploadState('idle');

    } catch (error) {
      setUploadState('error');
      setErrorMessage('Failed to validate video');
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setErrorMessage('');

    try {
      const uploadedVideo = await videoService.uploadVideo(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (uploadedVideo && uploadedVideo.id) {
        setCurrentVideoId(uploadedVideo.id);
        setUploadState('processing');
        toast.success('Upload complete! Processing video...');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      setUploadState('error');
      setErrorMessage(error.message || 'Failed to upload video');
      toast.error('Upload failed');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/mp4': ['.mp4'] },
    maxFiles: 1,
    disabled: uploadState !== 'idle'
  });

  const resetUpload = () => {
    if (previewUrl && !initialVideo) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadState('idle');
    setSelectedFile(null);
    setPreviewUrl(null);
    setCurrentVideoId(null);
    setErrorMessage('');
    setUploadProgress(0);
  };

  return (
    <div className="max-w-2xl w-full mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <Shield className="h-16 w-16 text-primary-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Security Video Analysis</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your security footage for advanced threat detection
          </p>
        </div>

        <div className="bg-white dark:bg-dark-700 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Video Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
              <h4 className="font-medium mb-2">Technical Requirements</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Format: MP4</li>
                <li>• Duration: ≤ 5 minutes</li>
                <li>• FPS: ≤ 30</li>
                <li>• Resolution: ≤ 1080p</li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
              <h4 className="font-medium mb-2">Detection Capabilities</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Weapons (firearms, knives)</li>
                <li>• Suspicious objects</li>
                <li>• Person tracking</li>
                <li>• Behavioral analysis</li>
              </ul>
            </div>
          </div>
        </div>

        <div
          {...(uploadState === 'idle' && !selectedFile ? getRootProps() : {})}
          className={`border-2 border-dashed rounded-lg p-8 ${
            isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 
            'border-gray-300 dark:border-dark-500'
          } bg-white dark:bg-dark-700`}
        >
          {uploadState === 'idle' && !selectedFile && <input {...getInputProps()} />}

          {uploadState === 'idle' && !selectedFile && (
            <div className="text-center">
              <Upload className="h-16 w-16 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Security Video</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Drag & drop your video here or click to browse
              </p>
              <AlertCircle className="h-5 w-5 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Maximum file size: 500MB
              </p>
            </div>
          )}

          {uploadState === 'idle' && selectedFile && (
            <div className="space-y-4">
              <video
                src={previewUrl || ''}
                className="w-full rounded"
                controls
              />
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-6 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Analyze Video
                </button>
              </div>
            </div>
          )}

          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <div className="text-center">
              {!isComplete && !initialVideo && (<>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  {uploadState === 'uploading' ? 'Uploading Video' : 'Processing Video'}
                </h3>
                {uploadState === 'uploading' && (
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2 mb-4">
                    <motion.div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
                <p className="text-gray-500 dark:text-gray-400">
                  {uploadState === 'uploading' 
                    ? `Uploading... ${uploadProgress}%`
                    : 'Running advanced threat detection...'}
                </p>
              </>)}
              
              {(isComplete || initialVideo) && (
                <>
                  <video 
                    src={initialVideo || processedVideoUrl} 
                    controls 
                    className="w-full max-w-3xl rounded shadow-lg mx-auto" 
                  />

                  {(initialReport || initialReportUrl || reportRes) && (
                    <div className="mt-6 w-full bg-white dark:bg-dark-700 rounded-lg p-4 shadow flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Detection Report</h3>
                        <a
                          download={`report_${currentVideoId || 'file'}.json`}
                          href={downloadLink}
                          className="bg-primary-500 text-white px-4 py-1.5 rounded hover:bg-primary-600 transition-colors text-sm font-medium"
                        >
                          Download Report
                        </a>
                      </div>

                      <div className="w-full overflow-x-auto bg-gray-50 dark:bg-dark-800 rounded p-3 border text-sm text-gray-700 dark:text-gray-200">
                        <pre className="whitespace-pre-wrap break-words">
                          <code>
                            {typeof (initialReport || reportRes).detection_json === 'string'
                              ? (initialReport || reportRes).detection_json
                              : JSON.stringify((initialReport || reportRes).detection_json, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {uploadState === 'error' && (
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-danger mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Upload Failed</h3>
              <p className="text-danger mb-4">{errorMessage}</p>
              <button
                onClick={resetUpload}
                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default UploadZone;