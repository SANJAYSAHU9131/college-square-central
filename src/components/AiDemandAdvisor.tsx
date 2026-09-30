import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { explainDemand } from "@/lib/demand-ai.functions";

type Props = {
  recordsCsv: string;
  forecastText: string;
  subscribed: number;
  notify: (s: string) => void;
};

export function AiDemandAdvisor({ recordsCsv, forecastText, subscribed, notify }: Props) {
  const run = useServerFn(explainDemand);
  const [useApp, setUseApp] = useState(true);
  const [custom, setCustom] = useState("");
  const [events, setEvents] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 200_000) return notify("File too large (max 200 KB)");
    const r = new FileReader();
    r.onload = () => { setCustom(String(r.result)); setUseApp(false); notify(`Loaded ${f.name}`); };
    r.readAsText(f);
  };

  const analyse = async () => {
    const records = (useApp ? recordsCsv : custom).trim();
    if (!records) return setError("Add some past attendance records first.");
    setLoading(true); setError(""); setResult("");
    try {
      const res = await run({ data: { records: records.slice(-20000), events: events.slice(0, 4000), subscribed, forecast: forecastText } });
      if (res.ok) setResult(res.text); else setError(res.error);
    } catch {
      setError("Something went wrong while contacting the AI. Please try again.");
    } finally { setLoading(false); }
  };

  const field = "mt-1 w-full rounded-md border bg-background p-3 text-sm outline-none focus:border-primary";
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold"><Bot size={20} className="text-primary" />AI demand advisor</h2>
      <p className="mb-5 text-sm text-muted-foreground">Give the AI your past attendance and upcoming events. It explains how demand is likely to change and how much to cook.</p>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Past attendance records</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant={useApp ? "default" : "outline"} onClick={() => setUseApp(true)}>Use records in this app</Button>
              <Button type="button" size="sm" variant={!useApp ? "default" : "outline"} onClick={() => setUseApp(false)}>Paste / upload my own</Button>
            </div>
            {useApp ? (
              <p className="mt-2 text-xs text-muted-foreground">{recordsCsv.split("\n").length - 1} records from the table above will be sent.</p>
            ) : (
              <>
                <textarea aria-label="Custom attendance records" value={custom} onChange={(e) => setCustom(e.target.value)} className={`${field} min-h-32 font-mono`} placeholder={"date,meal,served,prepared\n2026-09-28,Lunch,148,165"} />
                <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary"><Upload size={15} />Upload CSV<input type="file" accept=".csv,.txt" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
              </>
            )}
          </div>
          <label className="block text-sm font-semibold">Upcoming events & notes
            <textarea aria-label="Upcoming events" value={events} onChange={(e) => setEvents(e.target.value)} className={`${field} min-h-28`} placeholder={"e.g. Mid-sem exams 5–9 Oct\nDussehra holiday 2 Oct, ~60% students going home\nCricket fest on Sunday evening"} />
          </label>
          <Button onClick={analyse} disabled={loading}>{loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}{loading ? "Analysing…" : "Get AI recommendations"}</Button>
        </div>
        <div className="min-h-64 rounded-md bg-muted/50 p-4">
          {error && <p role="alert" className="rounded-md bg-destructive-soft p-3 text-sm font-semibold text-destructive">{error}</p>}
          {loading && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin" />Reading your records and planning the week… this can take up to a minute.</p>}
          {!loading && !error && !result && <p className="text-sm text-muted-foreground">Recommendations will appear here.</p>}
          {result && <div className="whitespace-pre-wrap text-sm leading-6">{result}</div>}
        </div>
      </div>
    </div>
  );
}
