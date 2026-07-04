import { z } from "zod";

export const submitAnswersSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.number().int().describe("ID of the question"),
        value: z.string().min(1).describe("Answer text"),
      })
    )
    .min(1)
    .describe("List of answers to submit"),
});

export async function submitAnswers(
  args: z.infer<typeof submitAnswersSchema>,
  apiBase: string
): Promise<Record<string, unknown>> {
  console.error(
    `[MCP] tool=submit_answers params=${JSON.stringify({ count: args.answers.length })} status=pending`
  );

  const res = await fetch(`${apiBase}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: args.answers }),
  });

  if (!res.ok) {
    console.error(`[MCP] tool=submit_answers status=error http=${res.status}`);
    return { error: `HTTP ${res.status}`, status: "error" };
  }

  const data = await res.json();
  console.error(`[MCP] tool=submit_answers status=success`);

  return { status: "ok", result: data };
}
