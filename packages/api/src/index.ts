import './services/index.js';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import mongoose from 'mongoose';
import cors from 'cors';
import { appRouter } from './router.js';
import { createContext } from './middleware.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const MONGODB_URI = process.env.MONGODB_URI;
const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5173';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

if (!process.env.ADMIN_SECRET) {
  console.error('Error: ADMIN_SECRET environment variable is not set');
  process.exit(1);
}

async function main() {
  // Connect to MongoDB
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  // MongoDB connection event handlers
  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  // Create HTTP server with CORS
  const server = createHTTPServer({
    router: appRouter,
    createContext,
    middleware: cors({
      origin: DASHBOARD_URL,
      credentials: true,
    }),
  });

  server.listen(PORT);
  console.log(`Analytics API server listening on port ${PORT}`);
  console.log(`CORS enabled for: ${DASHBOARD_URL}`);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
