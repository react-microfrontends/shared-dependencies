import globalScripts from "../global-scripts.json" with { type: "json" };
import { x } from "tar";
import { mkdirp } from "mkdirp";
import fs from "fs/promises";

for (let globalScript of globalScripts["global-scripts"]) {
  console.log(globalScript);
  const packageName = globalScript.slice(0, globalScript.lastIndexOf("@"));
  const version = globalScript.slice(globalScript.lastIndexOf("@") + 1);
  const registryResponse = await fetch(
    `https://registry.npmjs.org/${packageName}`,
  );
  if (!registryResponse.ok) {
    throw Error(`Unable to find package '${packageName}' in npm registry`);
  }
  const registryJson = await registryResponse.json();
  const versionInfo = registryJson.versions[version];
  if (!versionInfo) {
    throw Error(
      `package '${packageName}' has not published version '${version}'`,
    );
  }

  const tarballResponse = await fetch(versionInfo.dist.tarball);

  if (!tarballResponse.ok) {
    throw error(`Could not download tarball for package '${globalScripts}'`);
  }

  await mkdirp("./deps");

  // To-do figure out how to pipe the fetch response into tar
  const contents = await tarballResponse.arrayBuffer();

  const tarballPath = `deps/tarball.tar`;

  await fs.writeFile(tarballPath, Buffer.from(contents), "utf-8");

  await x({
    f: tarballPath,
    cwd: `deps`,
  });

  const outputFolder = `deps/npm:${globalScript}`;

  // Create top-level folder for scoped packages
  const outputFolderParts = outputFolder.split("/");
  if (outputFolderParts.length > 2) {
    const pathParts = outputFolder.split("/");
    pathParts.pop();
    await mkdirp(pathParts.join("/"));
  }

  await fs.rename(`deps/package`, outputFolder);

  await fs.unlink(tarballPath);
}
