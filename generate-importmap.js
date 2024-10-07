import template from "./importmap-template.json" with { type: "json" };
import { Generator } from "@jspm/generator";
import fs from "node:fs/promises";
import { mkdirp } from "mkdirp";
import path from "path";

const generatorOptions = {
  baseUrl: "https://react.microfrontends.app/deps/",
  mapUrl: "https://react.microfrontends.app/importmap.json",
  integrity: true,
};

const importMapGenerator = new Generator(generatorOptions);

const downloadedUrls = [];

// Install shared dependencies into import map
console.log("Creating import map");
for (const importMapKey in template.imports) {
  await importMapGenerator.install(
    processImportMapEntry(importMapKey, template.imports[importMapKey]),
  );
}

// Download all files in the import map to deps folder
await downloadFromGenerator(importMapGenerator);

const scopeGenerators = {};

for (const microfrontendName in template.scopes ?? {}) {
  const scopeGenerator = new Generator(generatorOptions);
  for (const importMapKey in template.scopes[microfrontendName]) {
    await scopeGenerator.install(
      processImportMapEntry(
        importMapKey,
        template.scopes[microfrontendName][importMapKey],
      ),
    );
  }

  scopeGenerators[microfrontendName] = scopeGenerator;

  await downloadFromGenerator(scopeGenerator);
}

const baseHost = process.env.DEV
  ? "http://127.0.0.1:8080"
  : "https://react.microfrontends.app/deps";

const finalMap = importMapGenerator.getMap();
if (!finalMap.scopes) {
  finalMap.scopes = {};
}

for (const microfrontendName in scopeGenerators) {
  const generator = scopeGenerators[microfrontendName];
  const cdnFolder = microfrontendName.replace("@react-mf/", "");
  const scopeMap = generator.getMap();

  finalMap.scopes[`https://react.microfrontends.app/${cdnFolder}/`] = {
    ...(finalMap.scopes[microfrontendName] ?? {}),
    // TODO - account for its scopes
    ...scopeMap.imports,
  };

  finalMap.integrity = {
    ...finalMap.integrity,
    ...scopeMap.integrity,
  };
}

// Replace public CDN urls with self-hosted urls in import map
const importMapString = JSON.stringify(finalMap, null, 2).replace(
  /https:\/\/ga.jspm.io/g,
  baseHost,
);

console.log(importMapString);

// Write final import map
await mkdirp("dist");
await fs.writeFile("dist/app.importmap", importMapString, "utf-8");

function processImportMapEntry(importMapKey, importMapValue) {
  return `${importMapKey}@${importMapValue}`;
}

async function downloadFromGenerator(generator) {
  for (let url in generator.getMap().integrity) {
    if (downloadedUrls.includes(url)) {
      break;
    }
    console.log(url);
    const r = await fetch(url);
    if (r.ok) {
      const filePath = `./deps/${url.replace("https://ga.jspm.io/", "")}`;
      const dir = path.dirname(filePath);
      await mkdirp(dir);
      await fs.writeFile(filePath, await r.text(), "utf-8");
      downloadedUrls.push(url);
    } else {
      throw Error(`Unable to download file from JSPM CDN - url '${url}'`);
    }
  }
}
