import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft, Upload, X, Loader2, File } from 'lucide-react';
import sessionService from './sessionService';
import sessionStore from './sessionStore';
import { ChatInterface } from './ChatInterface';
import * as chatApi from './chatApi';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../auth/useAuth';

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2, 9);
};

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (sessionId: string) => void;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose, onSessionCreated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleCreateSession = async () => {
    setUploading(true);
    try {
      const result = await chatApi.createSessionWithFile(file || undefined);
      showToast('Session created successfully', 'success');
      sessionStore.createSession(result.sessionId, result.title || 'New Chat');
      onSessionCreated(result.sessionId);
      handleClose();
    } catch (error) {
      console.error('Failed to create session', error);
      showToast('Failed to create session', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Chat</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optionally upload a document to start your session with relevant content.
          </p>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept=".csv,.xlsx,.txt,.pdf"
              className="hidden"
              disabled={uploading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">Choose File (Optional)</span>
            </button>
          </div>

          {file && (
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
              <File className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSession}
            disabled={uploading}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Create Chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId: paramId } = useParams();
  const [sessions, setSessions] = useState<Array<any>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user} = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await sessionService.listSessions();
      if (mounted) setSessions(list);
    })();
    return () => { mounted = false; };
  }, [paramId]); // Refresh list when navigating

  const createNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleSessionCreated = (sessionId: string) => {
    setSessions(sessionStore.listSessions());
    navigate(`/chat/${sessionId}`);
  };

  const select = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const remove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // Confirm with the user before deleting
    const confirm = window.confirm('Delete this chat and all its messages? This action cannot be undone.');
    if (!confirm) return;
    try {
      // Attempt server delete (if authenticated) and always remove locally
      // Log for debugging
      // eslint-disable-next-line no-console
      // console.debug('[ChatLayout] deleting session', id);
      await sessionService.deleteSession(id);
      // Ensure immediate UI update from local store to avoid reappearing if remote still lists it
      const localList = sessionStore.listSessions();
      setSessions(localList);
      showToast?.('Chat deleted', 'success');
      if (paramId === id) navigate('/chat');
    } catch (err) {
      // console.error('Failed to delete session', err);
      showToast?.('Failed to delete chat', 'error');
    }
  };

  const currentId = paramId || null;

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#212121] text-gray-900 dark:text-gray-100 overflow-hidden font-sans">
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />
      {/* SIDEBAR */}
      <aside 
        className={`
          shrink-0 bg-black text-gray-200 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-[260px]' : 'w-0'} 
          flex flex-col border-r border-white/10
        `}
      >
        <div className="p-3">
          <button 
            onClick={createNew} 
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-sm text-white"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 scrollbar-hide">
          <div className="text-xs font-medium text-gray-500 py-2 px-2">History</div>
          {sessions.map((s) => (
            <div 
              key={s.id} 
              onClick={() => select(s.id)}
              className={`
                group flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-colors
                ${s.id === currentId ? 'bg-[#2F2F2F] text-white' : 'text-gray-400 hover:bg-[#2F2F2F] hover:text-white'}
              `}
            >
              <MessageSquare className="w-4 h-4" />
              <div className="flex-1 truncate overflow-hidden">{s.title || 'New Chat'}</div>
              {/* Delete appears on hover */}
              <button 
                onClick={(e) => remove(e, s.id)}
                className="opacity-10 group-hover:opacity-50 text-gray-400 hover:text-white transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile Section (Static for now) */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
              {user?.firstName.charAt(0).toUpperCase()}{user?.lastName.charAt(0).toUpperCase()  }
            </div>
            {/* <div className="text-sm font-medium">John Doe</div> */}
            <span className="text-sm font-medium">{user?.firstName} {user?.lastName }</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full relative bg-white dark:bg-[#212121]">
        {/* Mobile/Collapse Toggle */}
        <div className="absolute top-4 left-4 z-20">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
           >
             {isSidebarOpen ? <PanelLeftClose className="w-5 h-5"/> : <PanelLeft className="w-5 h-5"/>}
           </button>
        </div>

        <ChatInterface key={currentId || 'root'} />
      </main>
    </div>
  );
};