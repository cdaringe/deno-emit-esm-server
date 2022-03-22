import { Context } from "https://deno.land/x/oak/mod.ts";

export const fourHundo = async (
  ctx: Context,
  next: () => Promise<unknown>,
  errorMsg: string,
) => {
  ctx.response.body = { error: errorMsg };
  ctx.response.status = 400;
  ctx.response.headers.set("content-type", "application/json; charset=utf-8");
  await next();
};

export const fiveHundo = async (
  ctx: Context,
  next: () => Promise<unknown>,
  errorMsg: string,
) => {
  ctx.response.body = { error: errorMsg };
  ctx.response.status = 500;
  ctx.response.headers.set("content-type", "application/json; charset=utf-8");
  await next();
};

export const twoHundoSrcCode = async (
  ctx: Context,
  next: () => Promise<unknown>,
  code: string,
) => {
  ctx.response.body = code;
  ctx.response.status = 200;
  ctx.response.headers.set("content-type", "text/javascript");
  await next();
};
