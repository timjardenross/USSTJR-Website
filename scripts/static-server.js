const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");
const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);

const contentTypes = {
    ".css": "text/css",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".md": "text/markdown"
};

function resolveRequestPath(requestUrl) {
    const url = new URL(requestUrl, `http://${host}:${port}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const resolvedPath = path.normalize(path.join(root, pathname));

    if (!resolvedPath.startsWith(root)) {
        return null;
    }

    return resolvedPath;
}

const server = http.createServer(function (request, response) {
    const filePath = resolveRequestPath(request.url);

    if (!filePath) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }

    fs.readFile(filePath, function (error, contents) {
        if (error) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }

        response.writeHead(200, {
            "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
        });
        response.end(contents);
    });
});

server.listen(port, host, function () {
    console.log(`USS TJR static server running at http://${host}:${port}`);
});
