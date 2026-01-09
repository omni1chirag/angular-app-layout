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

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  '/patient-portal',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use(compression());
/**
 * Handle all other requests by rendering the Angular application.
 */
app.use('**', (req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
let serverInstance: ReturnType<typeof app.listen> | undefined;

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4400;
  // app.listen(port, () => {
  //   console.log(`Node Express server listening on http://localhost:${port}`);
  // });
    if (serverInstance && serverInstance.listening) {
    serverInstance.close(() => {
      console.log('Previous instance closed. Restarting server...');
      serverInstance = app.listen(port, () => {
        console.log(`Server restarted on http://localhost:${port}`);
      });
    });
  } else {
    serverInstance = app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
    });
  }
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
