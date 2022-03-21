import { Application } from "https://deno.land/x/oak/mod.ts";
import { CORS } from "https://deno.land/x/oak_cors/mod.ts";
import createEmitMiddleware from "./middlewares/emit.ts";

type Options = {
  cors?: boolean;
  emitMiddlewareOptions?: Parameters<typeof createEmitMiddleware>[0];
};
export function createServer(opt: Options) {
  const app = new Application();
  if (opt.cors) app.use(CORS());
  app.use(createEmitMiddleware(opt.emitMiddlewareOptions));
  return app;
}
