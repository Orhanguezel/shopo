import { createServer } from "http";
import { parse } from "url";
import next from "next";
import compression from "compression";

const port = parseInt(process.env.PORT || "3001", 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

const compress = compression({ level: 6 });

app.prepare().then(() => {
  createServer((req, res) => {
    compress(req, res, () => {
      handle(req, res, parse(req.url, true));
    });
  }).listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
