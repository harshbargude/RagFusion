import React, { useState } from 'react';
import { DocumentUpload } from '../components/DocumentUpload';
import { Key, Eye, EyeOff, Save, CloudUpload, ShieldAlert, Check } from 'lucide-react';

function Settings() {
  // State for interactivity
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    // Simulate a save action
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    // TODO: Add actual logic to save to Context or LocalStorage
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="text-center sm:text-left border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Settings
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Manage your API keys and document knowledge base.
          </p>
        </div>

        {/* --- API Key Section --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-4">
                <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gemini API Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Required for the RAG engine to process your queries.
                </p>
              </div>
            </div>

            {/* Security Warning */}
            <div className="mb-6 flex items-start p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Your API key is stored locally in your browser for development purposes. 
                Never commit this key to public repositories.
              </p>
            </div>

            {/* Input Group */}
            <div className="max-w-xl">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type={showKey ? 'text' : 'password'}
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="block w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
                  placeholder="AIzaSy..."
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={!apiKey}
                className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 
                  ${isSaved 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved Successfully
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* --- Document Upload Section --- */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                <CloudUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Knowledge Base
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload documents to train your personal RAG model.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-1 border border-dashed border-gray-300 dark:border-gray-700">
               {/* Assuming DocumentUpload handles its own internal styling, 
                   but wrapping it here ensures it sits nicely in the grid */}
               <DocumentUpload />
            </div>
            
            <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">
              Supported formats: .pdf, .txt, .csv, .xlsx (Max 10MB)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;