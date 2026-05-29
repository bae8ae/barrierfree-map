/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_API?: string;
  readonly VITE_PUBLIC_DATA_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
