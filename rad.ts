import type { Task, Tasks } from "https://deno.land/x/rad/src/mod.ts";

const format: Task = `deno fmt`;
const lint: Task = `deno lint`;
const check: Task = {
  dependsOn: [format, lint],
  dependsOnSerial: true,
};
export const tasks: Tasks = {
  ...{ format, f: format },
  ...{ lint, l: lint },
  ...{ check, c: check },
};
