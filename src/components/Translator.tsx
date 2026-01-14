import { useState, useEffect } from 'react';
import { Mic, Volume2, ArrowLeftRight, Copy, BookmarkPlus, Loader2 } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { usePhrasebook } from '../hooks/usePhrasebook';
import { useLanguageDetection } from '../hooks/useLanguageDetection';
import { languages, getLanguageName } from '../firebase/languages';

export const Translator = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [detectedLang, setDetectedLang] = useState<string | null>(null);

  const { translate, isTranslating, error: translationError } = useTranslation();
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();
  const { speak, isSpeaking, stop: stopSpeaking, isSupported: isTTSSupported } = useTextToSpeech();
  const { addEntry } = usePhrasebook();
  const { detectLanguage } = useLanguageDetection();

  useEffect(() => {
    if (transcript) {
      setSourceText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      setDetectedLang(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      let effectiveSourceLang = sourceLang;
      if (sourceLang === 'auto') {
        const detectionResult = await detectLanguage(sourceText);
        if (detectionResult) {
          setDetectedLang(detectionResult.language);
          effectiveSourceLang = detectionResult.language;
        }
      }

      const result = await translate(sourceText, effectiveSourceLang, targetLang);
      if (result) {
        setTranslatedText(result.translatedText);
        if (result.detectedLanguage && sourceLang === 'auto') {
          setDetectedLang(result.detectedLanguage.language);
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [sourceText, sourceLang, targetLang, detectLanguage, translate]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setSourceText('');
      startListening(sourceLang);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSaveToPhrasebook = async () => {
    if (sourceText && translatedText) {
      await addEntry(sourceText, translatedText, sourceLang, targetLang);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0 divide-x divide-gray-200">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                aria-label="Source Language"
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              {detectedLang && sourceLang === 'auto' && (
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Detected: {getLanguageName(detectedLang)}
                </span>
              )}
            </div>

            <div className="relative">
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 transition-all"
              />

              <div className="absolute bottom-4 right-4 flex gap-2">
                {isSpeechSupported && (
                  <button
                    onClick={handleMicClick}
                    className={`p-2 rounded-lg transition-all ${
                      isListening
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                    title={isListening ? 'Stop recording' : 'Start recording'}
                  >
                    <Mic size={20} />
                  </button>
                )}

                {sourceText && (
                  <button
                    onClick={() => handleCopy(sourceText)}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    title="Copy text"
                  >
                    <Copy size={20} />
                  </button>
                )}
              </div>
            </div>

            {translationError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {translationError}
              </div>
            )}
          </div>

          <div className="p-6 space-y-4 bg-linear-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                aria-label="Target Language"
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSwapLanguages}
                disabled={sourceLang === 'auto'}
                className={`p-2 rounded-lg transition-all ${
                  sourceLang === 'auto'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 hover:rotate-180'
                }`}
                title="Swap languages"
              >
                <ArrowLeftRight size={20} />
              </button>
            </div>

            <div className="relative">
              <div className="w-full h-48 p-4 bg-white border border-gray-200 rounded-xl overflow-y-auto">
                {isTranslating ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                  </div>
                ) : (
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {translatedText || (
                      <span className="text-gray-400">Translation will appear here...</span>
                    )}
                  </p>
                )}
              </div>

              {translatedText && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {isTTSSupported && (
                    <button
                      onClick={() =>
                        isSpeaking ? stopSpeaking() : speak(translatedText, targetLang)
                      }
                      className={`p-2 rounded-lg transition-all ${
                        isSpeaking
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                      title={isSpeaking ? 'Stop speaking' : 'Listen to translation'}
                    >
                      <Volume2 size={20} />
                    </button>
                  )}

                  <button
                    onClick={() => handleCopy(translatedText)}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    title="Copy translation"
                  >
                    <Copy size={20} />
                  </button>

                  <button
                    onClick={handleSaveToPhrasebook}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    title="Save to phrasebook"
                  >
                    <BookmarkPlus size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
