type Session = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

const SESSIONS_KEY = 'rag_chat_sessions_v1';
const MESSAGES_KEY_PREFIX = 'rag_chat_messages_v1:';

const nowIso = () => new Date().toISOString();

export const listSessions = (): Session[] => {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Session[];
  } catch (e) {
    console.error('Failed to read sessions', e);
    return [];
  }
};

export const saveSessions = (sessions: Session[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

export const createSession = (id: string, title = 'New chat'): Session => {
  const s: Session = { id, title, createdAt: nowIso(), updatedAt: nowIso() };
  const sessions = listSessions();
  sessions.unshift(s);
  saveSessions(sessions);
  // initialize empty messages
  saveMessages(id, []);
  return s;
};

export const renameSession = (id: string, title: string) => {
  const sessions = listSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) return;
  sessions[idx].title = title;
  sessions[idx].updatedAt = nowIso();
  saveSessions(sessions);
};

export const deleteSession = (id: string) => {
  const sessions = listSessions().filter((s) => s.id !== id);
  saveSessions(sessions);
  localStorage.removeItem(MESSAGES_KEY_PREFIX + id);
};

export const getMessages = (sessionId: string) => {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY_PREFIX + sessionId);
    if (!raw) return [] as any[];
    return JSON.parse(raw) as any[];
  } catch (e) {
    console.error('Failed to read messages', e);
    return [] as any[];
  }
};

export const saveMessages = (sessionId: string, messages: any[]) => {
  localStorage.setItem(MESSAGES_KEY_PREFIX + sessionId, JSON.stringify(messages));
  // update session updatedAt and move to front
  const sessions = listSessions();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx !== -1) {
    sessions[idx].updatedAt = nowIso();
    const s = sessions.splice(idx, 1)[0];
    sessions.unshift(s);
    saveSessions(sessions);
  }
};

export const getSession = (id: string) => listSessions().find((s) => s.id === id) || null;

export default {
  listSessions,
  createSession,
  getMessages,
  saveMessages,
  renameSession,
  deleteSession,
  getSession,
};
