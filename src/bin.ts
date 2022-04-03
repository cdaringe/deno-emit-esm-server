import { createServer } from "./mod.ts";
import { assert } from "testing/asserts.ts";

const PORT = Deno.env.get("PORT");
const DENO_ENV = Deno.env.get("DENO_ENV");
const EMIT_SERVER_ORIGIN = Deno.env.get("EMIT_SERVER_ORIGIN");

const isProduction = DENO_ENV === "production";

assert(
  !isProduction || (isProduction && EMIT_SERVER_ORIGIN),
  `EMIT_SERVER_ORIGIN required in production mode`
);

const port = PORT ? parseInt(PORT) : 7777;

const app = createServer({
  cors: true,
  emitMiddlewareOptions: {
    origin: EMIT_SERVER_ORIGIN || `http://localhost:${port}`,
    cacheEntryTimeout: 1_000 * 60 * 2,
  },
});
await app.listen({ port });
