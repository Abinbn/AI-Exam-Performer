
import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center p-10 bg-white rounded-lg shadow-lg">
    <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    <p className="mt-6 text-lg font-semibold text-slate-700">{message}</p>
  </div>
);

export default LoadingSpinner;
