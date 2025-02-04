import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    allowedHosts: ['price.satyamvatsal.me', 'localhost', '127.0.0.1'],
  }
});
