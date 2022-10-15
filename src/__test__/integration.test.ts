import { create } from "./fixtures/server.ts";
import { assertEquals } from "testing/asserts.ts";

Deno.test({
  name: "trouble modules - 1",
  async fn() {
    const { teardown, port } = await create();
    const moduleUrl = encodeURIComponent(
      "https://raw.githubusercontent.com/cdaringe/airmap/main/packages/cleanair-sensor-flow/mod.ts",
    );
    const url = `http://localhost:${port}/?moduleUrl=${moduleUrl}&q=wtf`;
    // const mod = await import(url);
    const entryModStr = await fetch(url).then((r) => r.text());
    const [entryModFirstLine, ..._] = entryModStr.split(";");
    assertEquals(
      entryModFirstLine,
      `export * from "http://localhost:${port}/?moduleUrl=https://raw.githubusercontent.com/cdaringe/airmap/main/packages/cleanair-sensor-flow/src/download/mod_deno.ts"`,
    );
    const firstModUrlStr = entryModFirstLine.match(/(http.*)"/)![1];
    const secondModStr = await fetch(firstModUrlStr).then((r) => r.text());
    const [secondModFirstExport, ...__] = secondModStr.split(";");
    assertEquals(
      secondModFirstExport,
      'import closestTo from "http://localhost:8000/?moduleUrl=https://deno.land/x/date_fns@v2.22.1/closestTo/index.js"',
    );
    await teardown();
  },
});
