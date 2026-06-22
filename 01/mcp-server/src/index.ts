import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import "dotenv/config";

import { getQuestionsSchema, getQuestions } from "./tools/getQuestions.js";
import { submitAnswersSchema, submitAnswers } from "./tools/submitAnswers.js";
import { getStatusSchema, getStatus } from "./tools/getStatus.js";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:8080";

const server = new McpServer({
  name: "otus-project-helper",
  version: "0.1.0",
});

// Wrap a tool result as a structured MCP response.
// `structuredContent` carries the result as a JSON object (what the task requires);
// the text block is kept only as a human-readable fallback for clients that
// don't render structured output yet.
function toResult(result: Record<string, unknown>) {
  return {
    structuredContent: result,
    content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
  };
}

server.tool(
  "get_questions",
  "Get the list of survey questions from the backend",
  getQuestionsSchema.shape,
  (args) => getQuestions(args, API_BASE).then(toResult)
);

server.tool(
  "submit_answers",
  "Submit answers to the survey questions. Each answer must include questionId (number) and value (string).",
  submitAnswersSchema.shape,
  (args) => submitAnswers(args, API_BASE).then(toResult)
);

server.tool(
  "get_status",
  "Check if the backend server is reachable and healthy",
  getStatusSchema.shape,
  (args) => getStatus(args, API_BASE).then(toResult)
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[MCP] otus-project-helper started. API_BASE=${API_BASE}`);
