import { useEffect, useState } from "react";
import { Camera, IndianRupee, Lock, LogOut, Pencil, Save, Store, Users, UtensilsCrossed } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OwnerData = {
  name: string; messName: string; email: string; phone: string; address: string;
  capacity: string; staff: string; fee: string; fssai: string; upi: string;
  bank: string; since: string; photo: string;
};
const defaultOwner: OwnerData = {
  name: "Mess Owner", messName: "Shree Student Mess", email: "owner@mess.com", phone: "9812345670",
  address: "Shop 4, College Road, Near Main Gate", capacity: "180", staff: "6", fee: "2500",
  fssai: "12345678901234", upi: "shreemess@upi", bank: "State Bank of India ····4521", since: "2019", photo: "",
};

const card = "rounded-lg border bg-card p-5";
const input = "h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:bg-muted/50 disabled:text-muted-foreground";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block text-sm"><span className="mb-1.5 block font-semibold">{label}</span>{children}</label>
);

export function OwnerProfile({ notify }: { notify: (s: string) => void }) {
  const [data, setData] = useState<OwnerData>(defaultOwner);
  const [draft, setDraft] = useState<OwnerData>(defaultOwner);
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState({ orders: true, payments: true, feedback: true, sms: false });
  const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("studenthub-owner-profile");
      if (saved) { const p = { ...defaultOwner, ...JSON.parse(saved) }; setData(p); setDraft(p); }
      const sp = localStorage.getItem("studenthub-owner-prefs"); if (sp) setPrefs(JSON.parse(sp));
    } catch { /* ignore */ }
  }, []);

  const set = (k: keyof OwnerData) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, [k]: e.target.value }));
  const save = () => {
    if (!draft.name.trim() || !draft.messName.trim()) return notify("Name and mess name cannot be empty");
    if (!/^\S+@\S+\.\S+$/.test(draft.email)) return notify("Enter a valid email");
    if (!/^\d{10}$/.test(draft.phone)) return notify("Phone must be 10 digits");
    setData(draft); localStorage.setItem("studenthub-owner-profile", JSON.stringify(draft)); setEditing(false); notify("Profile saved");
  };
  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 1_500_000) return notify("Photo must be under 1.5 MB");
    const r = new FileReader();
    r.onload = () => { const next = { ...data, photo: String(r.result) }; setData(next); setDraft(next); localStorage.setItem("studenthub-owner-profile", JSON.stringify(next)); notify("Profile photo updated"); };
    r.readAsDataURL(f);
  };
  const togglePref = (k: keyof typeof prefs) => { const n = { ...prefs, [k]: !prefs[k] }; setPrefs(n); localStorage.setItem("studenthub-owner-prefs", JSON.stringify(n)); notify("Preference updated"); };
  const changePw = () => {
    if (!pw.cur) return notify("Enter your current password");
    if (pw.next.length < 6) return notify("New password must be at least 6 characters");
    if (pw.next !== pw.confirm) return notify("Passwords do not match");
    setPw({ cur: "", next: "", confirm: "" }); notify("Password changed");
  };

  const initials = data.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const d = editing ? draft : data;
  const F = (label: string, k: keyof OwnerData, type = "text") => <Field label={label}><input className={input} type={type} value={d[k]} onChange={set(k)} disabled={!editing} /></Field>;

  return <>
    <div className="mb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">— Owner workspace</p>
      <h1 className="font-display text-3xl font-extrabold">Owner Profile</h1>
      <p className="mt-2 text-muted-foreground">Manage your mess details, payment accounts, preferences and security.</p>
    </div>
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-6">
        <div className={cn(card, "text-center")}>
          <div className="relative mx-auto h-28 w-28">
            {data.photo ? <img src={data.photo} alt="Profile" className="h-28 w-28 rounded-full object-cover" /> : <div className="grid h-28 w-28 place-items-center rounded-full bg-primary font-display text-3xl font-extrabold text-primary-foreground">{initials}</div>}
            <label className="absolute bottom-0 right-0 grid h-9 w-9 cursor-pointer place-items-center rounded-full border bg-card shadow" aria-label="Change photo"><Camera size={16} /><input type="file" accept="image/*" className="hidden" onChange={onPhoto} /></label>
          </div>
          <h2 className="mt-4 font-display text-xl font-bold">{data.name}</h2>
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground"><Store size={14} />{data.messName}</p>
          <p className="mt-1 text-sm text-muted-foreground">Serving since {data.since}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
            <div><p className="font-display text-lg font-extrabold">{data.capacity}</p><p className="text-xs text-muted-foreground">Capacity</p></div>
            <div><p className="font-display text-lg font-extrabold">{data.staff}</p><p className="text-xs text-muted-foreground">Staff</p></div>
            <div><p className="font-display text-lg font-extrabold">₹{data.fee}</p><p className="text-xs text-muted-foreground">Monthly</p></div>
          </div>
        </div>
        <div className={card}>
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold"><UtensilsCrossed size={16} className="text-primary" />Meal timings</h3>
          <div className="space-y-3 text-sm">
            {[["Breakfast", "8:00 – 10:00 AM"], ["Lunch", "12:30 – 2:30 PM"], ["Dinner", "7:30 – 9:30 PM"]].map(([a, b]) => <div key={a} className="flex justify-between gap-3"><span className="text-muted-foreground">{a}</span><span className="font-semibold">{b}</span></div>)}
          </div>
        </div>
        <div className={card}>
          <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold"><Users size={16} className="text-primary" />This month</h3>
          <div className="space-y-3 text-sm">
            {[["Active subscribers", "142"], ["Meals served", "3,860"], ["Collection rate", "94%"]].map(([a, b]) => <div key={a} className="flex justify-between gap-3"><span className="text-muted-foreground">{a}</span><span className="font-semibold">{b}</span></div>)}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className={card}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold">Mess & owner information</h3>
            {editing
              ? <div className="flex gap-2"><Button variant="outline" onClick={() => { setDraft(data); setEditing(false); }}>Cancel</Button><Button onClick={save}><Save size={16} />Save</Button></div>
              : <Button variant="outline" onClick={() => { setDraft(data); setEditing(true); }}><Pencil size={16} />Edit</Button>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {F("Owner name", "name")}{F("Mess name", "messName")}{F("Email", "email", "email")}{F("Phone", "phone", "tel")}
            <div className="sm:col-span-2">{F("Mess address", "address")}</div>
            {F("Seating capacity", "capacity", "number")}{F("Staff count", "staff", "number")}{F("Monthly fee (₹)", "fee", "number")}{F("Serving since", "since")}
          </div>
        </div>
        <div className={card}>
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold"><IndianRupee size={16} className="text-primary" />Payments & license</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {F("UPI ID", "upi")}{F("Bank account", "bank")}
            <div className="sm:col-span-2">{F("FSSAI license number", "fssai")}</div>
          </div>
          {!editing && <p className="mt-3 text-xs text-muted-foreground">Click Edit above to change these details.</p>}
        </div>
        <div className={card}>
          <h3 className="mb-2 font-display text-base font-bold">Notification settings</h3>
          {([["orders", "New reservations & opt-ins"], ["payments", "Payment received alerts"], ["feedback", "New student feedback"], ["sms", "SMS notifications"]] as const).map(([k, label]) => <div key={k} className="flex items-center justify-between border-b py-3 last:border-0"><span className="text-sm font-medium">{label}</span><button role="switch" aria-checked={prefs[k]} aria-label={label} onClick={() => togglePref(k)} className={cn("relative h-6 w-11 rounded-full transition", prefs[k] ? "bg-primary" : "bg-muted")}><span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all", prefs[k] ? "left-[22px]" : "left-0.5")} /></button></div>)}
        </div>
        <div className={card}>
          <h3 className="mb-4 font-display text-base font-bold">Security</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Current password"><input type="password" className={input} value={pw.cur} onChange={e => setPw({ ...pw, cur: e.target.value })} /></Field>
            <Field label="New password"><input type="password" className={input} value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></Field>
            <Field label="Confirm password"><input type="password" className={input} value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={changePw}><Lock size={16} />Change password</Button>
            <Button variant="outline" asChild><Link to="/login" onClick={() => localStorage.removeItem("studenthub-role")}><LogOut size={16} />Log out</Link></Button>
          </div>
        </div>
      </div>
    </div>
  </>;
}
