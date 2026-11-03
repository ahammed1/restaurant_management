require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDatabase = require('./config/database');
const healthRoutes = require('./routes/health.routes');

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
const io = new Server(server, { cors: { origin: allowedOrigin, credentials: true } });

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.set('io', io);
app.get('/', (_req, res) => res.json({ success: true, message: 'Aura Dining API is running' }));
app.use('/api/health', healthRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const port = Number(process.env.PORT) || 5000;
connectDatabase().then(() => {
  server.listen(port, () => console.log(`Aura Dining API listening on http://localhost:${port}`));
}).catch(error => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});

module.exports = { app, server, io };