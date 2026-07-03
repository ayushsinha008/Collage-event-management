/** Use Vite proxy in dev (`/api` → backend) to avoid CORS issues on any localhost port. */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
