import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { PhrasebookEntry } from '../firebase/database.types';

export const usePhrasebook = () => {
  const [entries, setEntries] = useState<PhrasebookEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const q = query(collection(db, 'phrasebook'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PhrasebookEntry[];
      setEntries(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch phrasebook';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async (
    originalText: string,
    translatedText: string,
    sourceLang: string,
    targetLang: string
  ) => {
    setError(null);

    try {
      const docRef = await addDoc(collection(db, 'phrasebook'), {
        original_text: originalText,
        translated_text: translatedText,
        source_language: sourceLang,
        target_language: targetLang,
        created_at: new Date().toISOString(),
      });

      const newEntry: PhrasebookEntry = {
        id: docRef.id,
        original_text: originalText,
        translated_text: translatedText,
        source_language: sourceLang,
        target_language: targetLang,
        created_at: new Date().toISOString(),
      };

      setEntries(prev => [newEntry, ...prev]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to phrasebook';
      setError(errorMessage);
      return false;
    }
  };

  const deleteEntry = async (id: string) => {
    setError(null);

    try {
      await deleteDoc(doc(db, 'phrasebook', id));
      setEntries(prev => prev.filter(entry => entry.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    isLoading,
    error,
    addEntry,
    deleteEntry,
    refreshEntries: fetchEntries,
  };
};
