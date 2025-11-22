import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  index 
}) => {
  return (
    <div 
      className="group relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
      
      {/* Card Content */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-2xl">
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-blue-600/0 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative flex flex-col items-center text-center">
          {/* Icon Container */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-purple-100 via-blue-50 to-blue-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              {icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>

          {/* Decorative Element */}
          <div className="mt-6 w-12 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  );
};