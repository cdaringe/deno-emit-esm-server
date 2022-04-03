# emit_esm_server

Produce ad-hoc ESM given a `deno` GitHub module URL.

[![main](https://github.com/cdaringe/deno-emit-esm-server/actions/workflows/main.yml/badge.svg)](https://github.com/cdaringe/deno-emit-esm-server/actions/workflows/main.yml)

**input**:

One of:

- `HTTP GET <origin>/denoland/x/:pkg[@:version]/path/to/mod.ts`
- `HTTP GET <origin>/github/:owner/:repo/:branch/path/to/mod.ts`

When a module includes a URL to an external module (https://foo.org/bar/mod.ts),
it is rewritten to `<ESM_EMIT_SERVER_ORIGIN>?moduleUrl=<url>`

**output**: ESM source code

## configuration

- `EMIT_SERVER_ORIGIN` - the origin of where your server is hosted. used to rewrite HTTP imports back to your server

## warning

Non-production ready :)

## Example

- (optional) build the server:
  `docker build --platform linux/arm64/v8 --progress=plain -t cdaringe/deno_emit_server .`
- run the server:
  `docker run --platform linux/arm64/v8 --rm -p 7777:7777 cdaringe/deno_emit_server`
- request a TypeScript module as an ECMAScript Module:
  `curl localhost:7777/github/denoland/deno_std/main/log/logger.ts`

```js
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { getLevelByName, getLevelName, LogLevels } from "./levels.ts";
export class LogRecord {
    msg;
    #args;
    #datetime;
    level;
    levelName;
    loggerName;
// ...snip snip...
```

## todo

- [ ] source rewrite
  - when imports to foreign TS sources detected
    - detect if they can be re-written
    - if they can, do it
    - if they cant, 400 with meaningful error message. "source importing from
      XYZ, but unable to convert XZY to JS"... or...
      - just rewrite the current host, and add a ?src=encodedUrl
