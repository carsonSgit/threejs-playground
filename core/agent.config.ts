import { defineConfig, z } from "@botpress/runtime";

export default defineConfig({
	name: "core",
	description: "AI assistant for the Three.js Playground",
	defaultModels: {
		autonomous: "openai:gpt-4o-mini",
		zai: "openai:gpt-4o-mini",
	},
	bot: {
		state: z.object({}),
	},
	user: {
		state: z.object({
			recentlyViewedExamples: z
				.array(
					z.object({
						slug: z.string(),
						viewedAt: z.string(),
					}),
				)
				.optional(),
			favoriteExamples: z.array(z.string()).optional(),
			preferences: z
				.object({
					complexityLevel: z
						.enum(["beginner", "intermediate", "advanced"])
						.optional(),
					preferredCategory: z.string().optional(),
				})
				.optional(),
		}),
	},
	dependencies: {
		integrations: {
			webchat: { version: "webchat@0.3.0", enabled: true },
			chat: { version: "chat@0.3.0", enabled: true },
		},
	},
});
