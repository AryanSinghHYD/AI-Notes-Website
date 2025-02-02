export interface Note {
  id: string;
  content: string;
  timestamp: string;
  tags: string[];
  aiSummary?: string;
  aiCategories?: string[];
  dueDate?: Date;
  completed?: boolean;
  venue?: string;
  author?: string;
}

export interface AppState {
  notes: Note[];
  apiKey: string | null;
}