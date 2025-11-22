import React from 'react';
import { useAuth } from '../features/auth/useAuth';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FileText, Zap, Shield, ArrowRight } from 'lucide-react';

// Static data moved outside component for performance
const FEATURES = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'AI-Powered RAG',
    description: 'Retrieval-Augmented Generation for intelligent document processing.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Document Management',
    description: 'Upload, organize, and search through your documents effortlessly.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Fast & Efficient',
    description: 'Lightning-fast search and retrieval with optimized performance.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Secure & Private',
    description: 'Your data is encrypted and protected with enterprise-grade security.',
  },
];

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 selection:bg-purple-500 selection:text-white">
      
      {/* --- Background Ambient Blobs (Visual Polish) --- */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:opacity-20"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:opacity-20"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        
        {/* --- Hero Section --- */}
        <div className="text-center mb-20">
          {/* Badge for mobile appeal */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium text-purple-900 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-200">
            <span className="flex w-2 h-2 bg-purple-600 rounded-full mr-2 animate-pulse"></span>
            v2.0 is now live
          </div>

          {/* Responsive Typography: text-4xl on mobile, 6xl on desktop */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 bg-clip-text text-transparent bg-300% animate-gradient">
              RAGFusion
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            {isAuthenticated
              ? `Hello, ${user?.firstName || 'User'}! You are logged in and ready to unlock the power of your documents.`
              : 'Transform your document workflow with AI-powered retrieval. Upload PDF, Docx, or Txt and chat with your data instantly.'}
          </p>

          {/* CTA Buttons with Hover Effects */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto bg-white/50 backdrop-blur-sm dark:bg-gray-800/50"
                >
                  Sign In
                </Button>
              </>
            ) : (
              <Button 
                variant="primary" 
                size="lg" 
                onClick={() => navigate('/chat')}
                className="w-full sm:w-auto shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                Go to Chat
                <ArrowRight className="ml-[45%] w-4 h-4 " />
              </Button>
            )}
          </div>
        </div>

        {/* --- Features Grid --- */}
        {/* Glassmorphism applied to cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20">
          {FEATURES.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white/70 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-300 mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- Secondary CTA Section (Bottom) --- */}
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-90"></div>
          <div className="relative px-6 py-16 sm:px-12 sm:py-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to streamline your workflow?
            </h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users leveraging RAGFusion for smarter document management.
            </p>
            <button 
              onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
              className="px-8 py-3.5 text-sm font-bold text-purple-600 bg-white rounded-full shadow-xl hover:bg-gray-50 transition-colors transform hover:scale-105 active:scale-95"
            >
              {isAuthenticated ? 'View Your Profile' : 'Create Free Account'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};