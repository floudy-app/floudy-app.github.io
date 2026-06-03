import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs';
import path from 'path';

const certDir = path.resolve('certs');
const certPath = path.join(certDir, 'floudy-frontend.pem');
const keyPath = path.join(certDir, 'floudy-frontend-key.pem');

const hasCustomCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

export default defineConfig({
  plugins: hasCustomCert ? [react()] : [react(), basicSsl()],
  server: {
    // https: hasCustomCert
    //   ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
    //   : true,
    https: false,
    host: '0.0.0.0',
    port: 5173,
  },
  preview: {
    // https: hasCustomCert
    //   ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
    //   : true,
    https: false,
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './src/tests/setup.js',
    exclude: ['./tests/floudy.spec.js'],
  },
});
