
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-64">
      <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-700 rounded-full animate-spin mb-4"></div>
      <p className="text-lg text-gray-300 font-semibold">{message}</p>
    </div>
  );
};

export default Loader;
