import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
}

export const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Attendance Selfie',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCameraError(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError(
        'Unable to access webcam. Please ensure camera permissions are enabled in your browser settings.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-600" />
          <span>{title}</span>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={handleRetake} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Retake
              </Button>
              <Button variant="primary" onClick={handleConfirm} leftIcon={<Check className="w-4 h-4" />}>
                Use Photo
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={handleSnap}
              disabled={!!cameraError || !stream}
              leftIcon={<Camera className="w-4 h-4" />}
            >
              Take Photo
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col items-center justify-center">
        {cameraError ? (
          <div className="flex flex-col items-center p-6 text-center text-rose-600 bg-rose-50 rounded-xl">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p className="text-xs">{cameraError}</p>
          </div>
        ) : capturedImage ? (
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-4/3 w-full max-w-sm">
            <img src={capturedImage} alt="Captured Attendance Selfie" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-md aspect-4/3 w-full max-w-sm flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
            <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-2xl pointer-events-none m-4" />
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Modal>
  );
};
