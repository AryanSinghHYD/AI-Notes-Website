import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { loadState, saveState } from './utils/storage';
import { analyzeNote } from './utils/gemini';
import { AppState, Note } from './types';

function App() {
  const [state, setState] = useState<AppState>(loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleApiKeySubmit = (apiKey: string) => {
    setState(prev => ({ ...prev, apiKey }));
  };

  const handleAddNote = async (content: string) => {
    if (!state.apiKey) return;

    try {
      const analysis = await analyzeNote(content, state.apiKey);
      
      const newNote: Note = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
        tags: analysis.tags,
        aiSummary: analysis.summary,
        aiCategories: analysis.categories,
        dueDate: analysis.dueDate,
        completed: false
      };

      setState(prev => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));
    } catch (error) {
      console.error('Failed to analyze note:', error);
    }
  };

  const handleDeleteNote = (id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(note => note.id !== id)
    }));
  };

  const handleCompleteNote = (id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.map(note =>
        note.id === id ? { ...note, completed: !note.completed } : note
      )
    }));
  };

  if (!state.apiKey) {
    return <ApiKeyModal onSubmit={handleApiKeySubmit} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                notes={state.notes} 
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onCompleteNote={handleCompleteNote}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
