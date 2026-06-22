import { z } from "zod";

export const getQuestionsSchema = z.object({});

export async function getQuestions(
  _args: z.infer<typeof getQuestionsSchema>,
  apiBase: string
): Promise<Record<string, unknown>> {
  console.error(`[MCP] tool=get_questions params={} status=pending`);

  const res = await fetch(`${apiBase}/questions`);

  if (!res.ok) {
    console.error(`[MCP] tool=get_questions status=error http=${res.status}`);
    return { error: `HTTP ${res.status}`, status: "error" };
  }

  const data = await res.json();
  console.error(`[MCP] tool=get_questions status=success count=${data.question?.length ?? 0}`);

  return { status: "ok", questions: data.question ?? [] };
}
