import { Application } from "https://deno.land/x/oak/mod.ts";
import { CORS } from "https://deno.land/x/oak_cors/mod.ts";
import * as res from "./responses.ts";

const moduleCache: Map<
  string,
  {
    code: string;
    hits: number;
  }
> = new Map();

const app = new Application();
app.use(CORS());
app.use(async (ctx, next) => {
  const [_, rawModulePathname] = ctx.request.url.pathname.split("github/");
  if (!rawModulePathname) {
    return res.fourHundo(ctx, next, "no module github pathname");
  }
  try {
    const tsSrcUrl = `https://raw.githubusercontent.com/${rawModulePathname}`;
    const jsSrcUrl = `${tsSrcUrl}.js`;
    const previous = moduleCache.get(jsSrcUrl);
    if (previous) {
      ++previous.hits;
      return res.twoHundoSrcCode(ctx, next, previous.code);
    }
    const remoteModule = await Deno.emit(tsSrcUrl, {
      check: false,
      compilerOptions: {
        sourceMap: false,
        declarationMap: false,
        inlineSourceMap: false,
      },
    });
    for (const [filename, code] of Object.entries(remoteModule.files)) {
      if (filename.endsWith(".js")) {
        if (code.length > 500_000) {
          throw new Error(`module too big: ${code.length}`);
        }
        const cached = moduleCache.get(filename) || {
          code: code.replaceAll(/(\.tsx?)('|"|`)/g, "$1.js$2"),
          hits: 0,
        };
        ++cached.hits;
        moduleCache.set(filename, cached);
      }
    }
    const src = moduleCache.get(jsSrcUrl)?.code;
    if (src) {
      return res.twoHundoSrcCode(ctx, next, src);
    }
    return res.fiveHundo(ctx, next, `src missing for ${jsSrcUrl}`);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    return res.fourHundo(ctx, next, `failed to fetch module: ${msg}`);
  }
});

const appP = app.listen({ port: 7777 });
console.log(`listening on 7777`);
await appP;
