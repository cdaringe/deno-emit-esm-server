import { assertEquals } from "testing/asserts.ts";
import { create } from "./fixtures/server.ts";
Deno.test({
  name: "integration - import deno module from deno.land",
  async fn() {
    const { teardown, port } = await create();
    const mod = await import(
      `http://localhost:${port}/denoland/x/oak@v10.4.0/mod.ts`
    );
    assertEquals(typeof mod.Application, "function");
    const app = new mod.Application();
    assertEquals(typeof app.use, "function");

    // assert that modules w/ rewrites work ok
    // this module is known to have _external_ https imports
    const depsModUrl =
      `http://localhost:${port}/denoland/x/oak@v10.4.0/deps.ts`;
    const depsMod = await import(depsModUrl);
    const encoded = depsMod.base64.encode("abc");
    assertEquals(
      encoded,
      "YWJj",
      `modules like base64 are importable using rewritten urls`,
    );
    await teardown();
  },
});
