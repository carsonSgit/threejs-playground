import { Conversation } from "@botpress/runtime";
import knowledge from "../knowledge";

export default new Conversation({
  channel: "*",
  handler: async ({ execute }) => {
    await execute({
      instructions: `You are a helpful assistant for the Three.js Playground - a collection of interactive WebGL experiments and visual effects.

      You can help users with:
      - Understanding the different demos (ASCII Earth, Boiling Star, Particle Network)
      - Explaining Three.js concepts used in the examples
      - Answering questions about WebGL, shaders, and creative coding
      - Providing guidance on running the project locally

      The project is built with Next.js, TypeScript, and Three.js. Keep responses concise and code-focused when relevant.`,
      knowledge: [knowledge],
    },
  );
  },
});
