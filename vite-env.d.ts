interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_API_FOOTBALL_KEY: string;
    readonly VITE_API_FOOTBALL_HOST: string;
    readonly VITE_IMGBB_API_KEY: string;
    // Add other VITE_ prefixed environment variables here if you use them
    // readonly VITE_ANOTHER_VAR: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}