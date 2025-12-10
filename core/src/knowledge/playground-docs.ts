import { DataSource, Knowledge } from "@botpress/runtime";

export default new Knowledge({
	name: "playground-docs",
	description: "Three.js Playground examples documentation",
	sources: [DataSource.Directory.fromPath("./src/knowledge/docs")],
});
