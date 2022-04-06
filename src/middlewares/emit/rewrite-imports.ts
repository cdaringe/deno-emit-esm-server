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
  },
) => {
  return code
    .replace(
      /(from )('|"|`)(\.[^("|'|`)]+)('|"|`)/g,
      function relativeImportToAbsoluteUrl(_, f, q0, relativeUri, q1) {
        const url = new URL(relativeUri, originatingModuleUrl);
        const nextFragment = `${f}${q0}${
          decodeURIComponent(
            url.toString(),
          )
        }${q1}`;
        return nextFragment;
      },
    )
    .replace(
      /(from )('|"|`)(http[^'"]+\.t?j?s)('|"|`)/g,
      function toEmitServerUrl(_, f, q0, uri, q1) {
        const url = new URL(origin);
        url.searchParams.set("moduleUrl", uri);
        return `${f}${q0}${decodeURIComponent(url.toString())}${q1}`;
      },
    );
};
