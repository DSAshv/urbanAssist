// src/components/ui/ImageViewer.tsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface ImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

// Make sure you have the 'export' keyword here
export const ImageViewer: React.FC<ImageViewerProps> = ({ imageUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-[1000] flex items-center justify-center p-4">
      <div className="relative max-w-full max-h-full">
        <img src={imageUrl} alt="Full size" className="max-w-full max-h-[90vh]" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
        >
          <FaTimes size={24} />
        </button>
      </div>
    </div>
  );
};