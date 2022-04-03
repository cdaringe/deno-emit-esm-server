/**
 * Wish this was a visitor
 * https://github.com/swc-project/swc/discussions/3540#discussioncomment-2458948
 */
export const rewriteImports = (
  code: string,
  {
    originatingModuleUrl,
    origin,
  }: {
    originatingModuleUrl: string;
    origin: string;
  }
) =>
  code
    .replace(
      /(from )('|"|`)(\..+)('|"|`)/g,
      function relativeImportToAbsoluteUrl(_, f, q0, relativeUri, q1) {
        const url = new URL(relativeUri, originatingModuleUrl);
        return `${f}${q0}${url.toString()}${q1}`;
      }
    )
    .replace(
      /(from )('|"|`)(http[^'"]+\.ts)('|"|`)/g,
      function toEmitServerUrl(_, f, q0, uri, q1) {
        const url = new URL(origin);
        url.searchParams.set("moduleUrl", uri);
        return `${f}${q0}${url.toString()}${q1}`;
      }
    );
