import { Trigger } from "@botpress/runtime";

/**
 * Sends a welcome message when a new webchat conversation starts.
 * Introduces the bot's capabilities and invites the user to explore.
 */
export default new Trigger({
	name: "conversationStarted",
	description:
		"Greets new users when they open the webchat and introduces the playground assistant",
	events: ["webchat:conversationStarted"],

	handler: async ({ event }) => {
		console.log("[Trigger] conversationStarted fired", event.type);
	},
});
