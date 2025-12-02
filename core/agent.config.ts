import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "core",
  description: "AI assistant for the Three.js Playground",

  bot: {
    state: z.object({}),
  },
  user: {
    state: z.object({}),
  },
  dependencies: {
    integrations: {
      webchat: { version: "webchat@0.3.0", enabled: true },
      chat: { version: "chat@0.3.0", enabled: true }
    },
  },
});
