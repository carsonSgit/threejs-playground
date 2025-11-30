import { Trigger } from "@botpress/runtime";
import knowledge from "../knowledge";

export default new Trigger({
  name: "conversationStarted",
  events: ["webchat:conversationStarted"] as const,
  handler: async () => {
    await knowledge.refresh();
  },
});
