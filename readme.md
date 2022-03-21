# deno-emit-esm-server

input: `GET <origin>/github/:owner/:repo/path/to/deno/module.ts`
output: ESM source code

## warning

Non-production ready :)

## Example

- (optional) build the server: `docker build --platform linux/arm64/v8 --progress=plain -t cdaringe/deno-emit-server .`
- run the server: `docker run --platform linux/arm64/v8 --rm -p 7777:7777 cdaringe/deno-emit-server`
- request a TypeScript module as an ECMAScript Module: `curl localhost:7777/github/denoland/deno_std/main/log/logger.ts`

```js
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
import { getLevelByName, getLevelName, LogLevels } from "./levels.ts.js";
export class LogRecord {
    msg;
    #args;
    #datetime;
    level;
    levelName;
    loggerName;
// ...snip snip...
```
