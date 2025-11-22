import apiClient from '../../api/client';
import type { ChatRequestPayload, ChatResponsePayload, ChatMessage } from './types';

export const sendChatMessage = async (payload: ChatRequestPayload) => {
  // Calls the backend chat endpoint which is POST /api/v1/chat
  const { data } = await apiClient.post<ChatResponsePayload>('/v1/chat', payload);
  return data;
};

export const sendSessionMessage = async (sessionId: string, content: string) => {
  // POST /api/v1/chat/sessions/{sessionId}/messages
  // Debug: log request details (remove in production)
  // eslint-disable-next-line no-console
  console.debug('[chatApi] POST', `/v1/chat/sessions/${sessionId}/messages`, { content });
  const { data } = await apiClient.post<ChatMessage>(`/v1/chat/sessions/${sessionId}/messages`, { content });
  return data;
};

export const listSessions = async () => {
  const { data } = await apiClient.get('/v1/chat/sessions');
  return data as Array<{ sessionId: string; title?: string; createdAt?: string }>;
};

export const getSessionHistory = async (sessionId: string) => {
  const { data } = await apiClient.get(`/v1/chat/sessions/${sessionId}`);
  return data as Array<{ role: string; content: string; citations?: any[]; timestamp?: string }>;
};

export const deleteSession = async (sessionId: string) => {
  // Debug: log delete request
  // eslint-disable-next-line no-console
  console.debug('[chatApi] DELETE', `/v1/chat/sessions/${sessionId}`);
  const res = await apiClient.delete(`/v1/chat/sessions/${sessionId}`);
  // eslint-disable-next-line no-console
  console.debug('[chatApi] DELETE response', res && res.status, res && res.data);
  return res.data;
};

export const createSessionWithFile = async (file?: File) => {
  // POST /api/v1/chat/sessions/create-with-file
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  const { data } = await apiClient.post<{ sessionId: string; title: string; createdAt: string; fileUploaded?: boolean }>(
    '/v1/chat/sessions/create-with-file',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const uploadDocumentToSession = async (sessionId: string, file: File) => {
  // POST /api/v1/documents/upload-to-session/{sessionId}
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post(
    `/v1/documents/upload-to-session/${sessionId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
};

export const getSessionDocuments = async (sessionId: string) => {
  // GET /api/v1/documents/session/{sessionId}
  const { data } = await apiClient.get(`/v1/documents/session/${sessionId}`);
  return data as Array<any>;
};
