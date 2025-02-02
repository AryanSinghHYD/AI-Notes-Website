import React, { useState } from 'react';
import { Plus, Search, X, PenSquare } from 'lucide-react';
import { Note } from '../types';
import { NoteCard } from '../components/NoteCard';

interface DashboardProps {
  notes: Note[];
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (id: string) => void;
  onCompleteNote: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  notes, 
  onAddNote, 
  onDeleteNote, 
  onCompleteNote 
}) => {
  const [newNote, setNewNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWriting, setIsWriting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.content.toLowerCase().includes(searchLower) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      note.aiSummary?.toLowerCase().includes(searchLower) ||
      note.venue?.toLowerCase().includes(searchLower) ||
      note.author?.toLowerCase().includes(searchLower)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      await onAddNote(newNote);
      setNewNote('');
      setIsWriting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 min-h-screen relative">
      {/* Search Modal */}
      <div className={`fixed inset-0 bg-black/30 transition-all duration-300 ${
        isSearching ? 'opacity-100 z-30' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed top-0 left-0 right-0 transform transition-transform duration-300 ease-out ${
          isSearching ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="relative max-w-4xl mx-auto p-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-shadow duration-200"
                autoFocus={isSearching}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <button
                onClick={() => {
                  setIsSearching(false);
                  setSearchQuery('');
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Write Note Modal */}
      <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300 ${
        isWriting ? 'opacity-100 z-30' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed inset-x-0 bottom-0 bg-white p-6 rounded-t-3xl shadow-lg transform transition-all duration-300 ease-out ${
          isWriting ? 'translate-y-0' : 'translate-y-full'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">New Note</h2>
              <button
                type="button"
                onClick={() => setIsWriting(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="What's on your mind? Try typing 'meeting tomorrow at 6 PM'"
              className="w-full p-4 bg-gray-50 border-none rounded-2xl resize-none h-40 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-shadow duration-200"
              autoFocus
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transform hover:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create Note</span>
            </button>
          </form>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid gap-7 sm:grid-cols-1 md:grid-cols-2 mt-20">
        {filteredNotes.map((note) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            onDelete={onDeleteNote}
            onComplete={onCompleteNote}
            isHighlighted={searchQuery && (
              note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              note.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
              note.aiSummary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              note.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              note.author?.toLowerCase().includes(searchQuery.toLowerCase())
            )}
          />
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg px-4 py-2 z-20 border border-white/20">
        <button
          onClick={() => setIsSearching(true)}
          className="p-3 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95"
          aria-label="Search notes"
        >
          <Search className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={() => setIsWriting(true)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transform hover:scale-[0.98] transition-all duration-200 shadow-md"
        >
          <PenSquare className="w-5 h-5" />
          <span className="font-medium">Create</span>
        </button>
      </div>
    </div>
  );
};