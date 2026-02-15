import { Autonomous, adk, user, z } from "@botpress/runtime";

/**
 * Topics available in the Three.js Playground learning path.
 */
const TOPIC_AREAS = [
	"geometry",
	"materials",
	"shaders",
	"animation",
	"postprocessing",
	"lighting",
	"particles",
	"physics",
	"raycasting",
	"textures",
	"scene-composition",
	"performance-optimization",
] as const;

export const suggestNextTopicTool = new Autonomous.Tool({
	name: "suggest_next_topic",
	description:
		"Suggest the next Three.js topic for the user to learn based on their skill profile, completed topics, and interests. Use this proactively after the user has explored several examples or asks 'what should I learn next?'",
	input: z.object({
		currentContext: z
			.string()
			.optional()
			.describe("What the user is currently working on or interested in"),
	}),
	output: z.object({
		topic: z.string(),
		reason: z.string(),
		suggestedPrompt: z.string(),
		difficulty: z.enum(["beginner", "intermediate", "advanced"]),
	}),
	handler: async ({ currentContext }: { currentContext?: string }) => {
		// Gather user profile data
		const profileParts: string[] = [];

		const state = user.state as Record<string, unknown>;
		const skillLevels = state.skillLevels as
			| Record<string, number | undefined>
			| undefined;
		if (skillLevels) {
			const skills = Object.entries(skillLevels)
				.filter(([, v]) => v !== undefined && v !== null)
				.map(([k, v]) => `${k}: ${v}/5`);
			if (skills.length > 0) {
				profileParts.push(`Current skill levels: ${skills.join(", ")}`);
			}
		}

		const completedTopics = state.completedTopics as string[] | undefined;
		if (completedTopics && completedTopics.length > 0) {
			profileParts.push(
				`Topics already covered: ${completedTopics.join(", ")}`,
			);
		}

		const recent = user.state.recentlyViewedExamples;
		if (recent && recent.length > 0) {
			const slugs = recent.slice(0, 5).map((r) => r.slug);
			profileParts.push(`Recently viewed: ${slugs.join(", ")}`);
		}

		const complexity = user.state.preferences?.complexityLevel;
		if (complexity) {
			profileParts.push(`Preferred difficulty: ${complexity}`);
		}

		const preferredCategory = user.state.preferences?.preferredCategory;
		if (preferredCategory) {
			profileParts.push(`Preferred category: ${preferredCategory}`);
		}

		if (currentContext) {
			profileParts.push(`Currently interested in: ${currentContext}`);
		}

		const profileSummary =
			profileParts.length > 0
				? profileParts.join("\n")
				: "Brand new user with no history";

		const availableTopics = TOPIC_AREAS.join(", ");

		// Generate suggestion using Zai
		const suggestionText = await adk.zai.text(
			`You are a Three.js learning advisor. Based on this user profile, suggest ONE specific Three.js topic they should learn next.

User Profile:
${profileSummary}

Available topic areas: ${availableTopics}

Respond with:
- Topic name (specific, e.g. "Vertex Shaders for Terrain Generation" not just "shaders")
- Why this topic is the right next step for this user
- A specific prompt they could give the code generator to practice this topic
- Difficulty level (beginner, intermediate, or advanced)

Be specific and creative. Match difficulty to the user's current level.`,
			{ temperature: 0.8, length: "medium" },
		);

		// Extract structured data from the text
		const suggestion = await adk.zai.extract(
			suggestionText,
			z.object({
				topic: z.string().describe("The specific topic name"),
				reason: z.string().describe("Why this is the right next step"),
				suggestedPrompt: z
					.string()
					.describe(
						"A specific prompt for the code generator to practice this topic",
					),
				difficulty: z.enum(["beginner", "intermediate", "advanced"]),
			}),
		);

		return suggestion;
	},
});
