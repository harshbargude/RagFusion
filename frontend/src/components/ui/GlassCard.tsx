import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  hover = true 
}) => {
  return (
    <div className={`
      relative bg-white/70 dark:bg-gray-800/70 
      backdrop-blur-xl 
      border border-gray-200/50 dark:border-gray-700/50 
      rounded-2xl 
      shadow-lg 
      ${hover ? 'hover:shadow-2xl hover:-translate-y-1' : ''}
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
};