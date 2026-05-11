// Automatically pick the right backend URL:
//  - In development (localhost) → use local backend
//  - In production (Vercel/Netlify/etc.) → use the deployed Render backend

const PROD_BACKEND = 'https://autoagent-a4xr.onrender.com';
const DEV_BACKEND  = 'http://localhost:3001';

export const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? DEV_BACKEND : PROD_BACKEND);
