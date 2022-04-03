import type { Task, Tasks } from "https://deno.land/x/rad/src/mod.ts";

const test: Task = `deno test -A --unstable --coverage=cov_profile --import-map=import_map.json $(fd .test.ts)`;
const testWatch: Task = `${test} --watch`;

const format: Task = `deno fmt`;
const lint: Task = `deno lint`;
const check: Task = {
  dependsOn: [format, lint, test],
  dependsOnSerial: true,
};

// curl http://localhost:7777/github/denoland/deno_std/main/uuid/mod.ts
// curl https://esmserver.cdaringe.com/github/denoland/deno_std/main/uuid/mod.ts
const start: Task = `deno run --unstable --import-map=import_map.json -A src/bin.ts`;

export const tasks: Tasks = {
  ...{ start, s: start },
  ...{ format, f: format },
  ...{ lint, l: lint },
  ...{ check, c: check },
  ...{ test, t: test, testWatch, tw: testWatch },
};
