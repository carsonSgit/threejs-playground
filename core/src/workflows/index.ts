/**
 * TODO: Add your workflows here
 *
 * This is a placeholder file to initialize the workflows directory.
 * You can delete this file once you add your own workflows.
 */

import knowledge from "../knowledge";
import { Workflow } from "@botpress/runtime";

export default new Workflow({
    name: "refreshKnowledge",
    schedule: "0 0 * * *",
    handler: async () => {
        await knowledge.refresh();
    }
});
