import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyModalProps {
  onSubmit: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Enter Gemini API Key</h2>
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