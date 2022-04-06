import { createServer } from "../../mod.ts";
import { getFreePort } from "https://deno.land/x/free_port@v1.2.0/mod.ts";

export const create = async () => {
  const controller = new AbortController();
  const { signal } = controller;
  const port = await getFreePort(8000);
  const origin = `http://localhost:${port}`;
  const server = createServer({
    cors: true,
    emitMiddlewareOptions: {
      origin,
      maxModuleBytes: 1e9,
    },
  });
  const serverP = server.listen({ port, signal });
  return {
    server,
    serverP,
    port,
    teardown: async () => {
      controller.abort();
      await serverP;
    },
  };
};
