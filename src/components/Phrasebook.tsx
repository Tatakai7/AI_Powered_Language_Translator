import { useState } from 'react';
import { Trash2, Volume2, Copy, Search, Loader2 } from 'lucide-react';
import { usePhrasebook } from '../hooks/usePhrasebook';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { getLanguageName } from '../firebase/languages';

export const Phrasebook = () => {
  const { entries, isLoading, deleteEntry } = usePhrasebook();
  const { speak, isSpeaking } = useTextToSpeech();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter(
    (entry) =>
      entry.original_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.translated_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Phrasebook</h2>
          <div className="text-sm text-gray-500">
            {entries.length} {entries.length === 1 ? 'phrase' : 'phrases'} saved
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your saved phrases..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery
                ? 'No phrases found matching your search'
                : 'No saved phrases yet. Start translating and save your favorites!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-linear-to-r from-blue-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {getLanguageName(entry.source_language)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-lg">{entry.original_text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => speak(entry.original_text, entry.source_language)}
                        className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Listen"
                        disabled={isSpeaking}
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        onClick={() => handleCopy(entry.original_text)}
                        className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {getLanguageName(entry.target_language)}
                      </span>
                    </div>
                    <p className="text-gray-800 text-lg font-medium">{entry.translated_text}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => speak(entry.translated_text, entry.target_language)}
                        className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Listen"
                        disabled={isSpeaking}
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        onClick={() => handleCopy(entry.translated_text)}
                        className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
