import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, bucket = 'images', className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      if (!acceptedFiles || acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please make sure the storage bucket exists and is public.');
    } finally {
      setUploading(false);
    }
  }, [onChange, bucket]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 group bg-gray-50 flex items-center justify-center">
          <img src={value} alt="Uploaded" className="max-h-64 object-contain w-full" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-lg text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[160px] ${
            isDragActive ? 'border-[#f47c20] bg-orange-50' : 'border-gray-300 hover:border-[#111111] bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex flex-col items-center text-[#f47c20]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-medium">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragActive ? "Drop the image here" : "Click or drag image to upload"}
              </p>
              <p className="text-xs text-gray-400">Supports JPG, PNG, WebP (Max 5MB)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
