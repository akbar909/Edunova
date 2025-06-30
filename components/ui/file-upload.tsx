'use client';

import { cn } from '@/lib/utils';
import { File, FileImage, FileVideo } from 'lucide-react';
import { useRef, useState } from 'react';

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: string;
  type?: 'video' | 'image' | 'auto';
  className?: string;
}

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  const percent = Math.max(0, Math.min(100, value));
  return (
    <div className={`relative h-3 w-full bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${percent}%` }}
      />
      <span className="absolute inset-0 flex items-center justify-center text-xs text-black font-semibold">
        {percent}%
      </span>
    </div>
  );
}

export function FileUpload({ onUpload, accept, type = 'auto', className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getIcon = () => {
    switch (type) {
      case 'video':
        return <FileVideo className="h-8 w-8 text-gray-400" />;
      case 'image':
        return <FileImage className="h-8 w-8 text-gray-400" />;
      default:
        return <File className="h-8 w-8 text-gray-400" />;
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onUpload(data.url);
        setProgress(100);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleUpload(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files[0]) {
      handleUpload(files[0]);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          uploading && 'pointer-events-none opacity-50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
        title='File input for uploading files'
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={uploading}
        />

        <div className="flex flex-col items-center space-y-4">
          {getIcon()}
          <div>
            <p className="text-sm text-gray-600">
              Drag and drop your file here, or{' '}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 font-medium"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {type === 'video' && 'MP4, WebM up to 100MB'}
              {type === 'image' && 'PNG, JPG, GIF up to 10MB'}
              {type === 'auto' && 'Any file type up to 100MB'}
            </p>
          </div>
        </div>

        {uploading && (
          <div className="mt-4">
            <ProgressBar value={progress} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">Uploading...</p>
          </div>
        )}
      </div>
    </div>
  );
}