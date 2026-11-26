// Tiny static server for local testing of app/ (Node 22, standard library
// only). Run `node serve.ts` and open http://localhost:8080, or pass
// `--port <n>` for another port. It only serves files under app/, sends the
// MIME types a browser needs, and refuses paths that climb out of app/.
// A development convenience, not a production server.

import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(fileURLToPath(new URL("./app", import.meta.url)));
const argv = process.argv.slice(2);
const portFlag = argv.indexOf("--port");
const wanted = portFlag === -1 ? 8080 : Number(argv[portFlag + 1]);
const port = Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

createServer((req, res) => {
  let path;
  try {
    path = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("bad request");
    return;
  }
  if (path.endsWith("/")) path += "index.html";
  const file = resolve(join(appRoot, normalize(path)));
  if (file !== appRoot && !file.startsWith(appRoot + sep)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  let bytes;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error("not a file");
    bytes = info.size;
  } catch {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
    "content-length": bytes,
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log("NestEgg app/ is on http://localhost:" + port);
});
