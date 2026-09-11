import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import drivesRoutes from './routes/drives.js';
import hourLogsRoutes from './routes/hourLogs.js';
import leaderboardRoutes from './routes/leaderboard.js';

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins },
});

app.set('io', io);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/drives', drivesRoutes);
app.use('/api/hour-logs', hourLogsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

io.on('connection', (socket) => {
  socket.on('identify', (userId) => {
    if (userId) socket.join(`student:${userId}`);
  });
});

const port = Number(process.env.PORT) || 4000;
httpServer.listen(port, () => {
  console.log(`Handprint API + Socket.IO listening on http://localhost:${port}`);
});
