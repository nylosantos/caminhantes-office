// src/types/TeamCode.ts
export interface TeamApiResponse {
    get: string;
    parameters: { id: string };
    errors: any[];
    results: number;
    paging: { current: number; total: number };
    response: [
        {
            team: {
                id: number;
                name: string;
                code: string; // Este é o campo que queremos!
                country: string;
                founded: number;
                national: boolean;
                logo: string;
            };
            venue: {
                id: number;
                name: string;
                address: string;
                city: string;
                capacity: number;
                surface: string;
                image: string;
            };
        }
    ];
}

export interface TeamCodesCache {
    [teamId: string]: string; // Ex: { "40": "LIV", "33": "MUN" }
}