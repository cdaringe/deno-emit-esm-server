export function getProxyUrls(url: URL) {
  if (url.pathname.startsWith("/github/")) {
    const [_, rawModulePathname] = url.pathname.split("github/");
    const tsSrcUrl = `https://raw.githubusercontent.com/${rawModulePathname}`;
    const jsSrcUrl = `${tsSrcUrl}.js`;
    return { tsSrcUrl, jsSrcUrl };
  } else if (url.pathname.startsWith("/denoland/x/")) {
    const [_, rawModulePathname] = url.pathname.split("denoland/x/");
    const tsSrcUrl = `https://deno.land/x/${rawModulePathname}`;
    const jsSrcUrl = `${tsSrcUrl}.js`;
    return { tsSrcUrl, jsSrcUrl };
  }
  return null;
}
