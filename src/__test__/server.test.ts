import { createServer } from "../mod.ts";
import { getFreePort } from "https://deno.land/x/free_port@v1.2.0/mod.ts";
import { assertEquals } from "testing/asserts.ts";

Deno.test({
  name: "integration - import deno module from deno.land",
  async fn() {
    const controller = new AbortController();
    const { signal } = controller;
    const server = createServer({
      cors: true,
      emitMiddlewareOptions: {
        maxModuleBytes: 1e9,
      },
    });
    const port = await getFreePort(8000);
    const serverP = server.listen({ port, signal });
    const mod = await import(
      `http://localhost:${port}/denoland/x/oak@v10.4.0/mod.ts`
    );
    assertEquals(typeof mod.Application, "function");
    const app = new mod.Application();
    assertEquals(typeof app.use, "function");
    controller.abort();
    await serverP;
  },
});
