import { createFileRoute } from "@tanstack/react-router";
import {
  Bell, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign, Clock3,
  CreditCard, Gauge, Home, LayoutDashboard, Leaf, Menu, MessageSquareText,
  Search, Settings, ShieldCheck, Sparkles, Store, TrendingDown, Users, Utensils,
  WalletCards, X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "StudentHub | Smart Mess Management" },
    { name: "description", content: "Manage college meals, attendance, payments, food-waste predictions, feedback, and campus services in StudentHub." },
    { property: "og:title", content: "StudentHub | Smart Mess Management" },
    { property: "og:description", content: "A complete smart mess and student services dashboard." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: StudentHub,
});

type PageId = "dashboard" | "discover" | "menu" | "attendance" | "payments" | "prediction" | "feedback" | "admin";
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "discover", label: "Discover", icon: Search },
  { id: "menu", label: "Meal Menu", icon: Utensils }, { id: "attendance", label: "Attendance", icon: CheckCircle2 },
  { id: "payments", label: "Payments", icon: CreditCard }, { id: "prediction", label: "Prediction", icon: Gauge },
  { id: "feedback", label: "Feedback", icon: MessageSquareText }, { id: "admin", label: "Admin", icon: Settings },
] as const;

function StudentHub() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  const navigate = (id: PageId) => { setPage(id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return <div className="min-h-screen bg-background">
    {mobileOpen && <div className="fixed inset-0 z-30 bg-foreground/35 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />}
    <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground transition-transform lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center px-2">
        <button onClick={() => navigate("dashboard")} className="flex min-w-0 items-center gap-3 text-left" aria-label="StudentHub dashboard">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Utensils size={20} /></span>
          <span className="font-display text-xl font-extrabold">Student<span className="text-secondary">Hub</span></span>
        </button>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></Button>
      </div>
      <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-sidebar-muted">Workspace</p>
      <nav className="space-y-1" aria-label="Main navigation">{navItems.map(({ id, label, icon: Icon }) =>
        <button key={id} onClick={() => navigate(id)} className={cn("flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors", page === id ? "bg-primary text-primary-foreground" : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
          <Icon size={18} className="shrink-0" /><span>{label}</span>{page === id && <ChevronRight size={15} className="ml-auto" />}
        </button>)}
      </nav>
      <div className="mt-auto rounded-lg border border-sidebar-accent bg-sidebar-accent/50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Leaf size={17} className="text-secondary" /> Impact this month</div>
        <p className="text-xs leading-5 text-sidebar-muted">Your attendance choices helped reduce food waste by 18%.</p>
      </div>
    </aside>

    <div className="min-h-screen lg:pl-64">
      <header className="sticky top-0 z-20 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6 lg:h-[72px] lg:px-8">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></Button>
        <div className="relative min-w-0 max-w-md"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={e => setQuery(e.target.value)} className="h-10 w-full rounded-md border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="Search messes, rooms, stores..." aria-label="Search StudentHub" /></div>
        <div className="flex shrink-0 items-center gap-3"><button className="relative hidden h-10 w-10 place-items-center rounded-md border bg-card text-muted-foreground hover:bg-accent sm:grid" aria-label="Notifications"><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" /></button><div className="hidden text-right sm:block"><p className="text-sm font-semibold">Student User</p><p className="text-xs text-muted-foreground">Student</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">SU</div></div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <div key={page} className="page-enter">{renderPage(page, navigate, notify, query)}</div>
      </main>
    </div>
    {toast && <div role="status" className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-md bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl"><CheckCircle2 size={18} className="text-secondary" />{toast}</div>}
  </div>;
}

function renderPage(page: PageId, navigate: (id: PageId) => void, notify: (message: string) => void, query: string) {
  switch (page) {
    case "discover": return <Discover notify={notify} query={query} />;
    case "menu": return <MealMenu />;
    case "attendance": return <Attendance notify={notify} />;
    case "payments": return <Payments notify={notify} />;
    case "prediction": return <Prediction notify={notify} />;
    case "feedback": return <Feedback notify={notify} />;
    case "admin": return <Admin />;
    default: return <Dashboard navigate={navigate} />;
  }
}

function PageHeader({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
  return <div className="mb-7"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow && <><span className="h-px w-5 bg-primary" />{eyebrow}</>}</div><h1 className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p></div>;
}
function Card({ children, className }: { children: React.ReactNode; className?: string }) { return <div className={cn("rounded-lg border bg-card p-5 shadow-[0_1px_2px_color-mix(in_oklab,var(--foreground)_5%,transparent)]", className)}>{children}</div>; }
function Stat({ label, value, icon: Icon, tone = "primary", note }: { label: string; value: string; icon: typeof Home; tone?: "primary"|"success"|"warning"|"secondary"; note?: string }) {
  const tones = { primary: "bg-info-soft text-primary", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", secondary: "bg-accent text-secondary" };
  return <Card><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{value}</p>{note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}</div><span className={cn("grid h-10 w-10 place-items-center rounded-md", tones[tone])}><Icon size={20} /></span></div></Card>;
}
function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) { return <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><h2 className="font-display text-lg font-bold">{children}</h2>{action}</div>; }
function Status({ children, type = "success" }: { children: React.ReactNode; type?: "success"|"danger"|"warning" }) { return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", type === "success" && "bg-success-soft text-success", type === "danger" && "bg-destructive-soft text-destructive", type === "warning" && "bg-warning-soft text-warning")}>{children}</span>; }
function Progress({ value, tone = "primary" }: { value: number; tone?: "primary"|"success"|"warning" }) { return <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", tone === "primary" && "bg-primary", tone === "success" && "bg-success", tone === "warning" && "bg-warning")} style={{ width: `${value}%` }} /></div>; }
function TableWrap({ children }: { children: React.ReactNode }) { return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm">{children}</table></div>; }
const th = "border-b bg-muted/60 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground";
const td = "border-b px-4 py-4 last:border-b-0";

function Dashboard({ navigate }: { navigate: (id: PageId) => void }) {
  return <><PageHeader title="Welcome back, Student User" subtitle="Here’s what’s happening with your meals and campus services today." eyebrow="Wednesday, 23 September" />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Today's Meals" value="3" icon={Utensils} note="2 opted in" /><Stat label="Attendance" value="87%" icon={CheckCircle2} tone="success" note="26 meals this month" /><Stat label="Pending Bill" value="₹1,850" icon={WalletCards} tone="warning" note="Due 30 September" /><Stat label="Waste Saved" value="18%" icon={Leaf} tone="secondary" note="Compared with baseline" /></div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><Card><SectionTitle action={<Button variant="outline" size="sm" onClick={() => navigate("menu")}>View menu <ChevronRight size={14} /></Button>}>Today’s meals</SectionTitle><div>{[["Breakfast","8:00 AM – 10:00 AM",true],["Lunch","12:30 PM – 2:30 PM",true],["Dinner","7:30 PM – 9:30 PM",false]].map(([name,time,on]) => <div key={String(name)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-4 last:border-0"><div className="min-w-0"><p className="font-semibold">{name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 size={13} />{time}</p></div><Status type={on ? "success" : "danger"}>{on ? "Opted In" : "Opted Out"}</Status></div>)}</div></Card>
      <Card><SectionTitle>Food demand</SectionTitle><div className="rounded-md bg-info-soft p-5"><p className="text-sm font-medium text-muted-foreground">Today’s expected attendance</p><p className="mt-2 font-display text-3xl font-extrabold">142 <span className="text-base font-semibold text-muted-foreground">students</span></p><div className="my-5"><Progress value={78} /></div><div className="flex justify-between text-xs"><span className="text-muted-foreground">Prediction confidence</span><strong>91%</strong></div></div></Card></div>
    <Card className="mt-6"><SectionTitle>Quick actions</SectionTitle><div className="flex flex-wrap gap-3"><Button onClick={() => navigate("attendance")}><CheckCircle2 size={17} />Mark meal attendance</Button><Button variant="success" onClick={() => navigate("payments")}><CreditCard size={17} />Pay mess bill</Button><Button variant="outline" onClick={() => navigate("discover")}><Search size={17} />Find nearby services</Button></div></Card></>;
}

const services = [
  { icon: "🍛", name: "Shree Student Mess", rating: "4.7", stars: "★★★★★", distance: "0.8 km away", price: "₹2,500 / month", type: "Mess" },
  { icon: "🍱", name: "Campus Food Point", rating: "4.4", stars: "★★★★☆", distance: "1.2 km away", price: "₹2,200 / month", type: "Mess" },
  { icon: "🏠", name: "Green Hostel Rooms", rating: "4.5", stars: "★★★★☆", distance: "1.5 km away", price: "₹5,500 / month", type: "Room" },
];
function Discover({ notify, query }: { notify: (s: string) => void; query: string }) {
  const filtered = useMemo(() => services.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.type.toLowerCase().includes(query.toLowerCase())), [query]);
  return <><PageHeader title="Discover" subtitle="Find trusted messes, rooms, and services near your college." eyebrow="Campus directory" /><div className="mb-5 flex gap-2"><Button size="sm">All services</Button><Button size="sm" variant="outline">Messes</Button><Button size="sm" variant="outline">Rooms</Button></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(s => <div key={s.name} className="overflow-hidden rounded-lg border bg-card"><div className="grid h-36 place-items-center bg-info-soft text-6xl" aria-hidden="true">{s.icon}</div><div className="p-5"><div className="mb-2 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-primary">{s.type}</p><h2 className="mt-1 font-display text-lg font-bold">{s.name}</h2></div><span className="rounded-md bg-warning-soft px-2 py-1 text-xs font-bold text-warning">{s.rating}</span></div><p className="text-sm text-warning">{s.stars}</p><p className="mt-4 text-sm text-muted-foreground">📍 {s.distance}</p><div className="mt-5 flex items-center justify-between gap-3"><p className="font-display font-bold text-primary">{s.price}</p><Button size="sm" onClick={() => notify(`${s.type} details opened`)}>View details</Button></div></div></div>)}{filtered.length === 0 && <Card className="md:col-span-2 xl:col-span-3"><p className="text-center text-muted-foreground">No services match “{query}”.</p></Card>}</div></>;
}
const menuRows = [["Monday","Poha + Tea","Dal + Rice + Roti","Paneer + Roti"],["Tuesday","Paratha + Curd","Rajma + Rice","Mix Veg + Roti"],["Wednesday","Idli + Sambar","Dal + Rice + Salad","Chole + Roti"],["Thursday","Upma + Tea","Dal + Rice + Roti","Paneer + Rice"],["Friday","Poha + Tea","Chole + Rice","Veg Biryani"]];
function MealMenu() { return <><PageHeader title="Weekly Meal Menu" subtitle="Your subscribed menu from Shree Student Mess." eyebrow="23–27 September" /><Card className="p-0"><div className="p-5"><SectionTitle action={<span className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays size={15} />Current week</span>}>Meal plan</SectionTitle></div><TableWrap><thead><tr>{["Day","Breakfast","Lunch","Dinner"].map(h => <th className={th} key={h}>{h}</th>)}</tr></thead><tbody>{menuRows.map((row,i) => <tr key={row[0]} className={cn(i === 2 && "bg-info-soft/60")}>{row.map((v,j) => <td className={cn(td,j===0&&"font-bold")} key={v}>{v}{i===2&&j===0&&<span className="ml-2 text-xs font-semibold text-primary">Today</span>}</td>)}</tr>)}</tbody></TableWrap></Card></>; }

function Attendance({ notify }: { notify: (s: string) => void }) {
  const [meals,setMeals] = useState({ Breakfast:true, Lunch:true, Dinner:false });
  const toggle = (name: keyof typeof meals) => { const next=!meals[name]; setMeals({...meals,[name]:next}); notify(next ? "Meal attendance confirmed" : "Meal attendance cancelled"); };
  return <><PageHeader title="Meal Attendance" subtitle="Opt in or out before each meal’s cut-off time." eyebrow="Today’s schedule" /><div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><Card><SectionTitle>Monthly attendance</SectionTitle><div className="flex flex-col items-center py-3"><div className="grid h-44 w-44 place-items-center rounded-full" style={{background:"conic-gradient(var(--primary) 0 87%, var(--muted) 87% 100%)"}}><div className="grid h-32 w-32 place-items-center rounded-full bg-card"><div className="text-center"><p className="font-display text-3xl font-extrabold">87%</p><p className="text-xs text-muted-foreground">attendance</p></div></div></div><p className="mt-5 text-sm text-muted-foreground"><strong className="text-foreground">26 meals</strong> attended this month</p></div></Card><Card><SectionTitle>Today’s meal selection</SectionTitle>{([ ["Breakfast","Cut-off: 7:00 AM"],["Lunch","Cut-off: 11:00 AM"],["Dinner","Cut-off: 6:00 PM"]] as const).map(([name,time]) => <div key={name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b py-4 last:border-0"><div><p className="font-semibold">{name}</p><p className="mt-1 text-xs text-muted-foreground">{time}</p></div><Button variant={meals[name] ? "success" : "destructive"} size="sm" onClick={() => toggle(name)}>{meals[name] ? <CheckCircle2 size={15} /> : <X size={15} />}{meals[name] ? "Opted In" : "Opted Out"}</Button></div>)}</Card></div></>;
}

function Payments({ notify }: { notify: (s: string) => void }) { return <><PageHeader title="Payments & Billing" subtitle="Manage your mess bills and review payment history." eyebrow="Billing overview" /><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Current Bill" value="₹1,850" icon={CircleDollarSign}/><Stat label="Due Date" value="30 Sep" icon={CalendarDays} tone="warning"/><Stat label="Paid This Year" value="₹18,400" icon={WalletCards} tone="success"/><Stat label="Status" value="Pending" icon={Clock3} tone="warning"/></div><Card className="p-0"><div className="p-5"><SectionTitle action={<Button onClick={() => notify("Payment gateway opened")}><CreditCard size={17}/>Pay ₹1,850</Button>}>Payment history</SectionTitle></div><TableWrap><thead><tr>{["Date","Description","Amount","Status"].map(h=><th className={th} key={h}>{h}</th>)}</tr></thead><tbody>{[["01 Sep 2026","Mess Subscription","₹2,500"],["01 Aug 2026","Mess Subscription","₹2,500"]].map(r=><tr key={r[0]}>{r.map(v=><td className={td} key={v}>{v}</td>)}<td className={td}><Status>Paid</Status></td></tr>)}</tbody></TableWrap></Card></>; }

function Prediction({ notify }: { notify:(s:string)=>void }) { return <><PageHeader title="Food Waste Prediction" subtitle="Data-driven demand planning for smarter meal preparation." eyebrow="Predictive analytics"/><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Subscribed Students" value="182" icon={Users}/><Stat label="Expected Attendance" value="142" icon={CheckCircle2} tone="success"/><Stat label="Prepared Quantity" value="155" icon={Utensils} tone="secondary"/><Stat label="Predicted Waste" value="8.4%" icon={TrendingDown} tone="warning"/></div><div className="grid gap-6 xl:grid-cols-2"><Card><SectionTitle>Meal demand prediction</SectionTitle><div className="rounded-md bg-info-soft p-5"><p className="text-sm text-muted-foreground">Expected lunch attendance</p><p className="mt-2 font-display text-3xl font-extrabold">142 <span className="text-base text-muted-foreground">students</span></p><div className="my-5"><Progress value={78}/></div><p className="text-xs text-muted-foreground">Model confidence: <strong className="text-foreground">91%</strong></p></div><Button className="mt-5" onClick={()=>notify("Prediction refreshed")}><Sparkles size={17}/>Refresh prediction</Button></Card><Card><SectionTitle>Waste analysis</SectionTitle><div className="space-y-6">{[["Food Prepared","155 portions",100,"primary"],["Food Consumed","142 portions",91,"success"],["Estimated Leftover","13 portions",9,"warning"]].map(([a,b,v,t])=><div key={String(a)}><div className="mb-2 flex justify-between text-sm"><span>{a}</span><strong>{b}</strong></div><Progress value={Number(v)} tone={t as "primary"|"success"|"warning"}/></div>)}</div></Card></div></>; }

function Feedback({ notify }: { notify:(s:string)=>void }) { const [comments,setComments]=useState(""); return <><PageHeader title="Feedback & Complaints" subtitle="Share your experience and help improve student services." eyebrow="Student support"/><div className="grid gap-6 xl:grid-cols-2"><Card><SectionTitle>Submit feedback</SectionTitle><form onSubmit={e=>{e.preventDefault();setComments("");notify("Feedback submitted successfully");}} className="space-y-5"><Field label="Service"><select className="h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"><option>Mess</option><option>Hostel</option><option>Stationery Store</option></select></Field><Field label="Rating"><select className="h-11 w-full rounded-md border bg-background px-3 text-warning outline-none focus:border-primary"><option>★★★★★</option><option>★★★★☆</option><option>★★★☆☆</option><option>★★☆☆☆</option><option>★☆☆☆☆</option></select></Field><Field label="Comments"><textarea required value={comments} onChange={e=>setComments(e.target.value)} className="min-h-32 w-full resize-y rounded-md border bg-background p-3 outline-none focus:border-primary" placeholder="Describe your experience..."/></Field><Button type="submit"><MessageSquareText size={17}/>Submit feedback</Button></form></Card><Card><SectionTitle>My complaints</SectionTitle>{[["Food Quality","Submitted 18 Sep","Resolved","success"],["Menu Issue","Submitted 21 Sep","In Review","warning"]].map(([a,b,c,d])=><div key={a} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b py-4 last:border-0"><div><p className="font-semibold">{a}</p><p className="mt-1 text-xs text-muted-foreground">{b}</p></div><Status type={d as "success"|"warning"}>{c}</Status></div>)}</Card></div></>; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }

function Admin() { const kpis=[["Food Waste Reduction","24%","Increase","Tracking","success"],["Attendance Prediction Accuracy","91%","Minimize Deviation","Good","success"],["Payment Collection Rate","94%","Increase","Tracking","success"],["Complaint Resolution Time","1.8 Days","Decrease","Monitoring","warning"],["Platform Adoption","78%","Increase","Growing","success"]]; return <><PageHeader title="Administrator Dashboard" subtitle="Platform-wide monitoring, analytics, and service health." eyebrow="Admin workspace"/><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Active Students" value="2,480" icon={Users}/><Stat label="Active Messes" value="18" icon={Store} tone="secondary"/><Stat label="Food Waste Reduction" value="24%" icon={Leaf} tone="success"/><Stat label="Payment Collection" value="94%" icon={ShieldCheck} tone="primary"/></div><Card className="mb-6 p-0"><div className="p-5"><SectionTitle>Platform KPIs</SectionTitle></div><TableWrap><thead><tr>{["KPI","Current Value","Target Direction","Status"].map(h=><th key={h} className={th}>{h}</th>)}</tr></thead><tbody>{kpis.map(r=><tr key={r[0]}>{r.slice(0,3).map(v=><td className={td} key={v}>{v}</td>)}<td className={td}><Status type={r[4] as "success"|"warning"}>{r[3]}</Status></td></tr>)}</tbody></TableWrap></Card><div className="grid gap-6 xl:grid-cols-2"><Card><SectionTitle>Food waste trend</SectionTitle><div className="mb-4"><Progress value={82} tone="success"/></div><p className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingDown size={16} className="text-success"/><strong className="text-success">18% reduction</strong> compared with baseline</p></Card><Card><SectionTitle>Recent notifications</SectionTitle>{[["Menu updated by Shree Student Mess","New","success"],["New vendor awaiting verification","Review","warning"]].map(([a,b,c])=><div key={a} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-3 last:border-0"><p className="min-w-0 text-sm">{a}</p><Status type={c as "success"|"warning"}>{b}</Status></div>)}</Card></div></>; }