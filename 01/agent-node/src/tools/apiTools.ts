import { tool } from "@langchain/core/tools";
import { z } from "zod";

type ApiStatus = "success" | "error";

export type ApiToolResult = {
  status: ApiStatus;
  action: string;
  data: unknown;
  errors: string[];
};

type AnswerInput = {
  questionId: number;
  value: string;
};

const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

function buildResult(status: ApiStatus, action: string, data: unknown, errors: string[] = []): ApiToolResult {
  return {
    status,
    action,
    data,
    errors,
  };
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const textBody = await response.text();
  return textBody.length > 0 ? textBody : null;
}

export async function callGetQuestions(): Promise<ApiToolResult> {
  const action = "getQuestions";
  const url = `${API_BASE_URL}/questions`;

  try {
    console.log("[tool:getQuestions] request", { method: "GET", url });
    const response = await fetch(url, { method: "GET" });
    const body = await parseResponseBody(response);

    if (!response.ok) {
      const result = buildResult("error", action, body, [`HTTP ${response.status}`]);
      console.log("[tool:getQuestions] response", result);
      return result;
    }

    const result = buildResult("success", action, body, []);
    console.log("[tool:getQuestions] response", result);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const result = buildResult("error", action, null, [message]);
    console.log("[tool:getQuestions] response", result);
    return result;
  }
}

export async function callSubmitAnswers(answers: AnswerInput[]): Promise<ApiToolResult> {
  const action = "submitAnswers";
  const payload = {
    answers,
  };

  const candidates = [`${API_BASE_URL}/answer`, `${API_BASE_URL}/answers`];

  for (const url of candidates) {
    try {
      console.log("[tool:submitAnswers] request", { method: "POST", url, payload });
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await parseResponseBody(response);

      if (!response.ok) {
        // Keep trying next endpoint only for not found.
        if (response.status === 404) {
          continue;
        }

        const result = buildResult("error", action, body, [`HTTP ${response.status}`]);
        console.log("[tool:submitAnswers] response", result);
        return result;
      }

      const result = buildResult("success", action, body, []);
      console.log("[tool:submitAnswers] response", result);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const result = buildResult("error", action, null, [message]);
      console.log("[tool:submitAnswers] response", result);
      return result;
    }
  }

  const noEndpointResult = buildResult("error", action, null, ["No submit endpoint found (/answer or /answers)"]);
  console.log("[tool:submitAnswers] response", noEndpointResult);
  return noEndpointResult;
}

export const getQuestionsTool = tool(
  async () => {
    const result = await callGetQuestions();
    return JSON.stringify(result);
  },
  {
    name: "getQuestions",
    description: "Get questionnaire questions from API via GET /questions",
    schema: z.object({}),
  },
);

export const submitAnswersTool = tool(
  async (input) => {
    const result = await callSubmitAnswers(input.answers);
    return JSON.stringify(result);
  },
  {
    name: "submitAnswers",
    description: "Submit questionnaire answers to API via POST /answer (fallback /answers)",
    schema: z.object({
      answers: z
        .array(
          z.object({
            questionId: z.number().int().positive(),
            value: z.string(),
          }),
        )
        .min(1),
    }),
  },
);

export const apiTools = [getQuestionsTool, submitAnswersTool];
