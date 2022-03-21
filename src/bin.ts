import { createServer } from "./mod.ts";

const PORT = Deno.env.get("PORT");

const app = createServer({ cors: true });
await app.listen({ port: PORT ? parseInt(PORT) : 7777 });
