import fs from "node:fs";
import path from "node:path";
import { DataSource, Knowledge } from "@botpress/runtime";

const docsPathCandidates = [
  path.resolve(process.cwd(), "src/knowledge/docs"),
  path.resolve(process.cwd(), "../src/knowledge/docs"),
  path.resolve(process.cwd(), "../../src/knowledge/docs"),
  path.resolve(process.cwd(), "./docs")
];

const docsDirectory =
  docsPathCandidates.find((candidate) => {
    try {
      return fs.existsSync(candidate);
    } catch {
      return false;
    }
  }) ?? docsPathCandidates[0];

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
