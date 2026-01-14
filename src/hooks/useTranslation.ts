import { useState } from 'react';

interface TranslationResult {
  translatedText: string;
  detectedLanguage?: {
    language: string;
    confidence: number;
  };
}

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = async (
    text: string,
    sourceLang: string,
    targetLang: string
  ): Promise<TranslationResult | null> => {
    setIsTranslating(true);
    setError(null);

    try {
      const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
      if (!projectId) {
        throw new Error('Firebase project ID is not configured');
      }
      const url = `https://us-central1-${projectId}.cloudfunctions.net/translate`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, sourceLang, targetLang }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as TranslationResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return { translate, isTranslating, error };
};
