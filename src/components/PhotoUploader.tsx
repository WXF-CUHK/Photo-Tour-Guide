import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, RefreshCw, Image as ImageIcon, AlertCircle } from "lucide-react";

interface PhotoUploaderProps {
  onPhotoSelected: (base64Data: string, mimeType: string) => void;
  isLoading: boolean;
}

export function PhotoUploader({ onPhotoSelected, isLoading }: PhotoUploaderProps) {
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileMime, setFileMime] = useState<string>("image/jpeg");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream when component unmounts or view changes
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    setUseCamera(true);
    setPreview(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "Could not access your camera. Please check your browser permissions, or switch to file upload instead."
      );
      setUseCamera(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL("image/jpeg");
      const mime = "image/jpeg";
      setPreview(base64Data);
      
      // Extract pure base64 (remove prefix)
      const pureBase64 = base64Data.split(",")[1];
      setFileMime(mime);
      onPhotoSelected(pureBase64, mime);
      stopCamera();
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      // Extract pure base64
      const pureBase64 = result.split(",")[1];
      setFileMime(file.type);
      onPhotoSelected(pureBase64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    if (useCamera) {
      startCamera();
    } else if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {/* Selection Mode Tabs */}
      <div className="flex border-b border-black/10 dark:border-white/10 mb-6 bg-black/5 dark:bg-white/5 p-1 rounded-sm">
        <button
          onClick={() => {
            stopCamera();
            setUseCamera(false);
            setCameraError(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all ${
            !useCamera && !preview
              ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs"
              : "text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
          }`}
          disabled={isLoading}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Plate
        </button>
        <button
          onClick={startCamera}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all ${
            useCamera || (preview && useCamera)
              ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs"
              : "text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
          }`}
          disabled={isLoading}
        >
          <Camera className="w-3.5 h-3.5" />
          Live Camera lens
        </button>
      </div>

      {/* Main interactive upload/camera area */}
      <div className="relative overflow-hidden rounded-sm border border-black/10 dark:border-white/10 bg-[#E8E6E1]/40 dark:bg-zinc-950 aspect-video flex flex-col items-center justify-center p-6 text-center transition-all">
        
        {/* Preview State */}
        {preview && (
          <div className="absolute inset-0 w-full h-full bg-[#1A1A1A] z-10 scan-glow">
            <img
              src={preview}
              alt="Snapshot preview"
              className="w-full h-full object-contain mix-blend-normal opacity-95"
            />
            
            {/* Overlay buttons */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 z-20">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-100 text-black font-bold text-[10px] uppercase tracking-widest rounded-sm transition shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retake Lens capture
              </button>
            </div>
          </div>
        )}

        {/* Live Camera State */}
        {useCamera && !preview && (
          <div className="absolute inset-0 w-full h-full bg-black flex flex-col z-10">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full flex-1 object-cover"
            />
            <div className="py-4 bg-zinc-950 flex justify-center items-center gap-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="w-14 h-14 rounded-full border-4 border-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center shadow-lg"
                title="Capture Photo"
              />
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setUseCamera(false);
                }}
                className="px-4 py-2 border border-white/20 hover:border-white text-white rounded-none text-xs tracking-widest uppercase font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Drag and Drop Zone State */}
        {!useCamera && !preview && (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-colors ${
              dragActive ? "bg-[#DFDBD3]/60 dark:bg-zinc-900 border-2 border-dashed border-[#8C7851]" : ""
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            <div className="p-3.5 border border-black/5 dark:border-white/5 bg-[#FBF9F4] dark:bg-zinc-900 rounded-full text-[#8C7851] mb-4 shadow-xs">
              <ImageIcon className="w-6 h-6" />
            </div>

            <p className="text-black dark:text-[#FDFCF8] text-xs uppercase tracking-wider font-semibold mb-2">
              Drop Scenic Image here or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#8C7851] font-bold hover:underline bg-transparent"
                disabled={isLoading}
              >
                Browse Plates
              </button>
            </p>
            <p className="text-black/40 dark:text-white/40 text-[10px] uppercase tracking-widest">
              JPEG, PNG, WEBP, or HEIC (Up to 15MB)
            </p>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="mt-4 flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-sm text-xs leading-normal">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}
    </div>
  );
}
