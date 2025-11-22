import React from 'react';
import { Sparkles, FileText, Zap, Shield, Brain, Lock, Cloud, Users } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const FEATURES = [
  {
    icon: <Brain className="w-7 h-7" />,
    title: 'AI-Powered RAG',
    description: 'Retrieval-Augmented Generation for intelligent document processing and contextual understanding.',
  },
  {
    icon: <FileText className="w-7 h-7" />,
    title: 'Smart Document Management',
    description: 'Upload, organize, and search through your documents with intelligent categorization.',
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: 'Lightning Fast',
    description: 'Optimized performance with sub-second search and retrieval across millions of documents.',
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and compliance with SOC 2, GDPR, and HIPAA standards.',
  },
  {
    icon: <Lock className="w-7 h-7" />,
    title: 'Privacy First',
    description: 'Your data stays yours. Zero-knowledge architecture ensures complete privacy.',
  },
  {
    icon: <Cloud className="w-7 h-7" />,
    title: 'Cloud Native',
    description: 'Seamlessly scalable infrastructure that grows with your needs.',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Team Collaboration',
    description: 'Share documents and insights with your team in real-time.',
  },
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: 'Auto-Insights',
    description: 'AI automatically extracts key insights, summaries, and action items.',
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <div className="mb-24">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Everything you need to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
            supercharge
          </span>
          {' '}your workflow
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Powerful features designed for modern teams and individuals
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {FEATURES.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};