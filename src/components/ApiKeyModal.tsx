import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';

interface ApiKeyModalProps {
  onSubmit: (apiKey: string) => void;
  initialValue?: string;
  onClose?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit, initialValue = '', onClose }) => {
  const [apiKey, setApiKey] = useState(initialValue);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {initialValue ? 'Change API Key' : 'Enter Gemini API Key'}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
        <p className="text-gray-600 mb-4">
          To use AI features, please enter your Google Gemini API key. Your key will be stored locally.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={() => onSubmit(apiKey)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save API Key
        </button>
      </div>
    </div>
  );
};