export interface KnowledgeSourceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  selected: boolean;
  children?: KnowledgeSourceFile[];
  expanded?: boolean;
  hidden?: boolean;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  files: KnowledgeSourceFile[];
  selectedSize: number;
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  knowledgeSources: KnowledgeSource[];
}

export enum AgentType {
  CHAT = 'chat',
  ASSISTANT = 'assistant',
  AUTOMATION = 'automation'
} 