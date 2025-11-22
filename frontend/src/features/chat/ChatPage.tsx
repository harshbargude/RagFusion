import React, { useMemo, useRef, useState, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Loader2 } from 'lucide-react';
import { sendChatMessage } from './chatApi';
import type { ChatMessage, ChatRequestPayload, Citation } from './types';

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 10);
};

const systemIntro: ChatMessage = {
  id: 'intro',
  role: 'assistant',
  content:
    'I am your RAG assistant. Ask me about the RAGFusion platform, ingestion pipeline, or how we secure your documents.',
};

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([systemIntro]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const sessionId = useMemo(() => createId(), []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
    };

    const optimisticMessages = [...messages, userMessage];
    setMessages(optimisticMessages);
    setInput('');
    setIsLoading(true);

    const payload: ChatRequestPayload = {
      sessionId,
      messages: optimisticMessages.map(({ role, content }) => ({ role, content })),
    };

    try {
      const response = await sendChatMessage(payload);
      const assistantMessage: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: response.message.content,
        citations: response.citations,
      };
      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      console.error('Chat request failed', error);
      const fallback: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content:
          'I had trouble contacting the knowledge base. Please check your connection and try again.',
      };
      setMessages((previous) => [...previous, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCitations = (citations: Citation[] | undefined) => {
    if (!citations || citations.length === 0) {
      return null;
    }
    return (
      <div className="mt-3 border-l-2 border-purple-300 dark:border-purple-500 pl-3 space-y-2 text-sm text-purple-900 dark:text-purple-200">
        {citations.map((citation, index) => (
          <div key={`${citation.source}-${index}`}>
            <p className="font-semibold">{citation.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{citation.snippet}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{citation.source}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RAG Assistant</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Chat with your knowledge base using Retrieval-Augmented Generation.
          </p>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center space-x-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Start a conversation to retrieve answers grounded in your documents.
          </span>
        </div>

        <div className="h-[480px] overflow-y-auto px-6 py-6 space-y-6 bg-gray-50 dark:bg-gray-900">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div
                className={`max-w-3xl rounded-2xl px-4 py-3 shadow-sm ${
                  message.role === 'assistant'
                    ? 'bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                    : 'bg-purple-600 text-white ml-auto'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'assistant' && renderCitations(message.citations)}
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-100 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about ingestion, search, security..."
                rows={1}
                className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <MessageSquare className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-white font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="ml-2">{isLoading ? 'Thinking...' : 'Send'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


