import { useState } from 'react';
import { Languages, BookMarked } from 'lucide-react';
import { Translator } from './components/Translator';
import { Phrasebook } from './components/Phrasebook';

function App() {
  const [activeTab, setActiveTab] = useState<'translator' | 'phrasebook'>('translator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl shadow-lg">
              <Languages className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              AI Language Translator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Translate text and speech instantly with AI-powered language detection
          </p>
        </header>

        <nav className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-2xl shadow-lg p-1.5 gap-2">
            <button
              onClick={() => setActiveTab('translator')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'translator'
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Languages size={20} />
              <span>Translator</span>
            </button>
            <button
              onClick={() => setActiveTab('phrasebook')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'phrasebook'
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BookMarked size={20} />
              <span>Phrasebook</span>
            </button>
          </div>
        </nav>

        <main>
          {activeTab === 'translator' ? <Translator /> : <Phrasebook />}
        </main>

        <footer className="text-center mt-12 text-sm text-gray-500">
          <p>Powered by AI with speech recognition and text-to-speech support</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
