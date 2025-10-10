import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Pass the environment variable to the client-side code
    'import.meta.env.VITE_HCAPTCHA_SITEKEY': JSON.stringify(process.env.VITE_HCAPTCHA_SITEKEY)
  }
});
