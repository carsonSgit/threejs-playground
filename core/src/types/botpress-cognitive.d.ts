/**
 * Type declarations for @botpress/cognitive
 *
 * The @botpress/cognitive package is bundled into @botpress/runtime but not
 * installed as a separate module. These declarations provide type safety for
 * the Cognitive API used via `context.get("cognitive")`.
 *
 * Reference: ADK Context API docs (cognitive section)
 */
declare module "@botpress/cognitive" {
	interface Message {
		role: "user" | "assistant" | "system";
		content: string;
	}

	interface GenerateContentOptions {
		model: string;
		messages: Message[];
		temperature?: number;
		maxTokens?: number;
	}

	interface Response {
		content: string;
		meta?: {
			model?: string;
			tokens?: {
				input?: number;
				output?: number;
			};
		};
	}

	export class Cognitive {
		/** Generate content using an LLM model */
		generateContent(options: GenerateContentOptions): Promise<Response>;

		/** Generate text using an LLM model (alternative API) */
		generateText(options: GenerateContentOptions): Promise<Response>;
	}
}
