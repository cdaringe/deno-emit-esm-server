import { Application, ApplicationOptions } from "oak/mod.ts";
import { ServerRequest } from "oak/types.d.ts";
import { CORS } from "oak_cors/mod.ts";
import createEmitMiddleware from "./middlewares/emit.ts";
import { testPageMiddleware } from "./middlewares/test-page.ts";

type Options = {
  cors?: boolean;
  emitMiddlewareOptions: Parameters<typeof createEmitMiddleware>[0];
  appOptions?: ApplicationOptions<never, ServerRequest>;
};
export function createServer(opt: Options) {
  const app = new Application(opt.appOptions || {});
  if (opt.cors) app.use(CORS());
  app.use(createEmitMiddleware(opt.emitMiddlewareOptions));
  app.use(testPageMiddleware);
  return app;
}
