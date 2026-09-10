import serverless from 'serverless-http';
import { createApp } from '../../src/main';

let cachedApp: any;

async function handler(event: any, context: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }

  const app = cachedApp;
  const server = serverless(app.getHttpAdapter().getInstance());
  return server(event, context);
}

export { handler };
