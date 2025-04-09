import mustache from "mustache";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const manifest = JSON.parse(
  readFileSync(
    resolve(import.meta.dirname, "./out/renderer/.vite/manifest.json"),
    "utf-8",
  ),
);

const template = readFileSync(
  resolve(import.meta.dirname, "./out/renderer/entry.js"),
  "utf-8",
);

const data = {
  manifest: JSON.stringify({ "index.html": manifest["index.html"] }),
};

const output = mustache.render(template, data);

writeFileSync(
  resolve(import.meta.dirname, "./out/renderer/entry.js"),
  output,
  "utf-8",
);
