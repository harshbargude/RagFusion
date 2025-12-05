import React, { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useParams } from 'react-router-dom';
import type { ChatMessage } from './types';
import sessionStore from './sessionStore';
import sessionService from './sessionService';
import * as chatApi from './chatApi';
import { SessionDocumentUpload } from './SessionDocumentUpload';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { Send, Loader2, User, Sparkles, BookOpen, FileText } from 'lucide-react';
// import { useAuth } from '../auth/useAuth';

export const ChatInterface: React.FC = () => {
  const { sessionId: paramSessionId } = useParams();
  const [sessionId, setSessionId] = useState<string | null>(paramSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialization & Session Logic
  useEffect(() => {
    // Keep local sessionId in sync when the route param changes
    // This ensures clicking a session in the sidebar loads that session here
    if (paramSessionId && paramSessionId !== sessionId) {
      setSessionId(paramSessionId);
      return; // skip creating a new client session
    }
    if (!sessionId) {
      const clientSessionId = crypto?.randomUUID?.() || Math.random().toString(36).slice(2, 9);
      setSessionId(clientSessionId);
      try {
        if (!sessionStore.getSession(clientSessionId)) {
          sessionStore.createSession(clientSessionId, 'New Chat');
        }
      } catch (e) {}
    }
  }, [sessionId, paramSessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    (async () => {
      const msgs = await sessionService.getSessionMessages(sessionId);
      if (mounted) setMessages(msgs.length ? msgs : []);
    })();
    return () => { mounted = false; };
  }, [sessionId]);

  // Load documents for the session
  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    (async () => {
      setLoadingDocuments(true);
      try {
        const docs = await chatApi.getSessionDocuments(sessionId);
        if (mounted) setDocuments(docs || []);
      } catch (err) {
        console.error('Failed to load documents', err);
        if (mounted) setDocuments([]);
      } finally {
        if (mounted) setLoadingDocuments(false);
      }
    })();
    return () => { mounted = false; };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    sessionStore.saveMessages(sessionId, messages);
  }, [messages, sessionId]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || !sessionId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      // Debug: log what's being sent to the backend
      // Check browser devtools Network tab to see the actual request
      // (Remove or reduce logging in production)
      // eslint-disable-next-line no-console
      // console.debug('[ChatInterface] sendMessage:', { sessionId, content: trimmed });
      const assistant = await chatApi.sendSessionMessage(sessionId, trimmed);
      setMessages(prev => [...prev, assistant]);
      
      // Update title if it's the first message
      if (messages.length === 0) {
         const newTitle = trimmed.slice(0, 30);
         sessionStore.renameSession(sessionId, newTitle);
      }
    } catch (err) {
      // console.error('Chat error', err);
      setMessages(prev => [...prev, { id: String(Date.now()), role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const refreshDocuments = async () => {
    if (!sessionId) return;
    setLoadingDocuments(true);
    try {
      const docs = await chatApi.getSessionDocuments(sessionId);
      setDocuments(docs || []);
    } catch (err) {
    } finally {
      setLoadingDocuments(false);
    }
  };


  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 pb-20">
      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-purple-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        How can I help you today?
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        I can analyze your documents, summarize content, or answer questions about your specific knowledge base.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {['Summarize the last report', 'What are the key security protocols?', 'Explain the ingestion pipeline', 'Draft an email based on...'].map((prompt, i) => (
          <button 
            key={i}
            onClick={() => {
              setInput(prompt);
              if (textareaRef.current) textareaRef.current.focus();
            }}
            className="p-4 text-left text-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );

  const MessageItem = ({ m }: { m: ChatMessage }) => {
    const isAi = m.role === 'assistant';
    
    return (
      <div className={`w-full py-6 ${isAi ? 'bg-transparent' : ''}`}>
        <div className="max-w-3xl mx-auto px-4 flex gap-4 sm:gap-6">
          <div className="flex-shrink-0 flex flex-col relative items-end">
            <div className={`
              w-8 h-8 rounded-sm flex items-center justify-center
              ${isAi ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'}
            `}>
              {isAi ? <Sparkles className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-gray-600 dark:text-gray-200" />}
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
              <div className="prose dark:prose-invert max-w-none text-[15px] leading-7 text-gray-800 dark:text-gray-100">
                <div className="max-w-none">
                  <MarkdownRenderer content={m.content} />
                </div>
              </div>

            {'citations' in m && m.citations && Array.isArray((m as any).citations) && (m as any).citations.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                 <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                   <BookOpen className="w-3 h-3" /> Sources
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {(m as any).citations.map((c: any, i: number) => (
                     <div key={i} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 max-w-xs text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                       <div className="font-medium text-purple-600 dark:text-purple-400 truncate">{c.title || c.source}</div>
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      
      <div className="flex-1 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col pb-32 pt-4">
            {messages.map((m) => (
              <MessageItem key={m.id} m={m} />
            ))}
            
            {isLoading && (
              <div className="w-full py-6">
                <div className="max-w-3xl mx-auto px-4 flex gap-6">
                  <div className="w-8 h-8 rounded-sm bg-green-500 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 h-8">
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {documents.length > 0 && (
        <div className="border-t-2 border-purple-300 dark:border-purple-600 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-950/30 dark:to-transparent px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Session Documents ({documents.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-700 border-2 border-purple-200 dark:border-purple-600 rounded-lg px-3 py-2 text-sm shadow-sm hover:shadow-md transition-shadow"
              >
                <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-xs">
                  {doc.fileName}
                </span>
                {doc.fileSize && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                    {(doc.fileSize / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sessionId && <SessionDocumentUpload sessionId={sessionId} onUploadSuccess={refreshDocuments} />}

      {/* INPUT AREA */}
      <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-white via-white to-transparent dark:from-[#212121] dark:via-[#212121] pb-6 pt-10 px-4">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end w-full p-3 bg-white dark:bg-[#2F2F2F] border border-gray-200 dark:border-gray-600 rounded-2xl shadow-lg ring-offset-2 focus-within:ring-2 ring-purple-500/50">
            
            <button
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.pdf,.txt,.csv,.xlsx,.doc,.docx';
                fileInput.onchange = async (e: any) => {
                  const file = e.target.files?.[0];
                  if (file && sessionId) {
                    try {
                      await chatApi.uploadDocumentToSession(sessionId, file);
                      await refreshDocuments();
                    } catch (err) {
                      console.error('Upload failed', err);
                    }
                  }
                };
                fileInput.click();
              }}
              className="mr-2 p-2 rounded-lg text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Upload document"
            >
              <FileText className="w-5 h-5" />
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Message RAG Chat..."
              className="flex-1 max-h-[200px] min-h-6 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 py-2 px-2 scrollbar-hide"
            />

            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`
                ml-2 p-2 rounded-lg transition-all duration-200
                ${input.trim() ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}
              `}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="text-center mt-2 text-xs text-gray-400 dark:text-gray-500">
            RAG Chat can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
      
    </div>
  );
};