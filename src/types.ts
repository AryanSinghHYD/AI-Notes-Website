export interface Note {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
  aiSummary?: string;
  aiCategories?: string[];
  dueDate?: Date;
  completed?: boolean;
}

export interface AppState {
  notes: Note[];
  apiKey: string | null;
}