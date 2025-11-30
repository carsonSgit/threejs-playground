import { Conversation } from "@botpress/runtime";
import knowledge from "../knowledge";

const intro = new Set<string>();

export default new Conversation({
  channel: "*",
  handler: async (context) => {
    if (context.type !== "message") {
      return;
    }

    if (!intro.has(context.conversation.id)) {
      intro.add(context.conversation.id);
      await context.conversation.send({
        type: "choice",
        payload: {
          text: "integrated with knowledge base",
          options: [
            { label: "Tell me about ASCII Earth", value: "Tell me about the ASCII Earth demo" },
            { label: "Explain the Boiling Star", value: "Explain how the Boiling Star effect works" },
            { label: "How does Particle Network work?", value: "How does the Particle Network demo work?" },
          ],
        },
      });
    }

    await context.execute({
      instructions: `You are a helpful assistant for the Three.js Playground - a collection of interactive WebGL experiments and visual effects.

      ONLY answer using the information contained in the provided knowledge documents. Do not invent facts that are not explicitly covered. If the knowledge base does not mention something, reply that the documentation does not cover it yet.

      You can help users with:
      - Understanding the different demos (ASCII Earth, Boiling Star, Particle Network)
      - Explaining Three.js concepts used in the examples
      - Answering questions about WebGL, shaders, and creative coding
      - Providing guidance on running the project locally

      The project is built with Next.js, TypeScript, and Three.js. Keep responses concise and code-focused when relevant.`,
      knowledge: [knowledge],
    });
  },
});
