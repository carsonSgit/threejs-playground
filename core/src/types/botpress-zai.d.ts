/**
 * Type declarations for @botpress/zai
 *
 * The @botpress/zai package is bundled into @botpress/runtime but not installed
 * as a separate module. These declarations provide type safety for the Zai API
 * used via `adk.zai` from @botpress/runtime.
 *
 * Reference: ADK ZAI Complete Guide
 */
declare module "@botpress/zai" {
	import type { z } from "@botpress/sdk";

	interface TextOptions {
		/** Target length — preset name or token count */
		length?: "short" | "medium" | "long" | number;
		/** Creativity (0-1) */
		temperature?: number;
		/** Optional stop markers */
		stopSequences?: string[];
	}

	interface ExtractOptions {
		/** Guide extraction with instructions */
		instructions?: string;
		/** Max tokens per chunk (default: 16000) */
		chunkLength?: number;
		/** Allow partial matches */
		strict?: boolean;
	}

	interface SummarizeOptions {
		/** Max tokens */
		length?: number;
		/** Focus instructions */
		prompt?: string;
		/** Format as bullet points */
		bulletPoints?: boolean;
	}

	interface CheckResult {
		valueOf(): boolean;
		full(): Promise<{ value: boolean; explanation: string }>;
	}

	interface LabelResult<T extends Record<string, string>> {
		[K: string]: boolean;
		full(): Promise<Record<keyof T, { value: boolean; explanation: string }>>;
	}

	interface AnswerResult {
		type: "answer" | "no_answer" | "irrelevant";
		answer?: string;
		citations?: Array<{ offset: number; item: string; snippet: string }>;
	}

	export class Zai {
		constructor(opts?: Record<string, unknown>);

		/** Generate text from a prompt */
		text(prompt: string, options?: TextOptions): Promise<string>;

		/** Extract structured data from input using a Zod schema */
		extract<T extends z.ZodType>(
			input: string,
			schema: T,
			options?: ExtractOptions,
		): Promise<z.infer<T>>;

		/** Boolean verification with natural language */
		check(
			input: string,
			condition: string,
			options?: {
				examples?: Array<{ input: string; check: boolean; reason: string }>;
			},
		): Promise<CheckResult>;

		/** Multi-label classification */
		label<T extends Record<string, string>>(
			input: string,
			criteria: T,
		): Promise<LabelResult<T>>;

		/** Transform text according to instructions */
		rewrite(input: string, instructions: string): Promise<string>;

		/** Filter arrays using natural language conditions */
		filter<T>(items: T[], condition: string): Promise<T[]>;

		/** Create summaries */
		summarize(input: string, options?: SummarizeOptions): Promise<string>;

		/** Answer questions from documents with citations */
		answer(documents: string[], question: string): Promise<AnswerResult>;
	}
}
