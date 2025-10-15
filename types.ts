
export enum AppView {
  Dashboard = 'DASHBOARD',
  Chat = 'CHAT',
  MemoryLane = 'MEMORY_LANE',
  KnowledgeBase = 'KNOWLEDGE_BASE',
  Settings = 'SETTINGS'
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface Memory {
  id: string;
  content: string;
  date: string;
  tags: string[];
}

export enum KnowledgeItemType {
  URL = 'URL',
  PDF = 'PDF'
}

export interface KnowledgeItem {
  id: string;
  type: KnowledgeItemType;
  title: string;
  summary: string;
  source: string; // URL or file name
  dateAdded: string;
}
