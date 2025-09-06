import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const dragDropClasses = isDragging
    ? 'border-indigo-500 bg-gray-800'
    : 'border-gray-600 hover:border-indigo-500';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
      <div
        className={`w-full max-w-2xl p-8 sm:p-12 border-2 border-dashed rounded-xl transition-colors duration-300 ${dragDropClasses}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-xl font-semibold text-gray-200 mb-2">Drag and drop your PDF here</p>
          <p className="text-gray-400 mb-6">or</p>
          <label
            htmlFor="file-upload"
            className="cursor-pointer bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            Browse File
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500 mt-6">Max file size: 50MB</p>
        </div>
      </div>
      {error && (
        <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg w-full max-w-2xl text-center">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;