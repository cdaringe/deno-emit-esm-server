import { assertEquals } from "testing/asserts.ts";
import { rewriteImports } from "../middlewares/emit/rewrite-imports.ts";

Deno.test({
  name: "rewrite imports",
  fn() {
    const input = `
import * as foo from "https://deno.land/x/foo/path/to/mod.ts";
import { bar } from 'https://github.com/cdaringe/bar/main/path/to/mod.ts';
import * as baz from 'https://test.host.org/path/to/mod.ts';
`;
    const expected = `
import * as foo from "https://foo.com/?moduleUrl=https://deno.land/x/foo/path/to/mod.ts";
import { bar } from 'https://foo.com/?moduleUrl=https://github.com/cdaringe/bar/main/path/to/mod.ts';
import * as baz from 'https://foo.com/?moduleUrl=https://test.host.org/path/to/mod.ts';`;
    const next = rewriteImports(input, {
      origin: "https://foo.com/",
      originatingModuleUrl: "https://test.foo.com/src/lib/mod.ts",
    });
    assertEquals(next.trim(), expected.trim());
  },
});

Deno.test({
  name: "rewrite imports - double export",
  fn() {
    const input = [
      'import closestTo from "https://deno.land/x/date_fns@v2.22.1/closestTo/index.js";',
      'export * from "./src/mapbox.ts";',
      'export * from "./src/download.ts";',
      '// export * from "./src/hook.ts";',
    ].join("\n");
    const next = rewriteImports(input, {
      origin: "https://foo.com/",
      originatingModuleUrl: "https://foo.com/mod.ts",
    });
    assertEquals(
      next.trim(),
      `
import closestTo from "https://foo.com/?moduleUrl=https://deno.land/x/date_fns@v2.22.1/closestTo/index.js";
export * from "https://foo.com/?moduleUrl=https://foo.com/src/mapbox.ts";
export * from "https://foo.com/?moduleUrl=https://foo.com/src/download.ts";
// export * from "https://foo.com/?moduleUrl=https://foo.com/src/hook.ts";
    `.trim(),
    );
  },
});

Deno.test({
  name: "rewrite imports - comment export",
  fn() {
    const input = [
      'export * from "./src/download.ts";',
      '// export * from "./src/hook.ts";',
    ].join("\n");
    const next = rewriteImports(input, {
      origin: "https://foo.com/",
      originatingModuleUrl: "https://foo.org/mod.ts",
    });
    const expected = [
      'export * from "https://foo.com/?moduleUrl=https://foo.org/src/download.ts";',
      '// export * from "https://foo.com/?moduleUrl=https://foo.org/src/hook.ts";',
    ].join("\n");
    assertEquals(next.trim(), expected.trim());
  },
});
