export interface Citation {
  title: string;
  snippet: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export interface ChatRequestPayload {
  sessionId: string;
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>;
}

export interface ChatResponsePayload {
  sessionId: string;
  message: Pick<ChatMessage, 'role' | 'content'>;
  citations: Citation[];
}


