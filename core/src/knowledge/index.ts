import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DataSource, Knowledge } from "@botpress/runtime";

const locateDocsDirectory = () => {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const searchBases = [process.cwd(), moduleDir];
  const relativeTargets = ["src/knowledge/docs", "core/src/knowledge/docs", "docs"];

  for (const base of searchBases) {
    let current = base;
    for (let i = 0; i < 6; i++) {
      for (const rel of relativeTargets) {
        const candidate = path.resolve(current, rel);
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  }

  return path.resolve(process.cwd(), "src/knowledge/docs");
};

const docsDirectory = locateDocsDirectory();

const FileSource = DataSource.Directory.fromPath(docsDirectory, {
  filter: (filePath) => filePath.endsWith(".md"),
});

const WebsiteSource = DataSource.Website.fromUrls([
    "https://threejs.org/docs/"
]);

export default new Knowledge({
    name: "documentation",
    description: "Documentation of examples within the Three.js Playground",
    sources: [
        FileSource,
        WebsiteSource
    ]
});
