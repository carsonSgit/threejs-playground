import { Action, z } from "@botpress/runtime";

export default new Action({
	name: "generateCodeSnippet",
	description:
		"Generate a code snippet or example code for Three.js concepts based on playground examples",
	input: z.object({
		concept: z.string().describe("The Three.js concept or feature to generate code for"),
		exampleSlug: z
			.string()
			.optional()
			.describe("Optional: base the snippet on a specific example"),
		complexity: z
			.enum(["simple", "intermediate", "advanced"])
			.optional()
			.describe("Desired complexity level"),
	}),
	output: z.object({
		code: z.string().describe("The generated code snippet"),
		language: z.string().describe("The programming language (usually 'typescript')"),
		explanation: z.string().describe("Brief explanation of the code"),
	}),
	async handler({ input }) {
		// This is a placeholder - @TODO: AI gen code snippet, create a template library and a sandbox for the user to run & edit the code
		const baseSnippet = `import * as THREE from "three";

        // ${input.concept}
        // This is a code snippet for: ${input.concept}
        ${input.exampleSlug ? `// Based on example: ${input.exampleSlug}` : ""}

        // Add your implementation here
    `;

		return {
			code: baseSnippet,
			language: "typescript",
			explanation: `Code snippet for ${input.concept}${input.exampleSlug ? ` based on the ${input.exampleSlug} example` : ""}. This is a template that you can customize for your needs.`,
		};
	},
});

