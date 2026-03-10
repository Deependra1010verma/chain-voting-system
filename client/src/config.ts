// In development, this is proxied by Vite to http://localhost:5000
// In production (Vercel), this works as a relative path
const API_URL = import.meta.env.VITE_API_URL || '';

export default API_URL;
