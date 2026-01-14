import { useState } from 'react';

interface LanguageDetectionResult {
  language: string;
  confidence: number;
}

export const useLanguageDetection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLanguage = async (text: string): Promise<LanguageDetectionResult | null> => {
    if (!text.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      // For demonstration, using a simple heuristic based on common words
      // In a real implementation, use TensorFlow.js with a pre-trained model
      const lowerText = text.toLowerCase();

      // Simple language detection based on keywords (not accurate, for demo)
      if (/\b(hola|gracias|por favor)\b/.test(lowerText)) {
        return { language: 'es', confidence: 0.9 };
      } else if (/\b(bonjour|merci|s'il vous plait)\b/.test(lowerText)) {
        return { language: 'fr', confidence: 0.9 };
      } else if (/\b(hallo|danke|bitte)\b/.test(lowerText)) {
        return { language: 'de', confidence: 0.9 };
      } else if (/\b(ciao|grazie|per favore)\b/.test(lowerText)) {
        return { language: 'it', confidence: 0.9 };
      } else if (/\b(olá|obrigado|por favor)\b/.test(lowerText)) {
        return { language: 'pt', confidence: 0.9 };
      } else if (/\b(привет|спасибо|пожалуйста)\b/.test(lowerText)) {
        return { language: 'ru', confidence: 0.9 };
      } else if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
        return { language: 'ja', confidence: 0.9 };
      } else if (/[\uac00-\ud7af]/.test(text)) {
        return { language: 'ko', confidence: 0.9 };
      } else if (/[\u4e00-\u9fff]/.test(text)) {
        return { language: 'zh', confidence: 0.9 };
      } else if (/[\u0600-\u06ff]/.test(text)) {
        return { language: 'ar', confidence: 0.9 };
      } else if (/\b(namaste|dhanyavaad|kripya)\b/.test(lowerText)) {
        return { language: 'hi', confidence: 0.9 };
      } else {
        return { language: 'en', confidence: 0.7 }; // Default to English
      }
    } catch (err) {
      setError('Language detection failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { detectLanguage, isLoading, error };
};
