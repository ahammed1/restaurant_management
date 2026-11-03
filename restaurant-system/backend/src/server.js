const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiRoutes = require('./routes/api.routes');
const registerSockets = require('./sockets/orderSocket');
const authService = require('./services/authService');
const { attachUser } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
let io = null;
try {
  const { Server } = require('socket.io');
  io = new Server(server, { cors: { origin: "*" } });
  registerSockets(io, authService);
} catch (e) {
  console.warn("Socket.io running in fallback mode.");
}

app.set('io', io);
app.use(cors());
app.use(express.json());

// Mount API
app.use('/api', attachUser, apiRoutes);

// Serve Frontend
const candidatePaths = [
  path.join(__dirname, '../../frontend/public'),
  path.join(__dirname, '../frontend/public')
];
const publicPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];

app.use(express.static(publicPath));
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) res.sendFile(indexPath);
  else res.send("<h2>Aura Dining API Running!</h2>");
});

const PORT = Number(process.env.PORT) || 5000;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Restaurant Management Server Started!`);
  console.log(`
    Access the app at: http://localhost:${PORT}`);
  console.log(`===============================================`);
});