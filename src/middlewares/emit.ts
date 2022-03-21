import { Middleware } from "https://deno.land/x/oak/middleware.ts";
import * as res from "../responses.ts";
import PQueue from "https://deno.land/x/p_queue@1.0.1/mod.ts";

type Options = {
  maxModuleBytes?: number;
  maxModuleCacheSize?: number;
  maxEmitQueueSize?: number;
};

type CacheEntry = {
  code: string;
  hits: number;
};

type FileSourceCache = Map<string, CacheEntry>;

const createHandler: (opt?: Options) => Middleware = (opt) => {
  // to prevent abuse of githubusercontent, we queue up _all_ users when hitting the emit
  // flow who don't have cache hits
  const queue = new PQueue({
    concurrency: 1,
  });
  const cache: FileSourceCache = new Map();
  return async (ctx, next) => {
    const [_, rawModulePathname] = ctx.request.url.pathname.split("github/");
    if (!rawModulePathname)
      return res.fourHundo(ctx, next, "no module github pathname");
    try {
      const tsSrcUrl = `https://raw.githubusercontent.com/${rawModulePathname}`;
      const jsSrcUrl = `${tsSrcUrl}.js`;
      const previous = cache.get(jsSrcUrl);
      if (previous) {
        ++previous.hits;
        return res.twoHundoSrcCode(ctx, next, previous.code);
      }
      if (queue.size >= (opt?.maxEmitQueueSize || 20)) {
        return res.fiveHundo(ctx, next, "busy 😵‍💫");
      }
      await queue.add(async function emitOnTurn() {
        await emitToCache(tsSrcUrl, cache, opt);
        const src = cache.get(jsSrcUrl)?.code;
        return src
          ? res.twoHundoSrcCode(ctx, next, src)
          : res.fiveHundo(ctx, next, `src missing for ${jsSrcUrl}`);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.fourHundo(ctx, next, `failed to emit module: ${msg}`);
    }
  };
};

function cleanupCache(cache: FileSourceCache) {
  const [keyToPurge] =
    [...cache.entries()].reduce<[string, CacheEntry] | null>(
      (lowestHitKey, curr) =>
        !lowestHitKey
          ? curr
          : curr[1].hits < lowestHitKey[1].hits
          ? curr
          : lowestHitKey,
      null
    ) || [];
  if (!keyToPurge) throw new Error(`cache overflow, but no keyToPurge`);
  cache.delete(keyToPurge);
}

async function emitToCache(
  tsSrcUrl: string,
  cache: FileSourceCache,
  opt?: Options
) {
  const { maxModuleBytes = 500_000, maxModuleCacheSize = 1000 } = opt || {};
  const remoteModule = await Deno.emit(tsSrcUrl, {
    check: false,
    compilerOptions: {
      sourceMap: false,
      declarationMap: false,
      inlineSourceMap: false,
    },
  });
  if (remoteModule.diagnostics.length) {
    throw new Error(
      `compilation failed. ${remoteModule.diagnostics.join(", ")}`
    );
  }
  const compiledEntries = Object.entries(remoteModule.files).filter(([f]) =>
    f.endsWith(".js")
  );
  for (const [filename, code] of compiledEntries) {
    if (code.length >= maxModuleBytes) {
      throw new Error(`module too big: ${code.length}`);
    }
    if (cache.size >= maxModuleCacheSize) {
      cleanupCache(cache);
    }
    const toCache = cache.get(filename) || {
      code,
      hits: 0,
    };
    ++toCache.hits;
    cache.set(filename, toCache);
  }
}
export default createHandler;
