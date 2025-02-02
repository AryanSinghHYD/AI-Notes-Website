import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { loadState, saveState } from './utils/storage';
import { analyzeNote } from './utils/gemini';
import { AppState, Note } from './types';
import { Settings } from 'lucide-react';

function App() {
  const [state, setState] = useState<AppState>(loadState());
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(!state.apiKey);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleApiKeySubmit = (apiKey: string) => {
    setState(prev => ({ ...prev, apiKey }));
    setError(null);
    setShowApiKeyModal(false);
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
        venue: analysis.venue,
        author: analysis.author,
        completed: false
      };

      setState(prev => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));
      setError(null);
    } catch (error) {
      console.error('Failed to analyze note:', error);
      setError('Failed to analyze note. Please try again.');
      
      // Still add the note without AI analysis
      const newNote: Note = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
        tags: ['note'],
        completed: false
      };

      setState(prev => ({
        ...prev,
        notes: [newNote, ...prev.notes],
      }));
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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            {error}
          </div>
        )}
        {/* Settings Button */}
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="fixed bottom-4 left-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 z-40"
          title="Change API Key"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        {showApiKeyModal && (
          <ApiKeyModal 
            onSubmit={handleApiKeySubmit}
            initialValue={state.apiKey || ''}
            onClose={() => state.apiKey && setShowApiKeyModal(false)}
          />
        )}
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
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App