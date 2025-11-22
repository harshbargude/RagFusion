import React from 'react';

interface BadgeProps {
  icon?: React.ReactNode;
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const Badge: React.FC<BadgeProps> = ({ 
  icon, 
  text, 
  variant = 'default' 
}) => {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-900 dark:bg-gray-800/50 dark:text-gray-200',
    success: 'bg-purple-100 text-purple-900 dark:bg-purple-900/30 dark:text-purple-200',
    warning: 'bg-yellow-100 text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-200',
    error: 'bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200',
  };

  return (
    <div className={`inline-flex items-center justify-center px-4 py-2 mb-8 text-sm font-semibold rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-105 ${variantStyles[variant]}`}>
      {icon && (
        <span className="flex items-center mr-2">
          {icon}
        </span>
      )}
      {variant === 'success' && (
        <span className="flex w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse" />
      )}
      {text}
    </div>
  );
};