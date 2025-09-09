export enum AppScreen {
  Home = 'HOME',
  Builder = 'BUILDER',
}

export enum GenerationMode {
  Prompt = 'PROMPT',
  URL = 'URL',
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  groq: string;
  firecrawl: string;
  e2b: string;
}

export type SandboxState = 'idle' | 'connecting' | 'running' | 'error';

export interface AppContextType {
  code: string;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  logs: string[];
  apiKeys: ApiKeys;
  sandboxState: SandboxState;
  sandboxUrl: string | null;
  startGeneration: (mode: GenerationMode, input: string) => Promise<void>;
  refineCode: (message: string) => Promise<void>;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  saveApiKeys: (keys: ApiKeys) => void;
  startSandbox: () => Promise<void>;
  stopSandbox: () => Promise<void>;
}
