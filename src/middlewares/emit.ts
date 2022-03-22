import { Middleware } from "https://deno.land/x/oak/middleware.ts";
import * as res from "../responses.ts";
import PQueue from "https://deno.land/x/p_queue@1.0.1/mod.ts";
import { getProxyUrls } from "./emit/proxy-url.ts";
type Options = {
  cacheEntryTimeout?: number;
  maxModuleBytes?: number;
  maxModuleCacheSize?: number;
  maxEmitQueueSize?: number;
};

type CacheEntry = {
  code: string;
  hits: number;
  clearInterval: null | number;
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
    const { tsSrcUrl, jsSrcUrl } = getProxyUrls(ctx.request.url) || {};
    if (!tsSrcUrl || !jsSrcUrl) {
      return res.fourHundo(ctx, next, "no module github pathname");
    }
    try {
      const previous = cache.get(jsSrcUrl);
      if (previous) {
        ++previous.hits;
        return res.twoHundoSrcCode(ctx, next, previous.code);
      }
      if (queue.size >= (opt?.maxEmitQueueSize || 20)) {
        return res.fiveHundo(ctx, next, "busy 😵‍💫");
      }
      await queue.add(async function emitOnTurn() {
        const entry = await emitToCache(tsSrcUrl, cache, opt);
        return entry
          ? res.twoHundoSrcCode(ctx, next, entry.code)
          : res.fiveHundo(ctx, next, `src missing for ${jsSrcUrl}`);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.fourHundo(ctx, next, `failed to emit module: ${msg}`);
    }
  };
};

function cleanupCache(cache: FileSourceCache) {
  const [keyToPurge] = [...cache.entries()].reduce<[string, CacheEntry] | null>(
    (lowestHitKey, curr) =>
      !lowestHitKey
        ? curr
        : curr[1].hits < lowestHitKey[1].hits
        ? curr
        : lowestHitKey,
    null,
  ) || [];
  if (!keyToPurge) throw new Error(`cache overflow, but no keyToPurge`);
  cache.delete(keyToPurge);
}

async function emitToCache(
  tsSrcUrl: string,
  cache: FileSourceCache,
  opt?: Options,
) {
  const { maxModuleBytes = 500_000, maxModuleCacheSize = 1000 } = opt || {};
  const resolvedUrl = await fetch(tsSrcUrl).then((res) => {
    res.body?.cancel();
    return res.url;
  });
  // optimization - if there's a cache hit on URL resolve... use it
  if (resolvedUrl !== tsSrcUrl && cache.get(`${resolvedUrl}.js`)) {
    return;
  }
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
      `compilation failed. ${remoteModule.diagnostics.join(", ")}`,
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
      clearInterval: null,
    };
    if (typeof toCache.clearInterval === "number") {
      clearTimeout(toCache.clearInterval);
    }
    if (opt?.cacheEntryTimeout) {
      toCache.clearInterval = setTimeout(
        () => cache.delete(filename),
        opt!.cacheEntryTimeout!,
      );
    }
    ++toCache.hits;
    cache.set(filename, toCache);
  }
  return cache.get(`${resolvedUrl}.js`);
}
export default createHandler;
