/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The backend's address, no slash at the end, when it is not served from this site's own /api. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
