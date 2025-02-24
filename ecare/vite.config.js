import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 5500, 
  },
  server: {
    historyApiFallback: true,  // This ensures that React Router can handle routes during development
  },
});
