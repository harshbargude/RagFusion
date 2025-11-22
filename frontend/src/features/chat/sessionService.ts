import { storageUtils, STORAGE_KEYS } from '../../utils/storage';
import sessionStore from './sessionStore';
import * as chatApi from './chatApi';

const hasAuth = () => !!storageUtils.get<string>(STORAGE_KEYS.TOKEN);

export const listSessions = async () => {
  if (hasAuth()) {
    try {
      const remote = await chatApi.listSessions();
      // normalize
      return remote.map((r: any) => ({ id: r.sessionId, title: r.title || 'Chat', createdAt: r.createdAt }));
    } catch (e) {
      // fallback
      return sessionStore.listSessions();
    }
  }
  return sessionStore.listSessions();
};

export const createSession = (id: string, title = 'New chat') => {
  // create locally; backend will create on first message if authenticated
  return sessionStore.createSession(id, title);
};

export const deleteSession = async (id: string) => {
  // Always attempt to delete remotely first. If it fails (network/auth), still remove locally
  try {
    await chatApi.deleteSession(id);
  } catch (e) {
    // Log and continue to remove locally
    // eslint-disable-next-line no-console
    console.debug('[sessionService] remote delete failed, falling back to local delete', id, e);
  }
  sessionStore.deleteSession(id);
};

export const getSessionMessages = async (id: string) => {
  if (hasAuth()) {
    try {
      const remote = await chatApi.getSessionHistory(id);
      // convert to message shape used by UI
      return remote.map((m: any, idx: number) => ({ id: `${id}-${idx}-${m.timestamp || ''}`, role: m.role, content: m.content, citations: m.citations || [] }));
    } catch (e) {
      return sessionStore.getMessages(id);
    }
  }
  return sessionStore.getMessages(id);
};

export default {
  listSessions,
  createSession,
  deleteSession,
  getSessionMessages,
};
