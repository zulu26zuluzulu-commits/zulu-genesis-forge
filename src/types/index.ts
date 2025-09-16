export type ProjectFile = {
  id: string;
  path: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Tab = {
  id: string;
  fileId: string;
};

export type ProjectSnapshot = {
  files: ProjectFile[];
};

export type AIMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt?: string;
};

export type ProjectSettings = {
  name?: string;
  description?: string;
};
