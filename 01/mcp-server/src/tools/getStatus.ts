import { z } from "zod";

export const getStatusSchema = z.object({});

export async function getStatus(
  _args: z.infer<typeof getStatusSchema>,
  apiBase: string
): Promise<Record<string, unknown>> {
  console.error(`[MCP] tool=get_status params={} status=pending`);

  try {
    const res = await fetch(`${apiBase}/questions`, { signal: AbortSignal.timeout(3000) });

    if (!res.ok) {
      console.error(`[MCP] tool=get_status status=error http=${res.status}`);
      return { status: "error", reachable: false, http: res.status };
    }

    console.error(`[MCP] tool=get_status status=success`);
    return { status: "ok", reachable: true, url: apiBase };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[MCP] tool=get_status status=error message=${message}`);
    return { status: "error", reachable: false, message };
  }
}
