/* ============================================================
   Local dev proxy for the checklist-translations prototype.

   - Serves the static prototype files (index.html, css, js).
   - Exposes POST /translate, which forwards to the Anthropic API using
     ANTHROPIC_API_KEY from the environment. The key never reaches the browser.

   The key can come from (any one of):
     1. a .env file next to this script (auto-loaded below) — ANTHROPIC_API_KEY=sk-ant-...
     2. an inline env var:   ANTHROPIC_API_KEY=sk-ant-... node proxy.js
     3. an exported var:     export ANTHROPIC_API_KEY=sk-ant-...  then  node proxy.js

   Open:  http://localhost:8787/
   ============================================================ */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Auto-load a .env file sitting next to this script, if present. Lines are
// KEY=value; existing environment variables always win. Keeps the key out of
// the browser and out of your shell history.
(function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const raw of fs.readFileSync(envPath, "utf8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
})();

const PORT = process.env.PORT || 8787;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const ROOT = __dirname;

// The translator lives in ../translator and runs in its own venv (anthropic + openai).
const TRANSLATOR_DIR = path.join(ROOT, "..", "translator");
const VENV_PY = path.join(TRANSLATOR_DIR, ".venv", "bin", "python");
const PY = fs.existsSync(VENV_PY) ? VENV_PY : "python3";
const RUNNER = path.join(TRANSLATOR_DIR, "translate_run.py");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

/* ---- run the translator and STREAM its NDJSON output to the HTTP response ----
   The Python script emits one JSON object per line as it works:
     {"type":"log","line":"..."}  — streamed live, one per log line
     {"type":"result", strings, log, stats}  — final
     {"type":"error", error, log}
   The proxy forwards each line straight to the browser as it arrives, so the
   console fills in real time. The ANTHROPIC_API_KEY from the proxy's env is
   passed through; the deprecated hardcoded key in the script is never used. */
function streamTranslate(request, res) {
  const child = spawn(PY, [RUNNER], {
    cwd: TRANSLATOR_DIR,
    env: { ...process.env, ANTHROPIC_API_KEY: API_KEY },
  });
  res.writeHead(200, {
    "content-type": "application/x-ndjson; charset=utf-8",
    "cache-control": "no-cache",
    "x-accel-buffering": "no",
  });

  let stderr = "", buf = "";
  child.stdout.on("data", (chunk) => {
    buf += chunk;
    let nl;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.trim()) res.write(line + "\n"); // forward each NDJSON line immediately
    }
  });
  child.stderr.on("data", (c) => (stderr += c));
  child.on("error", (e) => {
    res.write(JSON.stringify({ type: "error", error: String(e.message || e) }) + "\n");
    res.end();
  });
  child.on("close", (code) => {
    if (buf.trim()) res.write(buf.trim() + "\n"); // flush any partial last line
    if (code !== 0 && !stderr.includes("")) {
      res.write(JSON.stringify({ type: "error", error: `translator exited ${code}: ${stderr}` }) + "\n");
    }
    res.end();
  });
  child.stdin.write(JSON.stringify(request));
  child.stdin.end();
}

/* ---- server ---- */
const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/translate") {
    if (!API_KEY) {
      res.writeHead(200, { "content-type": "application/x-ndjson" });
      res.end(JSON.stringify({ type: "error", error: "ANTHROPIC_API_KEY is not set on the proxy" }) + "\n");
      return;
    }
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      let reqObj;
      try { reqObj = JSON.parse(body); }
      catch (e) {
        res.writeHead(200, { "content-type": "application/x-ndjson" });
        res.end(JSON.stringify({ type: "error", error: "bad request" }) + "\n");
        return;
      }
      streamTranslate(reqObj, res);
    });
    return;
  }

  // static files
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": MIME[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Prototype:  http://localhost:${PORT}/`);
  console.log(`Translator: ${RUNNER}`);
  console.log(`Python:     ${PY}`);
  console.log(`API key:    ${API_KEY ? "loaded from env" : "MISSING — set ANTHROPIC_API_KEY"}`);
});
