require('ts-node/register/transpile-only');
const serverless = require('serverless-http');
const { createApp } = require('../src/main');

let cachedApp;

module.exports = async function handler(req, res) {
  try {
    if (!cachedApp) {
      cachedApp = await createApp();
    }

    const requestUrl = req.url || '/';
    if (requestUrl.startsWith('/api')) {
      req.url = requestUrl.replace(/^\/api/, '') || '/';
    }

    const app = cachedApp.getHttpAdapter().getInstance();
    return serverless(app)(req, res);
  } catch (error) {
    console.error('Vercel function bootstrap failed:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'The backend failed to initialize. Check environment variables and database configuration.',
    });
  }
};
