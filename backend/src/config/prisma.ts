// /*
// import { PrismaClient } from '@prisma/client';
// import { logger } from '@/utils/logger';

// declare global {
//   var __prisma: PrismaClient | undefined;
// }

// // Prevent multiple instances in development
// const prisma = globalThis.__prisma || new PrismaClient({
//   log: [
//     {
//       emit: 'event',
//       level: 'query',
//     },
//     {
//       emit: 'event',
//       level: 'error',
//     },
//     {
//       emit: 'event',
//       level: 'info',
//     },
//   ],
// });

// if (process.env.NODE_ENV === 'development') {
//   globalThis.__prisma = prisma;
// }

// // Log database events
// prisma.$on('query', (e) => {
//   if (process.env.NODE_ENV === 'development') {
//     logger.debug('Query: ' + e.query);
//     logger.debug('Params: ' + e.params);
//     logger.debug('Duration: ' + e.duration + 'ms');
//   }
// });

// prisma.$on('error', (e) => {
//   logger.error('Database error:', e);
// });

// prisma.$on('info', (e) => {
//   logger.info('Database info:', e.message);
// });

// const connectDB = async (): Promise<void> => {
//   try {
//     await prisma.$connect();
//     logger.info('PostgreSQL connected successfully');
    
//     // Test the connection
//     await prisma.$queryRaw`SELECT 1`;
//     logger.info('Database connection verified');
    
//   } catch (error) {
//     logger.error('Error connecting to PostgreSQL:', error);
//     process.exit(1);
//   }
// };

// const disconnectDB = async (): Promise<void> => {
//   try {
//     await prisma.$disconnect();
//     logger.info('PostgreSQL disconnected');
//   } catch (error) {
//     logger.error('Error disconnecting from PostgreSQL:', error);
//   }
// };

// // Graceful shutdown
// process.on('SIGINT', async () => {
//   await disconnectDB();
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   await disconnectDB();
//   process.exit(0);
// });

// export { prisma, connectDB, disconnectDB };
// */

// Using MongoDB instead of PostgreSQL
// Commenting out Prisma code for now

// export { prisma, connectDB, disconnectDB };

// Placeholder exports for MongoDB setup
export const prisma = null;
export const connectDB = () => Promise.resolve();
export const disconnectDB = () => Promise.resolve();
