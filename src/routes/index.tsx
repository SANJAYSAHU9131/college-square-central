import { Jankalyan } from "@/components/Jankalyan";
import { OwnerProfile } from "@/components/OwnerProfile";
import { DemandPredictor } from "@/components/DemandPredictor";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign, Clock3,
  CreditCard, Gauge, Home, LayoutDashboard, Leaf, Menu, MessageSquareText,
  Search, Settings, ShieldCheck, Sparkles, Store, TrendingDown, Users, Utensils,
  WalletCards, X, UserRound, Camera, LogOut, Lock, Pencil, Save,
  MapPin, Phone, Navigation, HandHeart,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import messShree from "@/assets/mess-shree.jpg";
import messCampus from "@/assets/mess-campus.jpg";
import roomGreen from "@/assets/room-green.jpg";
import nearbyStationery1 from "@/assets/nearby-stationery-1.jpg";
import nearbyStationery2 from "@/assets/nearby-stationery-2.jpg";
import nearbyPrint from "@/assets/nearby-print.jpg";
import nearbyEservices from "@/assets/nearby-eservices.jpg";
import nearbyGym1 from "@/assets/nearby-gym-1.jpg";
import nearbyGym2 from "@/assets/nearby-gym-2.jpg";

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

type PageId = "dashboard" | "discover" | "menu" | "attendance" | "payments" | "prediction" | "feedback" | "admin" | "profile" | "nearby" | "jankalyan";
const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "discover", label: "Discover", icon: Search },
  { id: "menu", label: "Meal Menu", icon: Utensils }, { id: "attendance", label: "Attendance", icon: CheckCircle2 },
  { id: "payments", label: "Payments", icon: CreditCard }, { id: "prediction", label: "Prediction", icon: Gauge },
  { id: "nearby", label: "Nearby", icon: MapPin }, { id: "feedback", label: "Feedback", icon: MessageSquareText }, { id: "profile", label: "My Profile", icon: UserRound },
  { id: "jankalyan", label: "Jankalyan", icon: HandHeart },
  { id: "admin", label: "Admin", icon: Settings },
] as const;

type Role = "user" | "owner";

function StudentHub() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role>("user");
  useEffect(() => {
    if (localStorage.getItem("studenthub-role") === "owner") setRole("owner");
  }, []);
  type Notif = { id: number; title: string; text: string; time: string; read: boolean };
  const userNotifs: Notif[] = [
    { id: 1, title: "Bill due soon", text: "Your mess bill of ₹1,850 is due on 30 September.", time: "2h ago", read: false },
    { id: 2, title: "Menu updated", text: "Friday dinner is now Veg Biryani instead of Mix Veg.", time: "5h ago", read: false },
    { id: 3, title: "Attendance marked", text: "You opted in for lunch tomorrow.", time: "1d ago", read: true },
  ];
  const ownerNotifs: Notif[] = [
    { id: 1, title: "142 students expected", text: "Today's predicted attendance is 142 with 91% confidence.", time: "1h ago", read: false },
    { id: 2, title: "New feedback received", text: "3 new feedback entries need your review.", time: "3h ago", read: false },
    { id: 3, title: "Payment collected", text: "₹2,500 received from Rahul S. for September.", time: "1d ago", read: true },
  ];
  const [notifs, setNotifs] = useState<Notif[]>(userNotifs);
  const [notifOpen, setNotifOpen] = useState(false);
  useEffect(() => { setNotifs(role === "owner" ? ownerNotifs : userNotifs); }, [role]);
  const unread = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const openNotif = (id: number) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const visibleNav = navItems.filter(n => role === "owner" || (n.id !== "prediction" && n.id !== "admin"));
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
      <nav className="space-y-1" aria-label="Main navigation">{visibleNav.map(({ id, label, icon: Icon }) =>
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
        <div className="flex shrink-0 items-center gap-3"><div className="relative">{notifOpen && <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} aria-hidden="true" />}<button onClick={() => setNotifOpen(o => !o)} className="relative hidden h-10 w-10 place-items-center rounded-md border bg-card text-muted-foreground hover:bg-accent sm:grid" aria-label="Notifications" aria-expanded={notifOpen}><Bell size={18} />{unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-card">{unread}</span>}</button>{notifOpen && <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-lg border bg-card shadow-xl" role="dialog" aria-label="Notifications"><div className="flex items-center justify-between border-b px-4 py-3"><p className="font-display text-sm font-bold">Notifications{unread > 0 && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{unread} new</span>}</p><button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline">Mark all read</button></div><ul className="max-h-80 overflow-y-auto">{notifs.map(n => <li key={n.id}><button onClick={() => openNotif(n.id)} className={cn("flex w-full gap-3 px-4 py-3 text-left transition hover:bg-accent", !n.read && "bg-info-soft/50")}><span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} /><span className="min-w-0"><span className="block text-sm font-semibold">{n.title}</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{n.text}</span><span className="mt-1 block text-[11px] text-muted-foreground">{n.time}</span></span></button></li>)}</ul></div>}</div><Link to="/login" className="hidden h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:inline-flex">Login</Link><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{role === "owner" ? "Mess Owner" : "Student User"}</p><p className="text-xs text-muted-foreground">{role === "owner" ? "Owner" : "Student"}</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{role === "owner" ? "MO" : "SU"}</div></div>
      </header>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
        <div key={page} className="page-enter">{renderPage(role === "user" && (page === "prediction" || page === "admin") ? "dashboard" : page, navigate, notify, query, role)}</div>
      </main>
    </div>
    {toast && <div role="status" className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-md bg-foreground px-4 py-3 text-sm font-medium text-background shadow-xl"><CheckCircle2 size={18} className="text-secondary" />{toast}</div>}
  </div>;
}

function renderPage(page: PageId, navigate: (id: PageId) => void, notify: (message: string) => void, query: string, role: Role = "user") {
  switch (page) {
    case "discover": return <Discover notify={notify} query={query} />;
    case "menu": return <MealMenu />;
    case "attendance": return <Attendance notify={notify} />;
    case "payments": return <Payments notify={notify} />;
    case "prediction": return <Prediction notify={notify} />;
    case "feedback": return <Feedback notify={notify} />;
    case "admin": return <Admin />;
    case "profile": return role === "owner" ? <OwnerProfile notify={notify} /> : <Profile notify={notify} />;
    case "jankalyan": return <Jankalyan role={role} notify={notify} />;
    case "nearby": return <Nearby notify={notify} query={query} />;
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

function useToday() {
  const [today, setToday] = useState("");
  useEffect(() => {
    const fmt = () => new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    setToday(fmt());
    const id = setInterval(() => setToday(fmt()), 60000);
    return () => clearInterval(id);
  }, []);
  return today;
}
function Dashboard({ navigate, role }: { navigate: (id: PageId) => void; role: Role }) {
  const today = useToday();
  const [optedToday, setOptedToday] = useState(3);
  useEffect(() => {
    const rec = loadAttendance()[dateKey(new Date())] ?? { Breakfast: true, Lunch: true, Dinner: true };
    setOptedToday(MEALS.filter(m => rec[m.name]).length);
  }, []);
  return <><PageHeader title={`Welcome back, ${role === "owner" ? "Mess Owner" : "Student User"}`} subtitle="Here’s what’s happening with your meals and campus services today." eyebrow={today || "Today"} />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Today's Meals" value={`${optedToday}/3`} icon={Utensils} note={`${optedToday} of 3 meals opted in`} /><Stat label="Attendance" value="87%" icon={CheckCircle2} tone="success" note="26 meals this month" /><Stat label="Pending Bill" value="₹1,850" icon={WalletCards} tone="warning" note="Due 30 September" /><Stat label="Waste Saved" value="18%" icon={Leaf} tone="secondary" note="Compared with baseline" /></div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><Card><SectionTitle action={<Button variant="outline" size="sm" onClick={() => navigate("menu")}>View menu <ChevronRight size={14} /></Button>}>Today’s meals</SectionTitle><div>{[["Breakfast","8:00 AM – 10:00 AM",true],["Lunch","12:30 PM – 2:30 PM",true],["Dinner","7:30 PM – 9:30 PM",false]].map(([name,time,on]) => <div key={String(name)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-4 last:border-0"><div className="min-w-0"><p className="font-semibold">{name}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 size={13} />{time}</p></div><Status type={on ? "success" : "danger"}>{on ? "Opted In" : "Opted Out"}</Status></div>)}</div></Card>
      <Card><SectionTitle>Food demand</SectionTitle><div className="rounded-md bg-info-soft p-5"><p className="text-sm font-medium text-muted-foreground">Today’s expected attendance</p><p className="mt-2 font-display text-3xl font-extrabold">142 <span className="text-base font-semibold text-muted-foreground">students</span></p><div className="my-5"><Progress value={78} /></div><div className="flex justify-between text-xs"><span className="text-muted-foreground">Prediction confidence</span><strong>91%</strong></div></div></Card></div>
    <Card className="mt-6"><SectionTitle>Quick actions</SectionTitle><div className="flex flex-wrap gap-3"><Button onClick={() => navigate("attendance")}><CheckCircle2 size={17} />Mark meal attendance</Button><Button variant="success" onClick={() => navigate("payments")}><CreditCard size={17} />Pay mess bill</Button><Button variant="outline" onClick={() => navigate("discover")}><Search size={17} />Find nearby services</Button></div></Card></>;
}

type Service = { img: string; name: string; rating: string; stars: string; distance: string; price: string; type: string; address: string; phone: string; timings: string; about: string; features: string[] };
const services: Service[] = [
  { img: messShree, name: "Didi ki Rasoi", rating: "4.5", stars: "★★★★☆", distance: "0.6 km away", price: "₹3,200 / month", type: "Mess", address: "Morar, Gwalior, Madhya Pradesh", phone: "+91 94251 38472", timings: "Lunch 12:00 – 2:30 PM · Dinner 7:00 – 10:00 PM", about: "Homely ghar-jaisa khana cooked fresh daily — dal, sabzi, roti and rice with a special Sunday thali.", features: ["Pure veg", "Home-style cooking", "Sunday special", "UPI accepted"] },
  { img: messCampus, name: "Bawarchi", rating: "4.0", stars: "★★★★☆", distance: "1.1 km away", price: "₹2,800 / month", type: "Mess", address: "Bank Colony, Morar, Gwalior, Madhya Pradesh 474005", phone: "+91 98930 45621", timings: "Lunch 12:00 – 2:30 PM · Dinner 7:00 – 10:00 PM", about: "Budget-friendly mess with a rotating weekly menu of North Indian meals, popular with students in Bank Colony.", features: ["Veg & non-veg", "Weekly menu", "Tiffin service", "Evening snacks"] },
];
function Discover({ notify, query }: { notify: (s: string) => void; query: string }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<Service | null>(null);
  const filtered = useMemo(() => services.filter(s => (filter === "All" || s.type === filter) && (s.name.toLowerCase().includes(query.toLowerCase()) || s.type.toLowerCase().includes(query.toLowerCase()))), [query, filter]);
  return <><PageHeader title="Discover" subtitle="Find trusted messes, rooms, and services near your college." eyebrow="Campus directory" /><div className="mb-5 flex gap-2">{([["All","All services"],["Mess","Messes"],["Room","Rooms"]] as const).map(([k,l]) => <Button key={k} size="sm" variant={filter === k ? "default" : "outline"} onClick={() => setFilter(k)}>{l}</Button>)}</div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(s => <div key={s.name} className="overflow-hidden rounded-lg border bg-card"><button onClick={() => setOpen(s)} className="block w-full" aria-label={`Open ${s.name}`}><img src={s.img} alt={s.name} width={1024} height={640} loading="lazy" className="h-44 w-full object-cover transition hover:opacity-90" /></button><div className="p-5"><div className="mb-2 flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-primary">{s.type}</p><button onClick={() => setOpen(s)} className="mt-1 text-left font-display text-lg font-bold hover:text-primary">{s.name}</button></div><span className="rounded-md bg-warning-soft px-2 py-1 text-xs font-bold text-warning">{s.rating}</span></div><p className="text-sm text-warning">{s.stars}</p><p className="mt-4 text-sm text-muted-foreground">📍 {s.distance}</p><div className="mt-5 flex items-center justify-between gap-3"><p className="font-display font-bold text-primary">{s.price}</p><div className="flex gap-2"><Button size="sm" variant="outline" asChild><a href={mapsDirUrl(s)} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${s.name}`}><Navigation size={14} />Directions</a></Button><Button size="sm" onClick={() => setOpen(s)}>View details</Button></div></div></div></div>)}{filtered.length === 0 && <Card className="md:col-span-2 xl:col-span-3"><p className="text-center text-muted-foreground">No services match “{query}”.</p></Card>}</div>
  {open && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.name}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card shadow-xl" onClick={e => e.stopPropagation()}><div className="relative"><img src={open.img} alt={open.name} width={1024} height={640} className="h-60 w-full object-cover" /><Button size="icon" variant="outline" className="absolute right-3 top-3" onClick={() => setOpen(null)} aria-label="Close details"><X size={18} /></Button></div><div className="p-6"><p className="text-xs font-bold uppercase tracking-wide text-primary">{open.type}</p><div className="mt-1 flex items-start justify-between gap-3"><h2 className="font-display text-2xl font-bold">{open.name}</h2><span className="rounded-md bg-warning-soft px-2 py-1 text-sm font-bold text-warning">★ {open.rating}</span></div><p className="mt-3 text-sm text-muted-foreground">{open.about}</p><div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><p><strong>Price:</strong> {open.price}</p><p><strong>Distance:</strong> {open.distance}</p><p><strong>Address:</strong> {open.address}</p><p><strong>Phone:</strong> {open.phone}</p><p className="sm:col-span-2"><strong>Timings:</strong> {open.timings}</p></div><div className="mt-5 flex flex-wrap gap-2">{open.features.map(f => <span key={f} className="rounded-md bg-info-soft px-2.5 py-1 text-xs font-semibold text-primary">{f}</span>)}</div><div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => { notify(open.type === "Mess" ? `Joined ${open.name}` : `Visit booked at ${open.name}`); setOpen(null); }}>{open.type === "Mess" ? "Join this mess" : "Book a visit"}</Button><Button variant="outline" asChild><a href={`tel:${open.phone.replace(/\s/g, "")}`}>Call owner</a></Button><Button variant="outline" asChild><a href={mapsDirUrl(open)} target="_blank" rel="noopener noreferrer"><Navigation size={16} />Get directions</a></Button></div></div></div></div>}</>;
}
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const weeklyMenus: { theme: string; days: [string, string, string, string][] }[] = [
  { theme: "North Indian week", days: [["Poha + Jalebi + Tea","Dal Tadka + Jeera Rice + Roti + Salad","Paneer Butter Masala + Roti","Banana"],["Aloo Paratha + Curd","Rajma + Rice + Roti","Mix Veg + Dal + Roti","Boiled Chana"],["Idli + Sambar + Chutney","Kadhi Pakoda + Rice + Roti","Chole + Bhature","Sprouts Chaat"],["Upma + Tea","Dal Makhani + Rice + Roti","Aloo Gobi + Roti + Kheer","Samosa + Tea"],["Bread Omelette / Veg Sandwich","Chole + Rice + Roti","Veg Biryani + Raita","Fruit Bowl"],["Methi Thepla + Pickle","Sambar Rice + Papad","Paneer Bhurji + Roti","Bhel Puri"],["Chole Kulche","Special Thali + Gulab Jamun","Light Khichdi + Kadhi","Masala Chai + Biscuits"]] },
  { theme: "South Indian week", days: [["Masala Dosa + Chutney","Sambar + Rice + Poriyal","Tomato Rice + Curd","Banana"],["Pongal + Vada","Rasam Rice + Beans Fry","Chapati + Veg Kurma","Sundal"],["Rava Idli + Chutney","Curd Rice + Pickle + Papad","Lemon Rice + Dal","Murukku + Tea"],["Uttapam + Sambar","Bisi Bele Bath + Raita","Paratha + Paneer Curry","Fruit Bowl"],["Poha + Tea","Veg Pulao + Dal Fry","Appam + Veg Stew","Corn Chaat"],["Medu Vada + Sambar","Lemon Rice + Rasam","Chole + Roti","Mirchi Bajji"],["Aloo Puri","Festive Thali + Payasam","Dal Khichdi + Papad","Coffee + Rusk"]] },
  { theme: "Protein-rich week", days: [["Moong Chilla + Chutney","Rajma + Brown Rice + Salad","Soya Chunk Curry + Roti","Roasted Peanuts"],["Besan Chilla + Curd","Chana Dal + Rice + Roti","Paneer Tikka Masala + Roti","Sprouts Salad"],["Oats Upma + Milk","Masoor Dal + Rice + Roti","Matar Paneer + Pulao","Boiled Eggs / Chana"],["Paneer Paratha + Curd","Lobia Curry + Rice","Mix Dal + Jeera Rice","Makhana"],["Egg Bhurji / Tofu Scramble + Toast","Chole + Rice + Roti","Veg Biryani + Raita","Fruit Custard"],["Idli + Sambar","Kadhi + Rice + Roti","Palak Paneer + Roti","Chana Chaat"],["Poha + Milk","Special Thali + Rasmalai","Moong Dal Khichdi","Lassi"]] },
  { theme: "Home-style week", days: [["Aloo Paratha + Butter","Dal Fry + Rice + Bhindi","Kadai Paneer + Roti","Banana"],["Poha + Tea","Rajma Chawal + Salad","Lauki Chana + Roti","Namak Pare"],["Vermicelli Upma","Dal + Rice + Aloo Jeera","Chole + Roti + Halwa","Fruit Bowl"],["Idli + Sambar","Kadhi Chawal + Papad","Mix Veg + Dal + Roti","Dhokla"],["Stuffed Paratha + Curd","Chole + Rice + Roti","Veg Fried Rice + Manchurian","Pav Bhaji"],["Bread Butter + Tea","Sambar Rice + Poriyal","Paneer Do Pyaza + Roti","Pakode + Tea"],["Puri Bhaji","Special Thali + Ice Cream","Khichdi + Kadhi","Masala Chai"]] },
];
function weekStart(offset: number) { const d = new Date(); const day = (d.getDay() + 6) % 7; d.setHours(0,0,0,0); d.setDate(d.getDate() - day + offset * 7); return d; }
function weekIndex(d: Date) { return Math.floor(d.getTime() / (7 * 864e5)) % 4; }
function MealMenu() {
  const [offset, setOffset] = useState(0);
  const [todayIdx, setTodayIdx] = useState(-1);
  useEffect(() => { setTodayIdx((new Date().getDay() + 6) % 7); }, []);
  const start = weekStart(offset); const end = new Date(start); end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const wk = weeklyMenus[((weekIndex(start) % 4) + 4) % 4]!;
  const label = offset === 0 ? "This week" : offset === 1 ? "Next week" : offset === -1 ? "Last week" : `${offset > 0 ? "+" : ""}${offset} weeks`;
  return <><PageHeader title="Weekly Meal Menu" subtitle="A 4-week rotating menu from Shree Student Mess — balanced, varied and planned ahead." eyebrow={`${fmt(start)} – ${fmt(end)}`} />
  <div className="mb-5 flex flex-wrap items-center gap-2">
    <Button variant="outline" size="sm" onClick={() => setOffset(o => o - 1)} aria-label="Previous week"><ChevronRight size={14} className="rotate-180" />Previous</Button>
    <Button variant={offset === 0 ? "default" : "outline"} size="sm" onClick={() => setOffset(0)}>This week</Button>
    <Button variant="outline" size="sm" onClick={() => setOffset(o => o + 1)} aria-label="Next week">Next<ChevronRight size={14} /></Button>
    <span className="ml-auto flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays size={15} />{label} · <strong className="text-foreground">{wk.theme}</strong></span>
  </div>
  <Card className="p-0"><TableWrap><thead><tr>{["Day","Breakfast","Lunch","Snacks","Dinner"].map(h => <th className={th} key={h}>{h}</th>)}</tr></thead><tbody>{wk.days.map((d, i) => { const isToday = offset === 0 && i === todayIdx; const date = new Date(start); date.setDate(start.getDate() + i); return <tr key={DAYS[i]} className={cn(isToday && "bg-info-soft/60")}><td className={cn(td, "font-bold")}>{DAYS[i]}<span className="block text-xs font-normal text-muted-foreground">{fmt(date)}</span>{isToday && <span className="text-xs font-semibold text-primary">Today</span>}</td><td className={td}>{d[0]}</td><td className={td}>{d[1]}</td><td className={td}>{d[3]}</td><td className={td}>{d[2]}</td></tr>; })}</tbody></TableWrap></Card>
  <p className="mt-3 text-xs text-muted-foreground">Timings: Breakfast 8–10 AM · Lunch 12:30–2:30 PM · Snacks 5–6 PM · Dinner 7:30–9:30 PM. Sunday lunch is a special thali.</p></>;
}

type MealName = "Breakfast" | "Lunch" | "Dinner";
const MEALS: { name: MealName; cutoff: number; label: string; time: string }[] = [
  { name: "Breakfast", cutoff: 7, label: "Cut-off: 7:00 AM", time: "8:00 – 10:00 AM" },
  { name: "Lunch", cutoff: 11, label: "Cut-off: 11:00 AM", time: "12:30 – 2:30 PM" },
  { name: "Dinner", cutoff: 18, label: "Cut-off: 6:00 PM", time: "7:30 – 9:30 PM" },
];
const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function loadAttendance(): Record<string, Record<MealName, boolean>> {
  try { return JSON.parse(localStorage.getItem("studenthub-attendance") ?? "{}") as Record<string, Record<MealName, boolean>>; } catch { return {}; }
}

function Attendance({ notify }: { notify: (s: string) => void }) {
  const [records, setRecords] = useState<Record<string, Record<MealName, boolean>>>(loadAttendance);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(t); }, []);
  const save = (next: Record<string, Record<MealName, boolean>>) => { setRecords(next); try { localStorage.setItem("studenthub-attendance", JSON.stringify(next)); } catch { /* ignore */ } };
  const getDay = (d: Date): Record<MealName, boolean> => records[dateKey(d)] ?? { Breakfast: true, Lunch: true, Dinner: true };
  const toggle = (d: Date, name: MealName, isToday: boolean) => {
    if (isToday) { const m = MEALS.find((x) => x.name === name)!; if (now.getHours() >= m.cutoff) { notify(`Cut-off passed for ${name} — changes are locked`); return; } }
    const k = dateKey(d); const day = { ...getDay(d) }; day[name] = !day[name];
    save({ ...records, [k]: day });
    notify(day[name] ? `${name} attendance confirmed for ${isToday ? "today" : "tomorrow"}` : `${name} cancelled for ${isToday ? "today" : "tomorrow"}`);
  };
  const today = new Date(); const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  const todayRec = getDay(today); const tomorrowRec = getDay(tomorrow);
  const optedToday = MEALS.filter((m) => todayRec[m.name]).length;
  // Monthly stats: count this month's recorded opted-in meals plus 24 baseline attended meals
  const monthPrefix = dateKey(today).slice(0, 7);
  const monthKeys = Object.keys(records).filter((k) => k.startsWith(monthPrefix));
  const attended = 24 + monthKeys.reduce((n, k) => { const r = records[k]!; return n + MEALS.filter((m) => r[m.name]).length; }, 0);
  const total = 28 + monthKeys.length * 3;
  const pct = Math.min(100, Math.round((attended / total) * 100));
  const mealRow = (d: Date, rec: Record<MealName, boolean>, isToday: boolean) => MEALS.map((m) => {
    const locked = isToday && now.getHours() >= m.cutoff;
    return <div key={m.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b py-4 last:border-0"><div><p className="font-semibold">{m.name}</p><p className="mt-1 text-xs text-muted-foreground">{m.time} · {m.label}{locked && <span className="ml-1 font-semibold text-danger">(locked)</span>}</p></div><Button variant={rec[m.name] ? "success" : "destructive"} size="sm" disabled={locked} onClick={() => toggle(d, m.name, isToday)}>{rec[m.name] ? <CheckCircle2 size={15} /> : <X size={15} />}{rec[m.name] ? "Opted In" : "Opted Out"}</Button></div>;
  });
  return <><PageHeader title="Meal Attendance" subtitle="Opt in or out before each meal’s cut-off time. Your choices are saved automatically." eyebrow="Attendance workspace" />
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Today's Meals" value={`${optedToday}/3`} icon={Utensils} note="Opted in today" /><Stat label="Attendance" value={`${pct}%`} icon={CheckCircle2} tone="success" note={`${attended} meals this month`} /><Stat label="Tomorrow" value={`${MEALS.filter((m) => tomorrowRec[m.name]).length}/3`} icon={CalendarDays} tone="secondary" note="Meals planned" /><Stat label="Waste Saved" value="18%" icon={Leaf} tone="secondary" note="Thanks to your opt-outs" /></div>
    <div className="grid gap-6 xl:grid-cols-[.75fr_1.25fr]"><Card><SectionTitle>Monthly attendance</SectionTitle><div className="flex flex-col items-center py-3"><div className="grid h-44 w-44 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) 0 ${pct}%, var(--muted) ${pct}% 100%)` }}><div className="grid h-32 w-32 place-items-center rounded-full bg-card"><div className="text-center"><p className="font-display text-3xl font-extrabold">{pct}%</p><p className="text-xs text-muted-foreground">attendance</p></div></div></div><p className="mt-5 text-sm text-muted-foreground"><strong className="text-foreground">{attended} meals</strong> attended this month</p><p className="mt-1 text-xs text-muted-foreground">The ring updates as you mark meals.</p></div></Card>
      <div className="space-y-6"><Card><SectionTitle>Today’s meal selection</SectionTitle>{mealRow(today, todayRec, true)}</Card><Card><SectionTitle>Plan tomorrow</SectionTitle>{mealRow(tomorrow, tomorrowRec, false)}</Card></div></div></>;
}

function Payments({ notify }: { notify: (s: string) => void }) { return <><PageHeader title="Payments & Billing" subtitle="Manage your mess bills and review payment history." eyebrow="Billing overview" /><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Current Bill" value="₹1,850" icon={CircleDollarSign}/><Stat label="Due Date" value="30 Sep" icon={CalendarDays} tone="warning"/><Stat label="Paid This Year" value="₹18,400" icon={WalletCards} tone="success"/><Stat label="Status" value="Pending" icon={Clock3} tone="warning"/></div><Card className="p-0"><div className="p-5"><SectionTitle action={<Button onClick={() => notify("Payment gateway opened")}><CreditCard size={17}/>Pay ₹1,850</Button>}>Payment history</SectionTitle></div><TableWrap><thead><tr>{["Date","Description","Amount","Status"].map(h=><th className={th} key={h}>{h}</th>)}</tr></thead><tbody>{[["01 Sep 2026","Mess Subscription","₹2,500"],["01 Aug 2026","Mess Subscription","₹2,500"]].map(r=><tr key={r[0]}>{r.map(v=><td className={td} key={v}>{v}</td>)}<td className={td}><Status>Paid</Status></td></tr>)}</tbody></TableWrap></Card></>; }

function Prediction({ notify }: { notify:(s:string)=>void }) { return <><PageHeader title="Food Demand Prediction" subtitle="Forecasts upcoming meal demand from past attendance records to cut food waste." eyebrow="Predictive analytics"/><DemandPredictor notify={notify}/></>; }

function Feedback({ notify }: { notify:(s:string)=>void }) { const [comments,setComments]=useState(""); return <><PageHeader title="Feedback & Complaints" subtitle="Share your experience and help improve student services." eyebrow="Student support"/><div className="grid gap-6 xl:grid-cols-2"><Card><SectionTitle>Submit feedback</SectionTitle><form onSubmit={e=>{e.preventDefault();setComments("");notify("Feedback submitted successfully");}} className="space-y-5"><Field label="Service"><select className="h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"><option>Mess</option><option>Hostel</option><option>Stationery Store</option></select></Field><Field label="Rating"><select className="h-11 w-full rounded-md border bg-background px-3 text-warning outline-none focus:border-primary"><option>★★★★★</option><option>★★★★☆</option><option>★★★☆☆</option><option>★★☆☆☆</option><option>★☆☆☆☆</option></select></Field><Field label="Comments"><textarea required value={comments} onChange={e=>setComments(e.target.value)} className="min-h-32 w-full resize-y rounded-md border bg-background p-3 outline-none focus:border-primary" placeholder="Describe your experience..."/></Field><Button type="submit"><MessageSquareText size={17}/>Submit feedback</Button></form></Card><Card><SectionTitle>My complaints</SectionTitle>{[["Food Quality","Submitted 18 Sep","Resolved","success"],["Menu Issue","Submitted 21 Sep","In Review","warning"]].map(([a,b,c,d])=><div key={a} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b py-4 last:border-0"><div><p className="font-semibold">{a}</p><p className="mt-1 text-xs text-muted-foreground">{b}</p></div><Status type={d as "success"|"warning"}>{c}</Status></div>)}</Card></div></>; }
function Field({label,children}:{label:string;children:React.ReactNode}) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }

function Admin() { const kpis=[["Food Waste Reduction","24%","Increase","Tracking","success"],["Attendance Prediction Accuracy","91%","Minimize Deviation","Good","success"],["Payment Collection Rate","94%","Increase","Tracking","success"],["Complaint Resolution Time","1.8 Days","Decrease","Monitoring","warning"],["Platform Adoption","78%","Increase","Growing","success"]]; return <><PageHeader title="Administrator Dashboard" subtitle="Platform-wide monitoring, analytics, and service health." eyebrow="Admin workspace"/><div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Active Students" value="2,480" icon={Users}/><Stat label="Active Messes" value="18" icon={Store} tone="secondary"/><Stat label="Food Waste Reduction" value="24%" icon={Leaf} tone="success"/><Stat label="Payment Collection" value="94%" icon={ShieldCheck} tone="primary"/></div><Card className="mb-6 p-0"><div className="p-5"><SectionTitle>Platform KPIs</SectionTitle></div><TableWrap><thead><tr>{["KPI","Current Value","Target Direction","Status"].map(h=><th key={h} className={th}>{h}</th>)}</tr></thead><tbody>{kpis.map(r=><tr key={r[0]}>{r.slice(0,3).map(v=><td className={td} key={v}>{v}</td>)}<td className={td}><Status type={r[4] as "success"|"warning"}>{r[3]}</Status></td></tr>)}</tbody></TableWrap></Card><div className="grid gap-6 xl:grid-cols-2"><Card><SectionTitle>Food waste trend</SectionTitle><div className="mb-4"><Progress value={82} tone="success"/></div><p className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingDown size={16} className="text-success"/><strong className="text-success">18% reduction</strong> compared with baseline</p></Card><Card><SectionTitle>Recent notifications</SectionTitle>{[["Menu updated by Shree Student Mess","New","success"],["New vendor awaiting verification","Review","warning"]].map(([a,b,c])=><div key={a} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b py-3 last:border-0"><p className="min-w-0 text-sm">{a}</p><Status type={c as "success"|"warning"}>{b}</Status></div>)}</Card></div></>; }
type ProfileData = { name: string; roll: string; email: string; phone: string; college: string; course: string; year: string; hostel: string; room: string; diet: string; allergies: string; guardian: string; guardianPhone: string; photo: string };
const defaultProfile: ProfileData = { name: "Student User", roll: "BTMC25O1083", email: "student@gmail.com", phone: "9876543210", college: "StudentHub Institute of Technology", course: "B.Tech Computer Science", year: "2nd Year", hostel: "Boys Hostel A", room: "A-214", diet: "Vegetarian", allergies: "None", guardian: "Parent Name", guardianPhone: "9123456780", photo: "" };
const inputCls = "h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/50 disabled:text-muted-foreground";

function Profile({ notify }: { notify: (s: string) => void }) {
  const [data, setData] = useState<ProfileData>(defaultProfile);
  const [draft, setDraft] = useState<ProfileData>(defaultProfile);
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState({ meal: true, bill: true, menu: false, sms: true });
  const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });
  useEffect(() => {
    try {
      const saved = localStorage.getItem("studenthub-profile");
      if (saved) { const p = { ...defaultProfile, ...JSON.parse(saved) }; setData(p); setDraft(p); }
      const sp = localStorage.getItem("studenthub-prefs"); if (sp) setPrefs(JSON.parse(sp));
    } catch { /* ignore */ }
  }, []);
  const set = (k: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft(d => ({ ...d, [k]: e.target.value }));
  const save = () => {
    if (!draft.name.trim()) return notify("Name cannot be empty");
    if (!/^\S+@\S+\.\S+$/.test(draft.email)) return notify("Enter a valid email");
    if (!/^\d{10}$/.test(draft.phone)) return notify("Phone must be 10 digits");
    setData(draft); localStorage.setItem("studenthub-profile", JSON.stringify(draft)); setEditing(false); notify("Profile saved");
  };
  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 1_500_000) return notify("Photo must be under 1.5 MB");
    const r = new FileReader();
    r.onload = () => { const next = { ...data, photo: String(r.result) }; setData(next); setDraft(next); localStorage.setItem("studenthub-profile", JSON.stringify(next)); notify("Profile photo updated"); };
    r.readAsDataURL(f);
  };
  const togglePref = (k: keyof typeof prefs) => { const n = { ...prefs, [k]: !prefs[k] }; setPrefs(n); localStorage.setItem("studenthub-prefs", JSON.stringify(n)); notify("Preference updated"); };
  const changePw = () => {
    if (!pw.cur) return notify("Enter your current password");
    if (pw.next.length < 6) return notify("New password must be at least 6 characters");
    if (pw.next !== pw.confirm) return notify("Passwords do not match");
    setPw({ cur: "", next: "", confirm: "" }); notify("Password changed");
  };
  const initials = data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const d = editing ? draft : data;
  const F = (label: string, k: keyof ProfileData, type = "text") => <Field label={label}><input className={inputCls} type={type} value={d[k]} onChange={set(k)} disabled={!editing} /></Field>;

  return <><PageHeader title="My Profile" subtitle="Manage your personal details, mess plan, preferences and security." eyebrow="Student workspace" />
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card className="text-center">
          <div className="relative mx-auto h-28 w-28">
            {data.photo ? <img src={data.photo} alt="Profile" className="h-28 w-28 rounded-full object-cover" /> : <div className="grid h-28 w-28 place-items-center rounded-full bg-primary font-display text-3xl font-extrabold text-primary-foreground">{initials}</div>}
            <label className="absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-card shadow" aria-label="Change photo"><Camera size={16} /><input type="file" accept="image/*" className="hidden" onChange={onPhoto} /></label>
          </div>
          <h2 className="mt-4 font-display text-xl font-bold">{data.name}</h2>
          <p className="text-sm text-muted-foreground">{data.roll}</p>
          <p className="mt-1 text-sm text-muted-foreground">{data.course} · {data.year}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
            <div><p className="font-display text-lg font-extrabold">87%</p><p className="text-xs text-muted-foreground">Attendance</p></div>
            <div><p className="font-display text-lg font-extrabold">26</p><p className="text-xs text-muted-foreground">Meals</p></div>
            <div><p className="font-display text-lg font-extrabold">₹1,850</p><p className="text-xs text-muted-foreground">Due</p></div>
          </div>
        </Card>
        <Card>
          <SectionTitle>Mess subscription</SectionTitle>
          <div className="space-y-3 text-sm">
            {[["Mess", "Shree Student Mess"], ["Plan", "Monthly · 3 meals/day"], ["Fee", "₹2,500 / month"], ["Valid till", "30 Sep 2026"]].map(([a, b]) => <div key={a} className="flex justify-between gap-3"><span className="text-muted-foreground">{a}</span><span className="font-semibold">{b}</span></div>)}
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Status>Active</Status></div>
          </div>
          <Button variant="outline" className="mt-5 w-full" onClick={() => notify("Subscription renewed for October")}>Renew plan</Button>
        </Card>
        <Card>
          <SectionTitle>Digital mess ID</SectionTitle>
          <div className="rounded-md border border-dashed p-4 text-center">
            <div className="mx-auto grid h-24 w-24 grid-cols-6 gap-0.5">{Array.from({ length: 36 }).map((_, i) => <span key={i} className={cn("rounded-[1px]", (i * 7 + data.roll.length) % 3 ? "bg-foreground" : "bg-transparent")} />)}</div>
            <p className="mt-3 text-xs text-muted-foreground">Show at the mess counter</p>
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <SectionTitle action={editing ? <div className="flex gap-2"><Button variant="outline" onClick={() => { setDraft(data); setEditing(false); }}>Cancel</Button><Button onClick={save}><Save size={16} />Save</Button></div> : <Button variant="outline" onClick={() => { setDraft(data); setEditing(true); }}><Pencil size={16} />Edit</Button>}>Personal information</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            {F("Full name", "name")}{F("Roll number", "roll")}{F("Email", "email", "email")}{F("Phone", "phone", "tel")}
            {F("College", "college")}{F("Course", "course")}
            <Field label="Year"><select className={inputCls} value={d.year} onChange={set("year")} disabled={!editing}>{["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y => <option key={y}>{y}</option>)}</select></Field>
            {F("Hostel", "hostel")}{F("Room number", "room")}
          </div>
        </Card>
        <Card>
          <SectionTitle>Food preferences & emergency contact</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Diet"><select className={inputCls} value={d.diet} onChange={set("diet")} disabled={!editing}>{["Vegetarian", "Non-vegetarian", "Eggetarian", "Jain", "Vegan"].map(y => <option key={y}>{y}</option>)}</select></Field>
            {F("Allergies", "allergies")}{F("Guardian name", "guardian")}{F("Guardian phone", "guardianPhone", "tel")}
          </div>
          {!editing && <p className="mt-3 text-xs text-muted-foreground">Click Edit above to change these details.</p>}
        </Card>
        <Card>
          <SectionTitle>Notification settings</SectionTitle>
          {([["meal", "Meal reminders"], ["bill", "Bill due alerts"], ["menu", "Menu change updates"], ["sms", "SMS notifications"]] as const).map(([k, label]) => <div key={k} className="flex items-center justify-between border-b py-3 last:border-0"><span className="text-sm font-medium">{label}</span><button role="switch" aria-checked={prefs[k]} aria-label={label} onClick={() => togglePref(k)} className={cn("relative h-6 w-11 rounded-full transition", prefs[k] ? "bg-primary" : "bg-muted")}><span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all", prefs[k] ? "left-[22px]" : "left-0.5")} /></button></div>)}
        </Card>
        <Card>
          <SectionTitle>Security</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password"><input type="password" className={inputCls} value={pw.cur} onChange={e => setPw({ ...pw, cur: e.target.value })} /></Field>
            <Field label="New password"><input type="password" className={inputCls} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></Field>
            <Field label="Confirm password"><input type="password" className={inputCls} value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={changePw}><Lock size={16} />Change password</Button>
            <Button variant="outline" asChild><Link to="/login" onClick={() => localStorage.removeItem("studenthub-role")}><LogOut size={16} />Log out</Link></Button>
          </div>
        </Card>
      </div>
    </div></>;
}

type NearbyPlace = { img: string; name: string; category: "Stationery" | "Form Filling & Online Services" | "Gym & Fitness"; rating: string; distance: string; price: string; address: string; phone: string; timings: string; about: string; features: string[] };
const mapsDirUrl = (p: { name: string; address: string }) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${p.name}, ${p.address}`)}`;
const nearbyPlaces: NearbyPlace[] = [
  { img: nearbyStationery1, name: "Campus Stationers", category: "Stationery", rating: "4.6", distance: "200 m", price: "₹5 onwards", address: "Shop 4, College Gate Road", phone: "+91 98220 11223", timings: "Mon–Sat, 8:30 AM – 9:00 PM", about: "Full-range stationery store for notebooks, pens, art supplies, lab records and project files at student prices.", features: ["Notebooks & pens", "Lab records", "Project binding", "Art supplies"] },
  { img: nearbyStationery2, name: "Study Point Stationery", category: "Stationery", rating: "4.4", distance: "450 m", price: "₹5 onwards", address: "12, Hostel Lane, North Campus", phone: "+91 98220 44556", timings: "Mon–Sun, 9:00 AM – 8:30 PM", about: "Budget stationery and exam essentials with bulk discounts for class groups and hostel students.", features: ["Exam kits", "Calculators", "Bulk discounts", "Chart papers"] },
  { img: nearbyPrint, name: "QuickPrint & Xerox", category: "Form Filling & Online Services", rating: "4.7", distance: "300 m", price: "₹2 / page", address: "Shop 7, Market Complex, College Road", phone: "+91 98220 77889", timings: "Mon–Sun, 8:00 AM – 10:00 PM", about: "Printing, photocopy, scanning, online form filling, exam applications, passport photos and lamination — all in one shop.", features: ["Online form filling", "Printing & xerox", "Passport photos", "Lamination", "Exam applications"] },
  { img: nearbyEservices, name: "e-Seva Online Services", category: "Form Filling & Online Services", rating: "4.5", distance: "600 m", price: "₹20 onwards", address: "2nd Floor, City Plaza, Main Road", phone: "+91 98220 99001", timings: "Mon–Sat, 9:30 AM – 8:00 PM", about: "Help with scholarship forms, exam registrations, resume printing, email setup and other online applications.", features: ["Scholarship forms", "Exam registration", "Resume printing", "Document scanning"] },
  { img: nearbyGym1, name: "FitZone Gym", category: "Gym & Fitness", rating: "4.8", distance: "800 m", price: "₹800 / month", address: "1st Floor, Silver Arcade, Ring Road", phone: "+91 98220 33445", timings: "Mon–Sat, 5:30 AM – 10:00 PM", about: "Modern gym with strength and cardio zones, certified trainers and a special student membership plan.", features: ["Student discount", "Certified trainers", "Cardio zone", "Diet guidance"] },
  { img: nearbyGym2, name: "PowerHouse Fitness Academy", category: "Gym & Fitness", rating: "4.6", distance: "1.2 km", price: "₹1,000 / month", address: "Plot 18, Sports Complex Road", phone: "+91 98220 66778", timings: "Mon–Sun, 6:00 AM – 9:30 PM", about: "Fitness academy offering weight training, yoga batches, Zumba and personal coaching for beginners and athletes.", features: ["Yoga & Zumba", "Personal coaching", "Weight training", "Morning batches"] },
];

function Nearby({ notify, query }: { notify: (s: string) => void; query: string }) {
  const [cat, setCat] = useState<"All" | NearbyPlace["category"]>("All");
  const [open, setOpen] = useState<NearbyPlace | null>(null);
  const cats = ["All", "Stationery", "Form Filling & Online Services", "Gym & Fitness"] as const;
  const list = nearbyPlaces.filter(p => (cat === "All" || p.category === cat) && (!query || (p.name + p.category + p.features.join(" ")).toLowerCase().includes(query.toLowerCase())));
  return <>
    <PageHeader title="Nearby Services" subtitle="Stationery stores, form-filling & online service shops, and gyms around your campus." eyebrow="Around campus" />
    <div className="mb-6 flex flex-wrap gap-2">{cats.map(c => <button key={c} onClick={() => setCat(c)} className={cn("h-9 rounded-md border px-4 text-sm font-semibold transition", cat === c ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent")}>{c}</button>)}</div>
    {list.length === 0 && <Card><p className="py-8 text-center text-sm text-muted-foreground">No places match your search.</p></Card>}
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{list.map(p => (
      <Card key={p.name} className="flex flex-col overflow-hidden p-0">
        <button type="button" onClick={() => setOpen(p)} className="relative block h-44 w-full overflow-hidden" aria-label={`View details of ${p.name}`}>
          <img src={p.img} alt={p.name} loading="lazy" width={1024} height={1024} className="h-44 w-full object-cover transition duration-300 hover:scale-105" />
          <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-foreground">{p.category}</span>
          <span className="absolute right-3 top-3 rounded-md bg-warning px-2 py-1 text-xs font-bold text-warning-foreground">★ {p.rating}</span>
        </button>
        <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold">{p.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin size={13} />{p.distance} · {p.address}</p>
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{p.about}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">{p.features.slice(0, 3).map(f => <span key={f} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{f}</span>)}</div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-4">
          <span className="text-sm font-bold">{p.price}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild><a href={mapsDirUrl(p)} target="_blank" rel="noreferrer" aria-label={`Get directions to ${p.name}`}><Navigation size={14} />Directions</a></Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(p)}>View details</Button>
          </div>
        </div>
        </div>
      </Card>))}
    </div>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.name}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-wide text-primary">{open.category}</p><h2 className="mt-1 font-display text-2xl font-bold">{open.name}</h2></div>
          <Button size="icon" variant="outline" onClick={() => setOpen(null)} aria-label="Close details"><X size={18} /></Button>
        </div>
        <img src={open.img} alt={open.name} loading="lazy" width={1024} height={1024} className="mt-4 h-52 w-full rounded-lg object-cover" />
        <p className="mt-4 text-sm text-muted-foreground">{open.about}</p>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <p><strong>Price:</strong> {open.price}</p><p><strong>Distance:</strong> {open.distance}</p>
          <p><strong>Address:</strong> {open.address}</p><p><strong>Phone:</strong> {open.phone}</p>
          <p className="sm:col-span-2"><strong>Timings:</strong> {open.timings}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">{open.features.map(f => <span key={f} className="rounded-md bg-info-soft px-2.5 py-1 text-xs font-semibold text-primary">{f}</span>)}</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => { notify(`Saved ${open.name} to your places`); setOpen(null); }}>Save place</Button>
          <Button variant="outline" asChild><a href={mapsDirUrl(open)} target="_blank" rel="noreferrer" aria-label={`Get directions to ${open.name}`}><Navigation size={16} />Directions</a></Button>
          <Button variant="outline" asChild><a href={`tel:${open.phone.replace(/\s/g, "")}`}><Phone size={16} />Call</a></Button>
        </div>
      </div>
    </div>}
  </>;
}
