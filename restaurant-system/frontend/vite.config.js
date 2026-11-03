const { defineConfig } = require('vite');

module.exports = defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:5000'
      },
      '/socket.io': {
        target: process.env.BACKEND_URL || 'http://127.0.0.1:5000',
        ws: true
      }
    }
  }
});
