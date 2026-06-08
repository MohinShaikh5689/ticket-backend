import { env } from './config/env.js';
import { buildApp } from './app.js';

async function start() {
  const fastify = await buildApp();

  try {
    await fastify.listen({ port: env.PORT, host: env.HOST });
    fastify.log.info(`🚀 Server running on http://${env.HOST}:${env.PORT}`);
    fastify.log.info(`📖 Swagger docs at http://${env.HOST}:${env.PORT}/api-docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);
    await fastify.close();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
