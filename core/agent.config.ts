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
			skillLevels: z
				.object({
					geometry: z.number().min(0).max(5).optional(),
					materials: z.number().min(0).max(5).optional(),
					shaders: z.number().min(0).max(5).optional(),
					animation: z.number().min(0).max(5).optional(),
					postprocessing: z.number().min(0).max(5).optional(),
				})
				.optional(),
			completedTopics: z.array(z.string()).optional(),
			totalGenerations: z.number().optional(),
		}),
	},
	events: {
		codeSampleGenerated: {
			description: "Triggered when AI generates a new Three.js code sample",
			schema: z.object({
				sampleId: z.string(),
				title: z.string(),
				code: z.string(),
				concept: z.string(),
				explanation: z.string(),
				complexity: z.enum(["beginner", "intermediate", "advanced"]),
				userId: z.string().optional(),
			}),
		},
	},
	dependencies: {
		integrations: {
			webchat: { version: "webchat@0.3.0", enabled: true },
			chat: { version: "chat@0.3.0", enabled: true },
		},
	},
});
