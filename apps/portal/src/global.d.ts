declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';

interface ImportMetaEnv {
  readonly VITE_ARCADE_API_BASE?: string;
  readonly VITE_ARCADE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
