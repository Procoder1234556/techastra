import serverless from 'serverless-http';
import { initApp } from '../server/src/app.js';

let handler;

export default async function vercelHandler(req, res) {
  const app = await initApp();
  if (!handler) {
    handler = serverless(app);
  }
  return handler(req, res);
}
