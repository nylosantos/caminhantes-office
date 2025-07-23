interface ImportMetaEnv {
    readonly VITE_API_FOOTBALL_KEY: string;
    // Add other VITE_ prefixed environment variables here if you use them
    // readonly VITE_ANOTHER_VAR: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}