import { Application, ApplicationOptions } from "oak/mod.ts";
import { ServerRequest } from "oak/types.d.ts";
import { CORS } from "https://deno.land/x/oak_cors/mod.ts";
import createEmitMiddleware from "./middlewares/emit.ts";

type Options = {
  cors?: boolean;
  emitMiddlewareOptions?: Parameters<typeof createEmitMiddleware>[0];
  appOptions?: ApplicationOptions<never, ServerRequest>;
};
export function createServer(opt: Options) {
  const app = new Application(opt.appOptions || {});
  if (opt.cors) app.use(CORS());
  app.use(createEmitMiddleware(opt.emitMiddlewareOptions));
  return app;
}
