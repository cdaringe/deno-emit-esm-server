import { Middleware } from "oak/middleware.ts";

export const testPageMiddleware: Middleware = (ctx, next) => {
  if (!ctx.request.accepts()?.some((v) => v.match(/(text|html)/))) {
    return next();
  }
  ctx.response.body = `
  <html>
  <body>
  <h1>Import test</h1>
  <script>
    async function importTest(url, field) {
      try {
        const imports = window.testImports = window.testImports || {}
        imports[field] = await import(url)
        console.log(imports[field])
      } catch (err) {
        console.error(err)
      }
    }
    function submit() {
      const libName = document.getElementById('libName').value
      const libUrl = document.getElementById('libUrl').value
      return importTest(libUrl, libName)
    }
  </script>
  <label for='libName'>Library Name</label>
  <input type='text' id='libName' name="libName" value="OakDeps"></input>
  <br/>
  <label for='libUrl'>Library URL</label>
  <input type='text' id='libUrl' name="libUrl" value="/denoland/x/oak@v10.4.0/deps.ts"></input>
  <button type="button" onClick="submit()">Go</button>
  </body></html>`;
  ctx.response.status = 200;
};
