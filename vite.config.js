import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev only: forwards /api and /uploads to the backend so you don't need CORS while coding.
// Point it somewhere else with VITE_API_TARGET (see .env.example).
const API = process.env.VITE_API_TARGET || 'http://localhost:5000';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': API, '/uploads': API } },
});
