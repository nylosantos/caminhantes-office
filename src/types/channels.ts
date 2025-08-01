// src/types/channels.ts

export const CHANNEL_TYPES = {
    TV_ABERTA: 'TV Aberta',
    TV_FECHADA: 'TV Fechada',
    STREAMING: 'Streaming',
};

export type ChannelType = keyof typeof CHANNEL_TYPES;

// Estrutura de um canal no Firebase
export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    logoUrl: string;
}

// Dados do formulário para criar/editar um canal
export interface ChannelFormData {
    name: string;
    type: ChannelType;
}
