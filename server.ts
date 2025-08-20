import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(compression());

// 1) Serve actual static assets (e.g. .js, .css, images)
app.get('*.*', express.static(browserDistFolder, {
  maxAge: '1y',
  immutable: true,
}));

// 2) Fallback to SSR rendering for all other routes (app paths)
app.get('*', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => {
      if (response) writeResponseToNodeResponse(response, res);
      else next();
    })
    .catch(next);
});




export const reqHandler = createNodeRequestHandler(app);
