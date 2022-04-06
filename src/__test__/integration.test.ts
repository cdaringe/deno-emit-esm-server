import { create } from "./fixtures/server.ts";
import { assertEquals } from "testing/asserts.ts";

Deno.test({
  name: "trouble modules - 1",
  async fn() {
    const { teardown, port } = await create();
    const url = `http://localhost:${port}/?moduleUrl=${
      encodeURIComponent(
        "https://raw.githubusercontent.com/cdaringe/airmap/turbo/packages/cleanair-sensor-flow/mod.ts",
      )
    }&q=wtf`;
    // const mod = await import(url);
    const mod = await fetch(url).then((r) => r.text());
    assertEquals(!!mod, true);
    await teardown();
  },
});
