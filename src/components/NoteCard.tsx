import React, { useEffect, useState } from 'react';
import { Clock, Tag, Bell, Check, Trash2, AlertTriangle, MapPin, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
  isHighlighted?: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onDelete, 
  onComplete,
  isHighlighted = false
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [exactCountdown, setExactCountdown] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!note.dueDate) return;

    const updateTimer = () => {
      const now = new Date();
      const due = new Date(note.dueDate!);
      
      // Convert to user's timezone if available
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const dueInUserTz = userTimezone ? due : new Date(due.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5:30 hours if timezone not detected
      
      if (now >= dueInUserTz) {
        setTimeLeft('Due now!');
        setExactCountdown('');
        return;
      }

      const distance = formatDistanceToNow(dueInUserTz, { addSuffix: true });
      setTimeLeft(distance);

      const diffMs = dueInUserTz.getTime() - now.getTime();
      const minutesLeft = diffMs / (1000 * 60);
      
      if (minutesLeft <= 15) {
        const minutes = Math.floor(minutesLeft);
        const seconds = Math.floor((diffMs / 1000) % 60);
        setExactCountdown(`${minutes}m ${seconds}s`);

        if (minutes === 15 && seconds === 0) {
          new Notification('Upcoming Event', {
            body: `${note.aiSummary} - Starting in exactly 15 minutes`,
            icon: '/notification-icon.png'
          });
        }
      } else {
        setExactCountdown('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [note.dueDate, note.aiSummary]);

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    // Use the user's timezone if available, otherwise use IST format
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (userTimezone) {
      return format(date, 'PPp');
    } else {
      // Format in IST
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      return format(istDate, 'PPp') + ' IST';
    }
  };

  return (
    <div 
      className={`group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-5 cursor-pointer
        ${note.completed ? 'opacity-75' : ''}
        ${isHighlighted ? 'ring-2 ring-blue-500 shadow-lg' : ''}
      `}
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex justify-between items-start mb-3">
        <p className={`text-gray-800 ${note.completed ? 'line-through' : ''}`}>
          {note.content}
        </p>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(note.id);
            }}
            className={`p-2 rounded-full transition-all duration-200 active:scale-95 ${
              note.completed 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {note.aiSummary && (
        <div className="mb-3 text-sm text-gray-600 border-l-2 border-blue-500 pl-3 py-1">
          {note.aiSummary}
        </div>
      )}

      {/* Event Details */}
      {showDetails && note.dueDate && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-2">
          <h3 className="font-semibold text-gray-800 mb-3">Event Details</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Time: {formatTimestamp(note.dueDate.toString())}</span>
          </div>
          {note.venue && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Venue: {note.venue}</span>
            </div>
          )}
          {note.author && (
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span>Organizer: {note.author}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatTimestamp(note.timestamp)}</span>
        </div>
        {(timeLeft || exactCountdown) && (
          <div className="flex items-center gap-2">
            {exactCountdown ? (
              <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4" />
                <span>{exactCountdown}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600">
                <Bell className="w-4 h-4" />
                <span>{timeLeft}</span>
              </div>
            )}
          </div>
        )}
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};