import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../Button';
import { Badge } from '../ui/Badge';

interface HeroSectionProps {
  user: any;
  isAuthenticated: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ user, isAuthenticated }) => {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-24 animate-fade-in">
      {/* Version Badge */}
      <Badge 
        icon={<Sparkles className="w-3 h-3" />}
        text="v2.0 is now live"
        variant="success"
      />

      {/* Main Heading with Gradient Animation */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
        Welcome to{' '}
        <span className="relative inline-block">
          <span className="absolute -inset-1 blur-2xl bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 opacity-30 animate-pulse" />
          <span className="relative bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent bg-300% animate-gradient">
            RAGFusion
          </span>
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
        {isAuthenticated ? (
          <>
            Hello, <span className="font-semibold text-purple-600 dark:text-purple-400">{user?.firstName || 'User'}</span>! 
            You're ready to unlock the power of your documents.
          </>
        ) : (
          <>
            Transform your document workflow with <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">AI-powered retrieval</span>. 
            Upload PDF, Docx, or Txt and chat with your data instantly.
          </>
        )}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
        {!isAuthenticated ? (
          <>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/register')}
              className="group w-full sm:w-auto shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white/70 backdrop-blur-md dark:bg-gray-800/70 border-2 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
            >
              Sign In
            </Button>
          </>
        ) : (
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => navigate('/dashboard')}
            className="group w-full sm:w-auto shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>99.9% Uptime</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm-1 15l-5-5 1.41-1.41L9 12.17l7.59-7.59L18 6l-9 9z"/>
          </svg>
          <span>Enterprise-Grade Security</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered</span>
        </div>
      </div>
    </div>
  );
};