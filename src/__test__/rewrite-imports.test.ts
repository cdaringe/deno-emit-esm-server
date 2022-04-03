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
import * as foo from "https://foo.com/?moduleUrl=https%3A%2F%2Fdeno.land%2Fx%2Ffoo%2Fpath%2Fto%2Fmod.ts";
import { bar } from 'https://foo.com/?moduleUrl=https%3A%2F%2Fgithub.com%2Fcdaringe%2Fbar%2Fmain%2Fpath%2Fto%2Fmod.ts';
import * as baz from 'https://foo.com/?moduleUrl=https%3A%2F%2Ftest.host.org%2Fpath%2Fto%2Fmod.ts';`;
    const next = rewriteImports(input, {
      origin: "https://foo.com/",
      originatingModuleUrl: "https://test.foo.com/src/lib/mod.ts",
    });
    assertEquals(next.trim(), expected.trim());
  },
});
