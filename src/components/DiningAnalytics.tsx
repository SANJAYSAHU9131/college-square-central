import { useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDown, ArrowUp, ArrowUpDown, Activity, CheckCircle2, Leaf, MessageSquare, Star, Utensils, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Meal = "Breakfast" | "Lunch" | "Dinner";
type RecordRow = { date: string; meal: Meal; served: number; prepared: number };
type Props = { records: RecordRow[]; today: Date; predict: (meal: Meal, date: Date) => number };
const meals: Meal[] = ["Breakfast", "Lunch", "Dinner"];
const colors = ["var(--primary)", "var(--warning)", "var(--destructive)", "var(--chart-blue)", "var(--chart-violet)", "var(--chart-neutral)"];
const departments = [
  { department: "Kitchen", category: "Food quality", requests: 96, hours: 6.2, rating: 4.1, sla: 91 },
  { department: "Hygiene & Housekeeping", category: "Hygiene", requests: 58, hours: 4.4, rating: 4.3, sla: 94 },
  { department: "Serving counter", category: "Wait time", requests: 71, hours: 3.1, rating: 3.8, sla: 88 },
  { department: "Procurement", category: "Menu variety", requests: 34, hours: 18.5, rating: 3.6, sla: 72 },
  { department: "Facilities & Maintenance", category: "Portion size", requests: 29, hours: 22, rating: 3.5, sla: 64 },
  { department: "Student Welfare Desk", category: "Staff behaviour", requests: 17, hours: 9.3, rating: 4, sla: 85 },
];
const complaints = ["Food quality", "Hygiene", "Wait time", "Portion size", "Menu variety", "Staff behaviour"].map((name, i) => ({ name, value: [34, 21, 26, 12, 18, 9][i] ?? 0 }));
const statuses = [{ name: "Resolved", value: 182 }, { name: "In progress", value: 41 }, { name: "Open", value: 23 }, { name: "Escalated", value: 9 }];
const statusColors = ["var(--success)", "var(--chart-blue)", "var(--warning)", "var(--destructive)"];
const avg = (values: number[]) => values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function Panel({ title, subtitle, children, className }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return <section className={cn("min-w-0 rounded-lg border bg-card p-4", className)}><h2 className="text-sm font-bold">{title}</h2>{subtitle && <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>}{children}</section>;
}
function Legend({ items }: { items: { name: string; color: string }[] }) {
  return <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">{items.map(item => <span key={item.name} className="flex items-center gap-1"><svg width="9" height="9" aria-hidden="true"><rect width="9" height="9" rx="1" fill={item.color}/></svg>{item.name}</span>)}</div>;
}
export function DiningAnalytics({ records, today, predict }: Props) {
  const [range, setRange] = useState(14);
  const [meal, setMeal] = useState<Meal | "All meals">("All meals");
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: keyof typeof departments[number]; ascending: boolean }>({ key: "requests", ascending: false });
  const data = useMemo(() => Array.from({ length: range }, (_, i) => {
    const date = new Date(today); date.setDate(date.getDate() - range + i);
    const key = dateKey(date);
    const selected = meals.filter(m => meal === "All meals" || m === meal);
    const rows = records.filter(r => r.date === key && selected.includes(r.meal));
    const actual = rows.reduce((sum, r) => sum + r.served, 0);
    const prepared = rows.reduce((sum, r) => sum + r.prepared, 0);
    return { date: key, label: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), actual: rows.length ? actual : null,
      predicted: selected.reduce((sum, m) => sum + predict(m, date), 0),
      waste: prepared > 0 ? Math.max(0, (prepared - actual) / prepared * 100) : null,
      Breakfast: meal !== "All meals" && meal !== "Breakfast" ? 0 : records.find(r => r.date === key && r.meal === "Breakfast")?.served ?? 0,
      Lunch: meal !== "All meals" && meal !== "Lunch" ? 0 : records.find(r => r.date === key && r.meal === "Lunch")?.served ?? 0,
      Dinner: meal !== "All meals" && meal !== "Dinner" ? 0 : records.find(r => r.date === key && r.meal === "Dinner")?.served ?? 0,
      rating: Number((3.85 + Math.sin(i * 1.7) * 0.15 + i * 0.005 - (meal === "Dinner" ? 0.1 : 0)).toFixed(2)) };
  }), [records, today, range, meal, predict]);
  const chartData = data.map((d, i) => ({ ...d, average: avg(data.slice(Math.max(0, i - 6), i + 1).flatMap(x => x.waste === null ? [] : [x.waste])) }));
  const observed = data.filter(d => d.actual !== null);
  const accuracy = observed.length ? Math.max(0, 100 - avg(observed.map(d => Math.abs(d.predicted - (d.actual ?? 0)) / Math.max(1, d.actual ?? 0) * 100))) : null;
  const waste = avg(data.flatMap(d => d.waste === null ? [] : [d.waste]));
  const served = observed.reduce((sum, d) => sum + (d.actual ?? 0), 0);
  const half = Math.floor(data.length / 2);
  const wasteChange = avg(data.slice(half).flatMap(d => d.waste === null ? [] : [d.waste])) - avg(data.slice(0, half).flatMap(d => d.waste === null ? [] : [d.waste]));
  const resolution = departments.reduce((sum, d) => sum + d.hours * d.requests, 0) / departments.reduce((sum, d) => sum + d.requests, 0);
  const rows = departments.filter(d => !category || d.category === category).sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key];
    return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * (sort.ascending ? 1 : -1);
  });
  const chartMeals = meals.filter(m => meal === "All meals" || meal === m);
  const grid = <CartesianGrid strokeDasharray="3 3" vertical={false}/>;
  const x = <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={28}/>;
  const y = <YAxis axisLine={false} tickLine={false} width={34}/>;
  const metrics = [
    { label: "Forecast accuracy", value: accuracy === null ? "—" : `${accuracy.toFixed(1)}%`, note: `${observed.length} days backtested`, icon: Activity, tone: "text-primary" },
    { label: "Meals served", value: served.toLocaleString("en-IN"), note: `Last ${range} days · ${meal.toLowerCase()}`, icon: Utensils, tone: "text-chart-blue" },
    { label: "Food waste", value: `${waste.toFixed(1)}%`, note: `${wasteChange >= 0 ? "+" : ""}${wasteChange.toFixed(1)} pts vs earlier half`, icon: Leaf, tone: wasteChange <= 0 ? "text-success" : "text-warning" },
    { label: "Satisfaction / 5", value: avg(data.map(d => d.rating)).toFixed(2), note: "Sample feedback", icon: Star, tone: "text-warning" },
    { label: "Open requests", value: "73", note: "9 escalated · sample", icon: MessageSquare, tone: "text-destructive" },
    { label: "Avg resolution", value: `${resolution.toFixed(1)} h`, note: "Target: 8 h · sample", icon: CheckCircle2, tone: "text-warning" },
  ];
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-3">
        <div role="group" aria-label="Date range" className="flex rounded-md border bg-card p-1">{[7, 14, 30].map(n => <Button key={n} size="sm" variant={range === n ? "default" : "ghost"} aria-pressed={range === n} onClick={() => setRange(n)}>{n} days</Button>)}</div>
        <div role="group" aria-label="Meal type" className="flex flex-wrap rounded-md border bg-card p-1">{(["All meals", ...meals] as const).map(m => <Button key={m} size="sm" variant={meal === m ? "default" : "ghost"} aria-pressed={meal === m} onClick={() => setMeal(m)}>{m}</Button>)}</div>
      </div>
      <p className="text-[11px] text-muted-foreground">{data[0]?.label} — {data[data.length - 1]?.label}</p>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">{metrics.map(({ label, value, note, icon: Icon, tone }) => <div key={label} className="min-w-0 rounded-lg border bg-card p-4"><div className="flex items-center justify-between gap-1"><p className="text-[11px] text-muted-foreground">{label}</p><Icon size={14} className={tone}/></div><p className="mt-2 text-2xl font-bold">{value}</p><p className={cn("mt-2 text-[10px]", tone)}>{note}</p></div>)}</div>
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <Panel title="Predicted vs. actual meal demand" subtitle="Historical forecasts · meal portions" className="lg:col-span-8"><div className="mt-4 h-56" role="img" aria-label="Predicted versus actual demand chart"><ResponsiveContainer><LineChart data={chartData}>{grid}{x}{y}<Tooltip/><Line name="Predicted" dataKey="predicted" stroke="var(--warning)" strokeDasharray="5 4" strokeWidth={2} dot={false} isAnimationActive={false}/><Line name="Actual" dataKey="actual" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false}/></LineChart></ResponsiveContainer></div><Legend items={[{ name: "Predicted", color: colors[1] ?? "" }, { name: "Actual", color: colors[0] ?? "" }]}/>{!observed.length && <p className="text-xs text-warning">No attendance records in this period.</p>}</Panel>
      <Panel title="Complaints by category" subtitle="Sample service data" className="lg:col-span-4"><div className="relative mt-3 h-48" role="img" aria-label="Complaints by category chart"><ResponsiveContainer><PieChart><Pie data={complaints} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="85%" stroke="none" isAnimationActive={false} onClick={d => setCategory(category === d.name ? null : String(d.name))}>{complaints.map((d, i) => <Cell key={d.name} fill={colors[i]} cursor="pointer"/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl">120</strong><span className="text-[10px] text-muted-foreground">complaints</span></div></div><div className="flex flex-wrap justify-center gap-1">{complaints.map((d, i) => <Button key={d.name} size="sm" variant="ghost" className={cn("h-6 px-1 text-[10px]", category === d.name && "bg-accent text-foreground")} aria-pressed={category === d.name} onClick={() => setCategory(category === d.name ? null : d.name)}><svg width="7" height="7" aria-hidden="true"><rect width="7" height="7" fill={colors[i]}/></svg>{d.name}</Button>)}</div></Panel>
      <Panel title="Food consumption trend" subtitle="Served portions by meal" className="lg:col-span-6"><div className="mt-4 h-52" role="img" aria-label="Food consumption chart"><ResponsiveContainer><BarChart data={chartData}>{grid}{x}{y}<Tooltip/>{chartMeals.map(m => <Bar key={m} name={m} dataKey={m} stackId="meals" fill={colors[meals.indexOf(m)]} isAnimationActive={false}/>)}</BarChart></ResponsiveContainer></div><Legend items={chartMeals.map(m => ({ name: m, color: colors[meals.indexOf(m)] ?? "" }))}/></Panel>
      <Panel title="Food-waste trend" subtitle="Surplus as a percentage of prepared portions" className="lg:col-span-6"><div className="mt-4 h-52" role="img" aria-label="Food waste chart"><ResponsiveContainer><LineChart data={chartData}>{grid}{x}{y}<Tooltip/><Line name="Waste %" dataKey="waste" stroke="var(--destructive)" dot={false} strokeWidth={2} isAnimationActive={false}/><Line name="7-day average" dataKey="average" stroke="var(--chart-blue)" strokeDasharray="5 4" dot={false} isAnimationActive={false}/></LineChart></ResponsiveContainer></div><Legend items={[{ name: "Waste %", color: "var(--destructive)" }, { name: "7-day average", color: "var(--chart-blue)" }]}/></Panel>
      <Panel title="Student satisfaction" subtitle="Daily average rating · sample feedback" className="lg:col-span-6"><div className="mt-4 h-48" role="img" aria-label="Student satisfaction chart"><ResponsiveContainer><AreaChart data={chartData}>{grid}{x}<YAxis domain={[3, 5]} width={34} axisLine={false} tickLine={false}/><Tooltip/><Area name="Rating" dataKey="rating" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.08} strokeWidth={2} isAnimationActive={false}/></AreaChart></ResponsiveContainer></div></Panel>
      <Panel title="Service-request status" subtitle="Current split · sample" className="lg:col-span-3"><div className="mt-3 h-40" role="img" aria-label="Service request status chart"><ResponsiveContainer><PieChart><Pie data={statuses} dataKey="value" nameKey="name" innerRadius="57%" outerRadius="85%" stroke="none" isAnimationActive={false}>{statuses.map((d, i) => <Cell key={d.name} fill={statusColors[i]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><Legend items={statuses.map((d, i) => ({ name: d.name, color: statusColors[i] ?? "" }))}/></Panel>
      <Panel title="Avg resolution time" subtitle="Hours by department · sample" className="lg:col-span-3"><div className="mt-4 h-48" role="img" aria-label="Average resolution time chart"><ResponsiveContainer><BarChart layout="vertical" data={departments.map(d => ({ ...d, label: d.department.split(" ")[0] }))} margin={{ left: 0, right: 5 }}><CartesianGrid horizontal={false}/><XAxis type="number" axisLine={false} tickLine={false}/><YAxis dataKey="label" type="category" width={68} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="hours" name="Hours" isAnimationActive={false}>{departments.map(d => <Cell key={d.department} fill={d.hours > 12 ? "var(--destructive)" : "var(--primary)"}/>)}</Bar></BarChart></ResponsiveContainer></div></Panel>
      <Panel title="Department and service performance" subtitle="Sample service data" className="lg:col-span-12">{category && <div className="mt-2 flex items-center gap-2 text-xs text-primary">{category}<Button size="icon" variant="ghost" className="h-6 w-6" aria-label="Clear complaint filter" onClick={() => setCategory(null)}><X size={13}/></Button></div>}<div className="mt-3 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b">{([["department", "Department"], ["category", "Main complaint area"], ["requests", "Requests"], ["hours", "Avg hours"], ["rating", "Rating"], ["sla", "Within SLA %"]] as const).map(([key, label]) => <th key={key} aria-sort={sort.key !== key ? "none" : sort.ascending ? "ascending" : "descending"}><Button size="sm" variant="ghost" className="px-1 text-[11px] text-foreground" onClick={() => setSort({ key, ascending: sort.key === key ? !sort.ascending : false })}>{label}{sort.key !== key ? <ArrowUpDown size={11}/> : sort.ascending ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}</Button></th>)}</tr></thead><tbody>{rows.map(d => <tr key={d.department} className="border-b last:border-0"><td className="py-3 pr-2 font-semibold">{d.department}</td><td>{d.category}</td><td>{d.requests}</td><td>{d.hours.toFixed(1)}</td><td>{d.rating.toFixed(1)}</td><td><span className={cn("rounded px-2 py-1 font-semibold", d.sla >= 90 ? "bg-success/15 text-success" : d.sla >= 80 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive")}>{d.sla}%</span></td></tr>)}</tbody></table></div></Panel>
    </div>
    <section className="border-l-2 border-warning bg-card px-4 py-3"><h2 className="text-sm font-bold">What the data suggests</h2><ul className="mt-2 space-y-1 text-xs leading-5 text-muted-foreground"><li>{accuracy === null ? "Log actual attendance to measure forecast accuracy." : `Forecasts differ from actual demand by ${(100 - accuracy).toFixed(1)}% on average for this period.`}</li><li>{waste > 8 ? `Waste is ${waste.toFixed(1)}%, above the 8% planning goal. Review low-turnout days before preparing full batches.` : `Waste is ${waste.toFixed(1)}%. Continue matching preparation to recorded attendance.`}</li><li>In the sample service dataset, Food quality leads complaints; Facilities has the longest resolution time.</li></ul></section>
    <p className="text-[11px] text-muted-foreground">Demand and waste use your saved attendance history, initially populated with sample records. Satisfaction and service analytics are demonstration data.</p>
  </div>;
}