import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose,
  duration = 2000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  const Icon = type === 'success' ? Check : X;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right-full duration-300">
      <div className={`${bgColor} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 max-w-sm`}>
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
        aria-label="bouton"
          onClick={onClose}
          className="ml-2 hover:bg-white/20 rounded p-1"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};