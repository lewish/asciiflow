/**
 * Simple static file server for serving built assets in e2e tests.
 * Serves files from a directory on a specified port.
 *
 * Usage: node static-server.mjs [--port PORT] [--dir DIR]
 */
import { createServer } from "http"
import { readFile } from "fs/promises"
import { join, extname } from "path"

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
}

function parseArgs(args) {
  const result = { port: 8080, dir: "." }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) result.port = parseInt(args[++i])
    if (args[i] === "--dir" && args[i + 1]) result.dir = args[++i]
  }
  return result
}

const config = parseArgs(process.argv.slice(2))

const server = createServer(async (req, res) => {
  let filePath = req.url === "/" ? "/index.html" : req.url
  // Strip query strings
  filePath = filePath.split("?")[0]

  const fullPath = join(config.dir, filePath)
  const ext = extname(fullPath)
  const contentType = MIME_TYPES[ext] || "application/octet-stream"

  try {
    const data = await readFile(fullPath)
    res.writeHead(200, { "Content-Type": contentType })
    res.end(data)
  } catch {
    // For SPA routing, serve index.html on 404
    try {
      const indexData = await readFile(join(config.dir, "index.html"))
      res.writeHead(200, { "Content-Type": "text/html" })
      res.end(indexData)
    } catch {
      res.writeHead(404)
      res.end("Not found")
    }
  }
})

server.listen(config.port, () => {
  console.log(`Static server listening on http://localhost:${config.port}`)
  console.log(`Serving files from: ${config.dir}`)
})
