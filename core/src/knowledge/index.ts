import path from "node:path";
import { DataSource, Knowledge } from "@botpress/runtime";

const docsDirectory = path.resolve(process.cwd(), "src/knowledge/docs");

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
