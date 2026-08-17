// Vercel Serverless Function entry point
// Imports the Express app from the existing server implementation
// No route or controller logic is duplicated here.

import mongoose from 'mongoose';

// Cache the MongoDB connection across warm serverless invocations
let cachedConnection = null;

async function ensureDB() {
  if (cachedConnection && mongoose.connections[0]?.readyState === 1) {
    return cachedConnection;
  }
  const { default: connectDB } = await import('../server/config/db.js');
  cachedConnection = await connectDB();
  return cachedConnection;
}

// Dynamically import the Express app (server.js is ES module)
const { default: app } = await import('../server/server.js');

// Ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error('DB connection error in serverless:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

export default app;
