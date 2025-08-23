// src/hooks/useRoundTranslations.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Assuming these are from your firebase lib
import { db } from '../lib/firebase'; // Your Firebase instance
import { RoundTranslationsDocument } from '@/types/translations'; // Your type definition

interface UseRoundTranslationsResult {
    translations: RoundTranslationsDocument[];
    loading: boolean;
    error: string | null;
}

export const useRoundTranslations = (): UseRoundTranslationsResult => {
    const [translations, setTranslations] = useState<RoundTranslationsDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                setLoading(true);
                setError(null); // Clear any previous errors

                const ref = collection(db, 'translations');
                const snap = await getDocs(ref);
                const fetchedTranslations = snap.docs.map(doc => doc.data() as RoundTranslationsDocument);
                setTranslations(fetchedTranslations);
            } catch (err) {
                console.error("Error fetching translations:", err);
                setError("Failed to load translations. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTranslations();
    }, []); // Empty dependency array means this effect runs only once on mount
    return { translations, loading, error };
};