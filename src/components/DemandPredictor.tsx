import { useEffect, useMemo, useState } from "react";
import { Download, Brain, CalendarDays, CheckCircle2, Plus, RotateCcw, Sparkles, TrendingDown, TrendingUp, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AiDemandAdvisor } from "@/components/AiDemandAdvisor";

type Meal = "Breakfast" | "Lunch" | "Dinner";
const MEALS: Meal[] = ["Breakfast", "Lunch", "Dinner"];
type Rec = { date: string; meal: Meal; served: number; prepared: number };
type Event = "normal" | "exam" | "holiday" | "festival";
const EVENT_FACTOR: Record<Event, number> = { normal: 1, exam: 1.06, holiday: 0.55, festival: 0.8 };
const SUBSCRIBED = 182;
const KEY = "studenthub-demand-records";
const EVT_KEY = "studenthub-demand-events";

const dk = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y!, m! - 1, d!); };
const fmt = (s: string) => parse(s).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

// Deterministic sample history (last 42 days) with weekday pattern + noise
function seed(): Rec[] {
  const base: Record<Meal, number> = { Breakfast: 118, Lunch: 150, Dinner: 138 };
  const dow = [0.72, 1.02, 1.0, 1.03, 0.98, 0.9, 0.78]; // Sun..Sat
  const out: Rec[] = []; const today = new Date(); today.setHours(0, 0, 0, 0);
  for (let i = 42; i >= 1; i--) {
    const d = addDays(today, -i);
    MEALS.forEach((m, j) => {
      const noise = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; const r = (noise - Math.floor(noise)) * 0.1 - 0.05;
      const served = Math.round(base[m] * dow[d.getDay()]! * (1 + r));
      out.push({ date: dk(d), meal: m, served, prepared: Math.round(served * 1.12) });
    });
  }
  return out;
}

// Model: weighted same-weekday average (60%) + recent 7-day level (40%), scaled by trend and calendar event
function forecast(recs: Rec[], meal: Meal, target: Date, event: Event) {
  const rows = recs.filter((r) => r.meal === meal && parse(r.date) < target).sort((a, b) => (a.date < b.date ? 1 : -1));
  if (rows.length === 0) return 0;
  const same = rows.filter((r) => parse(r.date).getDay() === target.getDay()).slice(0, 4);
  const w = [4, 3, 2, 1];
  const weekday = same.length ? same.reduce((s, r, i) => s + r.served * w[i]!, 0) / same.reduce((s, _, i) => s + w[i]!, 0) : rows[0]!.served;
  const last7 = rows.slice(0, 7); const prev7 = rows.slice(7, 14);
  const avg = (a: Rec[]) => a.reduce((s, r) => s + r.served, 0) / Math.max(1, a.length);
  const level = avg(last7);
  const trend = prev7.length ? Math.min(1.1, Math.max(0.9, level / avg(prev7))) : 1;
  const est = (0.6 * weekday + 0.4 * level * (weekday / Math.max(1, avg(rows.slice(0, 28))))) * trend * EVENT_FACTOR[event];
  return Math.min(SUBSCRIBED, Math.max(0, Math.round(est)));
}

export function DemandPredictor({ notify }: { notify: (s: string) => void }) {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [buffer, setBuffer] = useState(5);
  const [meal, setMeal] = useState<Meal>("Lunch");
  const [form, setForm] = useState({ date: "", meal: "Lunch" as Meal, served: "", prepared: "" });

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); setRecs(s ? (JSON.parse(s) as Rec[]) : seed()); setEvents(JSON.parse(localStorage.getItem(EVT_KEY) ?? "{}") as Record<string, Event>); } catch { setRecs(seed()); }
    setForm((f) => ({ ...f, date: dk(addDays(new Date(), -1)) }));
  }, []);
  const persist = (next: Rec[]) => { setRecs(next); try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ } };
  const setEvent = (date: string, e: Event) => { const n = { ...events, [date]: e }; setEvents(n); try { localStorage.setItem(EVT_KEY, JSON.stringify(n)); } catch { /* ignore */ } };

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => dk(addDays(today, i))), [today]);

  const plan = useMemo(() => days.map((date) => {
    const ev = events[date] ?? "normal";
    const per = Object.fromEntries(MEALS.map((m) => [m, forecast(recs, m, parse(date), ev)])) as Record<Meal, number>;
    return { date, ev, per };
  }), [days, recs, events]);

  // Backtest last 7 days for accuracy
  const accuracy = useMemo(() => {
    const test = recs.filter((r) => parse(r.date) >= addDays(today, -7) && parse(r.date) < today);
    if (!test.length) return null;
    const errs = test.map((r) => Math.abs(forecast(recs, r.meal, parse(r.date), events[r.date] ?? "normal") - r.served) / Math.max(1, r.served));
    return Math.max(0, Math.round((1 - errs.reduce((a, b) => a + b, 0) / errs.length) * 100));
  }, [recs, events, today]);

  const recent = useMemo(() => recs.filter((r) => parse(r.date) >= addDays(today, -7)), [recs, today]);
  const wasteNow = recent.length ? (recent.reduce((s, r) => s + (r.prepared - r.served), 0) / recent.reduce((s, r) => s + r.prepared, 0)) * 100 : 0;
  const tomorrow = plan[1]!; const tomorrowTotal = MEALS.reduce((s, m) => s + tomorrow.per[m], 0);
  const maxBar = Math.max(1, ...plan.map((p) => p.per[meal]));
  const history14 = recs.filter((r) => r.meal === meal && parse(r.date) >= addDays(today, -14)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const backtest = useMemo(() => Array.from({ length: 7 }, (_, i) => dk(addDays(today, i - 7))).map((date) => {
    const r = recs.find((x) => x.date === date && x.meal === meal);
    return { date, actual: r?.served ?? null, predicted: forecast(recs, meal, parse(date), events[date] ?? "normal") };
  }), [recs, events, meal, today]);
  const exportPlan = () => {
    const rows = ["Date,Event," + MEALS.map((m) => `${m} demand,${m} cook`).join(",") + ",Total cook"].concat(plan.map((p) => [p.date, p.ev, ...MEALS.flatMap((m) => [p.per[m], Math.round(p.per[m] * (1 + buffer / 100))]), MEALS.reduce((s, m) => s + Math.round(p.per[m] * (1 + buffer / 100)), 0)].join(",")));
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })); a.download = `kitchen-plan-${days[0]}.csv`; a.click(); URL.revokeObjectURL(a.href);
    notify("Kitchen plan downloaded");
  };
  const prep = (n: number) => Math.round(n * (1 + buffer / 100));

  const addRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const served = Number(form.served); const prepared = Number(form.prepared || form.served);
    if (!form.date || parse(form.date) >= today) return notify("Choose a past date for actual records");
    if (!Number.isFinite(served) || served < 0 || served > SUBSCRIBED) return notify(`Students served must be 0–${SUBSCRIBED}`);
    if (prepared < served) return notify("Prepared portions can't be less than served");
    const next = recs.filter((r) => !(r.date === form.date && r.meal === form.meal)).concat({ date: form.date, meal: form.meal, served, prepared });
    persist(next); setForm({ ...form, served: "", prepared: "" });
    notify(`Saved ${form.meal} on ${fmt(form.date)} — forecast updated`);
  };

  const card = "rounded-lg border bg-card p-5";
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tomorrow's demand", `${tomorrowTotal}`, "meals across 3 slots", Utensils],
          ["Model accuracy", accuracy === null ? "—" : `${accuracy}%`, "backtest on last 7 days", Brain],
          ["Current waste", `${wasteNow.toFixed(1)}%`, "prepared vs served, 7 days", TrendingDown],
          ["Records used", `${recs.length}`, "meal-level entries", CalendarDays],
        ].map(([l, v, n, I]) => { const Icon = I as typeof Brain; return (
          <div key={String(l)} className={card}><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{String(l)}</p><Icon size={18} className="text-primary" /></div><p className="mt-2 font-display text-3xl font-extrabold">{String(v)}</p><p className="mt-1 text-xs text-muted-foreground">{String(n)}</p></div>
        ); })}
      </div>

      <div className={card}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">7-day demand forecast</h2>
          <div className="flex gap-1 rounded-md bg-muted p-1">{MEALS.map((m) => <button key={m} onClick={() => setMeal(m)} className={cn("rounded px-3 py-1.5 text-sm font-semibold", meal === m ? "bg-card shadow-sm" : "text-muted-foreground")}>{m}</button>)}</div>
        </div>
        <div className="flex h-48 items-end gap-2">
          {plan.map((p, i) => (
            <div key={p.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-bold">{p.per[meal]}</span>
              <div className={cn("w-full rounded-t-md", i === 0 ? "bg-primary" : "bg-primary/60")} style={{ height: `${(p.per[meal] / maxBar) * 150}px` }} />
              <span className="text-[11px] text-muted-foreground">{i === 0 ? "Today" : fmt(p.date).split(",")[0]}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 overflow-x-auto"><p className="mb-2 text-sm font-semibold">Forecast vs actual — last 7 days ({meal})</p><table className="w-full min-w-[560px] text-sm"><tbody>
          <tr className="text-xs text-muted-foreground"><td className="py-1">Day</td>{backtest.map((b) => <td key={b.date}>{fmt(b.date).split(",")[0]} {parse(b.date).getDate()}</td>)}</tr>
          <tr><td className="py-1 text-muted-foreground">Predicted</td>{backtest.map((b) => <td key={b.date}>{b.predicted}</td>)}</tr>
          <tr><td className="py-1 text-muted-foreground">Actual</td>{backtest.map((b) => <td key={b.date} className="font-bold">{b.actual ?? "—"}</td>)}</tr>
          <tr><td className="py-1 text-muted-foreground">Error</td>{backtest.map((b) => { const e = b.actual ? Math.round(((b.predicted - b.actual) / b.actual) * 100) : null; return <td key={b.date} className={cn("font-semibold", e === null ? "" : Math.abs(e) <= 5 ? "text-success" : "text-warning")}>{e === null ? "—" : `${e > 0 ? "+" : ""}${e}%`}</td>; })}</tr>
        </tbody></table></div>
        <p className="mt-4 text-xs text-muted-foreground">Last 14 days actual ({meal}): {history14.map((r) => r.served).join(" · ") || "no data"}</p>
      </div>

      <div className={card}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Kitchen preparation plan</h2>
          <div className="flex flex-wrap items-center gap-4"><Button size="sm" variant="outline" onClick={exportPlan}><Download size={15} />Download plan</Button><label className="flex items-center gap-3 text-sm">Safety buffer <input type="range" min={0} max={20} value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} aria-label="Safety buffer" /> <strong>{buffer}%</strong></label></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead><tr className="border-b text-xs uppercase text-muted-foreground"><th className="py-3">Date</th><th>Calendar event</th>{MEALS.map((m) => <th key={m}>{m} (demand → cook)</th>)}<th>Total cook</th></tr></thead>
            <tbody>{plan.map((p) => (
              <tr key={p.date} className="border-b last:border-0">
                <td className="py-3 font-semibold">{fmt(p.date)}</td>
                <td><select aria-label={`Event on ${p.date}`} value={p.ev} onChange={(e) => { setEvent(p.date, e.target.value as Event); notify(`Forecast adjusted for ${fmt(p.date)}`); }} className="h-9 rounded-md border bg-background px-2"><option value="normal">Normal day</option><option value="exam">Exam week</option><option value="holiday">Holiday / break</option><option value="festival">Festival</option></select></td>
                {MEALS.map((m) => <td key={m}>{p.per[m]} → <strong>{prep(p.per[m])}</strong></td>)}
                <td className="font-bold">{MEALS.reduce((s, m) => s + prep(p.per[m]), 0)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">{wasteNow > buffer ? <TrendingDown size={16} className="text-success" /> : <TrendingUp size={16} className="text-warning" />}Cooking by this plan would cut waste from <strong className="text-foreground">{wasteNow.toFixed(1)}%</strong> to about <strong className="text-foreground">{buffer}%</strong>.</p>
      </div>

      <AiDemandAdvisor notify={notify} subscribed={SUBSCRIBED}
        recordsCsv={"date,meal,served,prepared\n" + [...recs].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-126).map((r) => `${r.date},${r.meal},${r.served},${r.prepared}`).join("\n")}
        forecastText={plan.map((p) => `${fmt(p.date)} (${p.ev}): ` + MEALS.map((m) => `${m} ${p.per[m]}`).join(", ")).join("\n")} />

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={addRecord} className={card}>
          <h2 className="mb-4 font-display text-lg font-bold">Log actual attendance</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">Date<input type="date" max={dk(addDays(today, -1))} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 h-10 w-full rounded-md border bg-background px-3" /></label>
            <label className="text-sm font-semibold">Meal<select value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value as Meal })} className="mt-1 h-10 w-full rounded-md border bg-background px-3">{MEALS.map((m) => <option key={m}>{m}</option>)}</select></label>
            <label className="text-sm font-semibold">Students served<input type="number" min={0} required value={form.served} onChange={(e) => setForm({ ...form, served: e.target.value })} className="mt-1 h-10 w-full rounded-md border bg-background px-3" placeholder="e.g. 146" /></label>
            <label className="text-sm font-semibold">Portions prepared<input type="number" min={0} value={form.prepared} onChange={(e) => setForm({ ...form, prepared: e.target.value })} className="mt-1 h-10 w-full rounded-md border bg-background px-3" placeholder="e.g. 160" /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Button type="submit"><Plus size={16} />Save record</Button><Button type="button" variant="outline" onClick={() => { persist(seed()); setEvents({}); localStorage.removeItem(EVT_KEY); notify("Sample history restored"); }}><RotateCcw size={16} />Reset sample data</Button></div>
        </form>
        <div className={card}>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Sparkles size={18} className="text-primary" />How the prediction works</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["Looks at the last 4 same weekdays (recent ones count more).", "Blends in the last 7 days' level and a capped trend (±10%).", "Adjusts for exam weeks, holidays and festivals you mark.", "Adds your safety buffer to get portions to cook.", "Every record you log retrains the forecast instantly."].map((t) => <li key={t} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" />{t}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
