interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.css' {
    const classes: { [key: string]: string };
    export default classes;
}