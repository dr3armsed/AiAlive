import path from 'path';
import { spawnSync } from 'child_process';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function runtimeDialogueBridgePlugin(): Plugin {
  return {
    name: 'runtime-dialogue-bridge',
    configureServer(server) {
      server.middlewares.use('/api/runtime/dialogue', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'method_not_allowed' }));
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on('end', () => {
          const payload = Buffer.concat(chunks).toString('utf8') || '{}';
          try {
            JSON.parse(payload);
          } catch {
            res.statusCode = 400;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'invalid_json_payload' }));
            return;
          }

          const run = spawnSync('python3', ['scripts/python/runtime_bridge.py'], {
            input: payload,
            encoding: 'utf8',
            timeout: 7000,
            maxBuffer: 1024 * 1024,
          });

          if (run.error?.name === 'Error' && /ETIMEDOUT/.test(run.error.message)) {
            res.statusCode = 504;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ error: 'runtime_bridge_timeout' }));
            return;
          }

          if (run.status !== 0) {
            res.statusCode = 500;
            res.setHeader('content-type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'runtime_bridge_execution_failed',
                detail: run.stderr || run.error?.message || 'unknown_error',
              }),
            );
            return;
          }

          res.statusCode = 200;
          res.setHeader('content-type', 'application/json');
          res.end(run.stdout || JSON.stringify({ source: 'python-bridge:error', response: '', signals: null }));
        });

        req.on('error', (err) => {
          res.statusCode = 400;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: 'invalid_request_stream', detail: String(err) }));
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), runtimeDialogueBridgePlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
