export type DocumentRecord = {
  id: string;
  title: string;
  storageKey: string;
  fileUrl: string;
  contentType?: string | null;
  status: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  sessionId?: string;
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RetrievedChunk = {
  id: string;
  score: number;
  payload?: {
    fileName?: string;
    text?: string;
    fileUrl?: string;
  };
};
