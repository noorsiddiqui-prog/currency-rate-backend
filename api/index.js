const serverless = require('serverless-http');
const { createApp } = require('../dist/main');

let cachedApp;

module.exports = async function handler(req, res) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }

  const requestUrl = req.url || '/';
  if (requestUrl.startsWith('/api')) {
    req.url = requestUrl.replace(/^\/api/, '') || '/';
  }

  const app = cachedApp.getHttpAdapter().getInstance();
  return serverless(app)(req, res);
};
