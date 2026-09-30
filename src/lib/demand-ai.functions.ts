import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  records: z.string().min(1).max(20000),
  events: z.string().max(4000),
  subscribed: z.number().int().min(1).max(10000),
  forecast: z.string().max(4000),
});

export type DemandInsight = { ok: true; text: string } | { ok: false; error: string };

export const explainDemand = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<DemandInsight> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false, error: "AI is not configured for this app." };

    const prompt = `You are a mess (student canteen) kitchen planning assistant in India.
Subscribed students: ${data.subscribed}.

Past attendance records (CSV: date,meal,served,prepared):
${data.records}

Upcoming events / notes from the mess admin:
${data.events || "None provided."}

Current statistical 7-day forecast (demand per meal):
${data.forecast}

Write a concise report in Markdown-free plain text with these headings on their own lines:
DEMAND OUTLOOK — 2-3 sentences on likely demand changes and why (weekday patterns, trends, events).
DAY-BY-DAY ADJUSTMENTS — one line per upcoming day that needs a change, e.g. "Fri 2 Oct – Lunch: cook ~80 instead of 156 (holiday, many students leave)".
PREPARATION TIPS — 3-4 short bullet lines (start with "- ") on reducing waste (batch cooking, ingredients, leftovers).
RISKS — 1-2 lines on what could make the forecast wrong.
Keep it under 280 words. Use numbers.`;

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          input: prompt,
          stream: true,
          store: false,
          reasoning: { effort: "low" },
        }),
      });
    } catch {
      return { ok: false, error: "Could not reach the AI service. Please try again." };
    }

    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, body.slice(0, 500));
      if (res.status === 429) return { ok: false, error: "Too many requests right now — please wait a minute and try again." };
      if (res.status === 402) return { ok: false, error: "AI credits have run out. Add credits in workspace settings to keep using AI insights." };
      if (res.status === 403) return { ok: false, error: "AI access is blocked for this workspace. A workspace admin needs to enable it." };
      return { ok: false, error: `AI request failed (${res.status}).` };
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    let refused = false;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let idx: number;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const frame = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
        for (const line of frame.split("\n")) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload) as { type?: string; delta?: string };
            if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
            if (ev.type === "response.refusal.delta") refused = true;
            if (ev.type === "response.failed" || ev.type === "error") {
              return { ok: false, error: "The AI could not complete this analysis." };
            }
          } catch { /* partial */ }
        }
      }
    }
    if (refused) return { ok: false, error: "The AI declined to answer this request." };
    if (!text.trim()) return { ok: false, error: "The AI returned an empty answer." };
    return { ok: true, text: text.trim() };
  });
