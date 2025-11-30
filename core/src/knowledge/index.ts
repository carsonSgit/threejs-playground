import { DataSource, Knowledge } from "@botpress/runtime";

const FileSource = DataSource.Directory.fromPath("./docs", {
    filter: (filePath) => filePath.endsWith(".md")
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
