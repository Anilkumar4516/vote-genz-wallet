/**
 * Browser Camera & Video Frame Capture Utilities for Facial Liveness
 */

export interface CameraStreamOptions {
  videoElement: HTMLVideoElement;
  width?: number;
  height?: number;
}

export async function startCameraStream({
  videoElement,
  width = 640,
  height = 480,
}: CameraStreamOptions): Promise<MediaStream> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera access is not supported by your browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: width },
      height: { ideal: height },
      facingMode: 'user',
    },
    audio: false,
  });

  videoElement.srcObject = stream;
  await videoElement.play();
  return stream;
}

export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => track.stop());
}

export function captureVideoFrame(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to create 2D canvas context for frame capture.');
  }

  // Draw current video frame to canvas
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

  // Return base64 JPEG
  return canvas.toDataURL('image/jpeg', 0.85).replace(/^data:image\/jpeg;base64,/, '');
}
