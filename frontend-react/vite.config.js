import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_TARGET || 'http://127.0.0.1:8000';

  return {
    base: './',
    plugins: [react()],
    server: {
      port: 5173,
      host: true, // Escuta em 0.0.0.0 para acesso via celular na mesma rede Wi-Fi
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            // Trata graciosamente caso o Flask ainda não esteja rodando,
            // evitando despejar AggregateError [ECONNREFUSED] no console.
            proxy.on('error', (err, req, res) => {
              if (res.writeHead && !res.headersSent) {
                res.writeHead(503, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    sucesso: false,
                    offline: true,
                    aviso: 'Backend Flask offline. O frontend ativou automaticamente a contingência local.'
                  })
                );
              }
            });
          }
        }
      }
    }
  };
});
