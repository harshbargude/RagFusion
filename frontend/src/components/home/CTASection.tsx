import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface CTASectionProps {
  isAuthenticated: boolean;
}

export const CTASection: React.FC<CTASectionProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const benefits = [
    'No credit card required',
    'Free forever plan available',
    'Cancel anytime',
    '24/7 support'
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-300% animate-gradient" />
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="relative px-6 py-16 sm:px-12 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to transform your workflow?
        </h2>
        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
          Join over <span className="font-bold text-white">50,000+ users</span> leveraging RAGFusion for smarter, faster document management.
        </p>

        {/* Benefits List */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button 
          onClick={() => navigate(isAuthenticated ? '/profile' : '/register')}
          className="group inline-flex items-center gap-3 px-10 py-4 text-base font-bold text-purple-600 bg-white rounded-full shadow-2xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          {isAuthenticated ? 'View Your Profile' : 'Create Free Account'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-6 text-sm text-blue-100">
          Start in seconds. No downloads required.
        </p>
      </div>
    </div>
  );
};