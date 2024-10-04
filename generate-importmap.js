import template from "./importmap-template.json" with { type: "json" };
import { Generator } from "@jspm/generator";
import fs from "node:fs/promises";
import { mkdirp } from "mkdirp";
import path from "path";

const importMapGenerator = new Generator({
  baseUrl: "https://react.microfrontends.app/deps/",
  mapUrl: "https://react.microfrontends.app/importmap.json",
  integrity: true,
});

// Install shared dependencies into import map
console.log("Creating import map");
for (let module in template.imports) {
  const installString = `${module}@${template.imports[module]}`;
  console.log(installString);
  await importMapGenerator.install(installString);
}

// Download all files in the import map to dist folder
console.log("Downloading files");
for (let url in importMapGenerator.getMap().integrity) {
  console.log(url);
  const r = await fetch(url);
  if (r.ok) {
    const filePath = `./dist/${url.replace("https://ga.jspm.io/", "")}`;
    const dir = path.dirname(filePath);
    await mkdirp(dir);
    await fs.writeFile(filePath, await r.text(), "utf-8");
  } else {
    throw Error(`Unable to download file from JSPM CDN - url '${url}'`);
  }
}

const baseHost = process.env.DEV
  ? "http://127.0.0.1:8080"
  : "https://react.microfrontends.app";

// Replace public CDN urls with self-hosted urls in import map
const importMapString = JSON.stringify(
  importMapGenerator.getMap(),
  null,
  2,
).replace(/https:\/\/ga.jspm.io/g, baseHost);

// Write final import map
await fs.writeFile("dist/app.importmap", importMapString, "utf-8");
