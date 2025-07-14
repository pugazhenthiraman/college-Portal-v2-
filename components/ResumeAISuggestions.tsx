import React, { useState } from 'react';

type Props = {
  resumeText: string;
};

export default function ResumeAISuggestions({ resumeText }: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    setLoading(true);
    setSuggestions(null);
    setError(null);
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resumeText }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.suggestions);
      } else {
        setError(data.error || 'Failed to get suggestions.');
      }
    } catch (err) {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <div className="my-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 font-semibold"
        onClick={handleGetSuggestions}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : '💡 Get AI Suggestions'}
      </button>
      {suggestions && (
        <div className="mt-3 text-sm text-gray-800 whitespace-pre-line">
          <strong>Suggestions:</strong>
          <div>{suggestions}</div>
        </div>
      )}
      {error && (
        <div className="mt-3 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}