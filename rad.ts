import type { Task, Tasks } from "https://deno.land/x/rad/src/mod.ts";

const format: Task = `deno fmt`;
const lint: Task = `deno lint`;
const check: Task = {
  dependsOn: [format, lint],
  dependsOnSerial: true,
};

// curl http://localhost:7777/github/denoland/deno_std/blob/main/uuid/mod.ts
const start: Task = `deno run --unstable -A bin.ts`;
export const tasks: Tasks = {
  ...{ start, s: start },
  ...{ format, f: format },
  ...{ lint, l: lint },
  ...{ check, c: check },
};
