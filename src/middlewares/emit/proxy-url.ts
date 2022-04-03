export function getProxyUrls(url: URL) {
  const moduleUrl = url.searchParams.get("moduleUrl");
  if (moduleUrl) {
    return moduleUrl;
  } else if (url.pathname.startsWith("/github/")) {
    const [_, rawModulePathname] = url.pathname.split("github/");
    return `https://raw.githubusercontent.com/${rawModulePathname}`;
  } else if (url.pathname.startsWith("/denoland/x/")) {
    const [_, rawModulePathname] = url.pathname.split("denoland/x/");
    return `https://deno.land/x/${rawModulePathname}`;
  }
  return null;
}
