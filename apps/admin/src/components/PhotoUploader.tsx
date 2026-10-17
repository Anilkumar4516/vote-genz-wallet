'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotoSelected: (base64Image: string) => void;
  initialPhotoUrl?: string;
  label?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotoSelected,
  initialPhotoUrl,
  label = 'Voter Identity Photograph',
}) => {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      const base64 = result.replace(/^data:image\/[a-z]+;base64,/, '');
      onPhotoSelected(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onPhotoSelected('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        {label}
      </label>

      {preview ? (
        <div className="relative w-36 h-44 rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-surface-200 shadow-lg group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Voter Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute top-2 right-2 p-1 rounded-full bg-emerald-500 text-white shadow">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-80 h-36 border-2 border-dashed border-slate-700 hover:border-cyan-400/60 rounded-2xl bg-surface-200/50 hover:bg-surface-100 flex flex-col items-center justify-center p-4 cursor-pointer transition-colors text-center"
        >
          <Upload className="w-7 h-7 text-cyan-400 mb-2" />
          <span className="text-xs font-semibold text-white">Click or drag photo to upload</span>
          <span className="text-[10px] text-slate-400 mt-1">JPEG or PNG, passport standard portrait</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
