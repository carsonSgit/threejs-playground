import { adk, context, Trigger, user } from "@botpress/runtime";

/**
 * Sends a contextual welcome message when a new webchat conversation starts.
 * Differentiates between first-time visitors and returning users to provide
 * a personalized greeting with relevant suggestions.
 */
export default new Trigger({
	name: "conversationStarted",
	description:
		"Greets users when they open the webchat with a personalized welcome based on their history",
	events: ["webchat:conversationStarted"],

	handler: async ({
		event,
	}: {
		event: { type: string; conversationId?: string; payload: unknown };
	}) => {
		console.log("[Trigger] conversationStarted fired", event.type);

		const client = context.get("client");
		const conversationId = event.conversationId;

		if (!conversationId) {
			console.warn("[Trigger] No conversationId on conversationStarted event");
			return;
		}

		try {
			const isReturningUser = hasUserHistory();
			const greeting = isReturningUser
				? await buildReturningUserGreeting()
				: buildFirstTimeGreeting();

			await (
				client as unknown as {
					createMessage(args: {
						conversationId: string;
						type: string;
						payload: { text: string };
						tags: Record<string, string>;
					}): Promise<unknown>;
				}
			).createMessage({
				conversationId,
				type: "text",
				payload: { text: greeting },
				tags: {},
			});
		} catch (error) {
			console.error("[Trigger] Failed to send welcome message:", error);
		}
	},
});

/**
 * Check whether the user has any interaction history.
 */
function hasUserHistory(): boolean {
	const recent = user.state.recentlyViewedExamples;
	const favorites = user.state.favoriteExamples;
	const prefs = user.state.preferences;
	const state = user.state as Record<string, unknown>;
	const completed = state.completedTopics as string[] | undefined;

	return Boolean(
		(recent && recent.length > 0) ||
			(favorites && favorites.length > 0) ||
			(completed && completed.length > 0) ||
			prefs?.complexityLevel,
	);
}

/**
 * Build a static first-time greeting. No AI call needed — keeps it instant.
 */
function buildFirstTimeGreeting(): string {
	return `Hey! 👋 Welcome to the **Three.js Playground**.

I can help you:
- 🔍 **Browse** the example gallery — try asking "show me examples"
- 📖 **Learn** about any example in depth
- ✨ **Generate** custom Three.js code — just describe what you want to see

What would you like to explore?`;
}

/**
 * Build a personalized returning user greeting using Zai for natural phrasing.
 */
async function buildReturningUserGreeting(): Promise<string> {
	const parts: string[] = [];

	const recent = user.state.recentlyViewedExamples;
	if (recent && recent.length > 0) {
		const lastSeen = recent[0];
		parts.push(
			`Last time you were checking out the "${lastSeen.slug}" example.`,
		);
	}

	const favorites = user.state.favoriteExamples;
	if (favorites && favorites.length > 0) {
		parts.push(`Your favorites: ${favorites.join(", ")}.`);
	}

	const complexity = user.state.preferences?.complexityLevel;
	if (complexity) {
		parts.push(`Skill level: ${complexity}.`);
	}

	const profileSummary = parts.join(" ");

	try {
		const greeting = await adk.zai.text(
			`Write a short, friendly welcome-back message (2-3 sentences max) for a returning user of the Three.js Playground.
User context: ${profileSummary}
Suggest one specific thing they could try next based on their history. Be casual and enthusiastic about 3D graphics. Do NOT use markdown headers.`,
			{ temperature: 0.8, length: "short" },
		);

		return greeting;
	} catch {
		// Fallback if Zai call fails — still personalized from state
		return `Welcome back! 👋 ${profileSummary}\n\nWhat would you like to explore today?`;
	}
}
