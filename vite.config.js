import { defineConfig } from 'vite';
import { resolve } from 'path';

// Deploy em GitHub Pages de projeto: usuario.github.io/TESTE-REAL-ORLANDO/
// Para um domínio próprio ou pages de usuário, mude para '/'.
export default defineConfig({
  base: '/TESTE-REAL-ORLANDO/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        franguinn: resolve(__dirname, 'franguinn/index.html'),
        hamburguinn: resolve(__dirname, 'hamburguinn/index.html'),
      },
    },
  },
});
