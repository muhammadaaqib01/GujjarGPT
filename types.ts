export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
}

export interface GroundingChunkWeb {
    uri: string;
    title: string;
}

export interface GroundingChunk {
    web: GroundingChunkWeb;
}

export interface Attachment {
    mimeType: string;
    data: string; // base64 encoded string without the data URI prefix
}

export interface ChatMessage {
  id: string;
  timestamp: string;
  role: MessageRole;
  text: string;
  sources?: GroundingChunk[];
  imageUrl?: string;
  attachments?: Attachment[];
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
}

export interface UserProfile {
    name: string;
    avatar?: string;
}
