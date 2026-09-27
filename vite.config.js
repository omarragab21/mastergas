import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

function terminalLoggerPlugin() {
  return {
    name: 'terminal-logger-plugin',
    configureServer(server) {
      server.middlewares.use('/__terminal_log', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { tag, message, data, timestamp } = JSON.parse(body);
              const isError = tag.toLowerCase().includes('failed') || tag.toLowerCase().includes('error');
              const isSuccess = tag.toLowerCase().includes('success') || tag.toLowerCase().includes('confirmed');

              // ANSI color formatting for terminal
              const tagColor = isError ? '\x1b[41m\x1b[37m' : isSuccess ? '\x1b[42m\x1b[30m' : '\x1b[44m\x1b[37m';
              const timeColor = '\x1b[90m';
              const reset = '\x1b[0m';

              console.log(`${timeColor}[${timestamp || new Date().toLocaleTimeString()}]${reset} ${tagColor} ${tag} ${reset} ${message}`);
              if (data && Object.keys(data).length > 0) {
                console.log('\x1b[33mData:\x1b[0m', JSON.stringify(data, null, 2));
              }
            } catch (_) {
              console.log(body);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('ok');
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), terminalLoggerPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/chart.js')) {
            return 'chart-vendor';
          }
          if (id.includes('/src/views/') && !id.includes('/src/views/website/')) {
            const match = id.match(/\/src\/views\/([^/]+)\.vue$/);
            return match ? `admin-${match[1].replace(/View$/, '').toLowerCase()}` : 'admin-runtime';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://backend-mastergas.be-kite.com',
        changeOrigin: true,
        secure: false,
        timeout: 6000,
        proxyTimeout: 6000,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(504, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Gateway Timeout', message: err.message }));
            }
          });
        },
        headers: {
          'Origin': 'https://backend-mastergas.be-kite.com',
          'Referer': 'https://backend-mastergas.be-kite.com/',
        },
      },
      '/storage': {
        target: 'https://backend-mastergas.be-kite.com',
        changeOrigin: true,
        secure: false,
        timeout: 6000,
        proxyTimeout: 6000,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && !res.headersSent) {
              res.writeHead(504, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Gateway Timeout', message: err.message }));
            }
          });
        },
        headers: {
          'Origin': 'https://backend-mastergas.be-kite.com',
          'Referer': 'https://backend-mastergas.be-kite.com/',
        },
      },
    },
  },
});
