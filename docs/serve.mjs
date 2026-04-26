// Tiny static server for local development.
// Serves the docs/ directory on http://localhost:8080
// Run: node docs/serve.mjs   (or:  npm run serve)

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname; // serve docs/
const PORT = Number(process.env.PORT) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".mjs":  "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".png":  "image/png",
  ".map":  "application/json",
};

createServer(async (req, res) => {
  try {
    let url = decodeURIComponent(req.url.split("?")[0]);
    if (url.endsWith("/")) url += "index.html";
    const fp = resolve(join(ROOT, url));
    if (!fp.startsWith(ROOT)) { res.writeHead(403).end("Forbidden"); return; }
    const s = await stat(fp);
    if (s.isDirectory()) { res.writeHead(302, { Location: url + "/" }).end(); return; }
    const buf = await readFile(fp);
    const mime = MIME[extname(fp).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "no-cache",
    });
    res.end(buf);
  } catch (e) {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found: " + req.url);
  }
}).listen(PORT, () => {
  console.log(`AlgoTutor dev server running at http://localhost:${PORT}/`);
});
