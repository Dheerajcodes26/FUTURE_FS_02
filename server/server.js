import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import leadRoutes from './routes/leadRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { seedDefaultAdmin } from './controllers/authController.js';
import { getPublicStats } from './controllers/statsController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB and seed default admin
connectDB().then(() => {
  seedDefaultAdmin();
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

// In development, also allow common LAN/dev patterns
const isDev = process.env.NODE_ENV !== 'production';
const devOriginPatterns = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\[::1\](:\d+)?$/,
  /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/,
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (isDev && devOriginPatterns.some((re) => re.test(origin))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Mini CRM Backend API is running' });
});

// Public Stats Route
app.get('/api/stats', getPublicStats);

// Auth Routes
app.use('/api/auth', authRoutes);

// Lead Routes
app.use('/api/leads', leadRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Mini CRM Server is running');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} (accessible from LAN)`);
});
