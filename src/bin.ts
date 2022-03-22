import { createServer } from "./mod.ts";

const PORT = Deno.env.get("PORT");

const app = createServer({
  cors: true,
  emitMiddlewareOptions: {
    cacheEntryTimeout: 1_000 * 60 * 2,
  },
});
await app.listen({ port: PORT ? parseInt(PORT) : 7777 });
