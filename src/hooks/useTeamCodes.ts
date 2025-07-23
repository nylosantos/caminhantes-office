// src/hooks/useTeamCodes.ts
import { useState, useEffect, useCallback } from 'react';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ApiResponse } from '@/lib/footballApi'; // Suas interfaces de API
import { TeamApiResponse, TeamCodesCache } from '@/types/TeamCodes'; // Nova interface TeamCode
import { db } from '@/lib/firebase';

interface UseTeamCodesResult {
    getTeamCode: (teamId: number, teamName: string) => Promise<string>;
    loading: boolean;
    error: string | null;
}

// API-Sports Football API details
const API_BASE_URL = "https://v3.football.api-sports.io";
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY || 'sua-chave-aqui'; // Using VITE_API_FOOTBALL_KEY
const API_HOST = "v3.football.api-sports.io";

// Helper function to fetch data (replicada para ser auto-suficiente no hook, ou pode ser importada se você exportar uma versão mais genérica)
const fetchData = async <T>(url: string): Promise<ApiResponse<T>> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "x-rapidapi-host": API_HOST,
                "x-apisports-key": API_KEY,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // ... (sua lógica de erro 403, 429, etc. pode ser mais granular aqui)
            return { success: false, error: `API Error: ${response.status} - ${response.statusText}` };
        }

        const data: T = await response.json();
        return { success: true, data };
    } catch (err) {
        console.error('Fetch error:', err);
        return { success: false, error: 'Network error or API connection issue.' };
    }
};


export const useTeamCodes = (): UseTeamCodesResult => {
    const [teamCodesCache, setTeamCodesCache] = useState<TeamCodesCache>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Carrega o cache inicial do Firebase
    useEffect(() => {
        const loadCache = async () => {
            setLoading(true);
            setError(null);
            try {
                const docRef = doc(db, 'teamCodes', 'codes');
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setTeamCodesCache(docSnap.data() as TeamCodesCache);
                } else {
                    console.log("Documento 'codes' não encontrado no Firebase, criando um novo.");
                    await setDoc(docRef, {}); // Cria o documento se não existir
                }
            } catch (err) {
                console.error('Erro ao carregar cache do Firebase:', err);
                setError('Falha ao carregar códigos de times do cache.');
            } finally {
                setLoading(false);
            }
        };

        loadCache();
    }, []); // Executa apenas uma vez ao montar o componente

    // Função para buscar o código do time
    const getTeamCode = useCallback(async (teamId: number, teamName: string): Promise<string> => {
        // 1. Tentar pegar do cache local (já preenchido pelo Firebase ou por chamadas anteriores)
        if (teamCodesCache[teamId]) {
            return teamCodesCache[teamId];
        }

        // 2. Se não estiver no cache local, tentar buscar no Firebase (caso haja delay na carga inicial)
        try {
            const docRef = doc(db, 'teamCodes', 'codes');
            const docSnap = await getDoc(docRef);
            const currentCache = docSnap.exists() ? (docSnap.data() as TeamCodesCache) : {};

            if (currentCache[teamId]) {
                setTeamCodesCache(prev => ({ ...prev, [teamId]: currentCache[teamId] }));
                return currentCache[teamId];
            }
        } catch (firebaseErr) {
            console.error('Erro ao buscar código no Firebase durante getTeamCode:', firebaseErr);
            // Não bloqueia, tenta a API
        }


        // 3. Se não estiver no Firebase, buscar na API
        try {
            setLoading(true);
            const url = `${API_BASE_URL}/teams?id=${teamId}`;
            const response = await fetchData<TeamApiResponse>(url);

            if (response.success && response.data && response.data.response.length > 0) {
                const code = response.data.response[0].team.code;
                if (code) {
                    // Salvar no Firebase e atualizar cache local
                    const docRef = doc(db, 'teamCodes', 'codes');
                    await setDoc(docRef, { ...teamCodesCache, [teamId]: code }, { merge: true }); // Usar merge para não sobrescrever
                    setTeamCodesCache(prev => ({ ...prev, [teamId]: code }));
                    return code;
                } else {
                    // Se a API não tiver o 'code', usar as 3 primeiras letras do nome
                    const fallbackCode = teamName.substring(0, 3).toUpperCase();
                    const docRef = doc(db, 'teamCodes', 'codes');
                    await setDoc(docRef, { ...teamCodesCache, [teamId]: fallbackCode }, { merge: true });
                    setTeamCodesCache(prev => ({ ...prev, [teamId]: fallbackCode }));
                    return fallbackCode;
                }
            } else {
                setError(response.error || `Não foi possível obter o código para o time ${teamName}.`);
                // Fallback: retornar as 3 primeiras letras se a API falhar
                const fallbackCode = teamName.substring(0, 3).toUpperCase();
                return fallbackCode;
            }
        } catch (apiErr) {
            console.error('Erro ao buscar código na API:', apiErr);
            setError(`Falha ao buscar código para ${teamName} na API.`);
            // Fallback: retornar as 3 primeiras letras se a API falhar
            const fallbackCode = teamName.substring(0, 3).toUpperCase();
            return fallbackCode;
        } finally {
            setLoading(false);
        }
    }, [teamCodesCache]); // Depende do cache para a lógica de atualização

    return { getTeamCode, loading, error };
};