import { Event, z } from "@botpress/runtime";

export default new Event({
	name: "codeSampleGenerated",
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
});
