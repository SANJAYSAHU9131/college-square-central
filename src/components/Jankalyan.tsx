import { useEffect, useState } from "react";
import { HandHeart, HeartHandshake, IndianRupee, Phone, Plus, ShoppingBag, Truck, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Org = { id: string; name: string; type: string; area: string; phone: string; capacity: number };
type Donation = { id: string; orgId: string; item: string; portions: number; date: string; status: "Scheduled" | "Picked up" };
type Offer = { id: string; item: string; meal: string; mrp: number; price: number; qty: number; pickup: string; reserved: number };
type Booking = { id: string; offerId: string; name: string; roll: string; qty: number };

const ORGS: Org[] = [
  { id: "o1", name: "Shri Ram Seva Ashram", type: "Ashram", area: "Near Old Bus Stand, 2.1 km", phone: "9000000001", capacity: 60 },
  { id: "o2", name: "Apna Ghar Old Age Home", type: "Old age home", area: "Civil Lines, 3.4 km", phone: "9000000002", capacity: 40 },
  { id: "o3", name: "Robin Hood Army – City Chapter", type: "NGO", area: "Pickup across city", phone: "9000000003", capacity: 150 },
  { id: "o4", name: "Bal Ashray Children's Home", type: "Orphanage", area: "Station Road, 4.0 km", phone: "9000000004", capacity: 50 },
];
const DEF_DON: Donation[] = [
  { id: "d1", orgId: "o3", item: "Dal, rice & sabzi", portions: 34, date: "29 Sep", status: "Picked up" },
  { id: "d2", orgId: "o1", item: "Rotis & paneer curry", portions: 22, date: "30 Sep", status: "Picked up" },
];
const DEF_OFF: Offer[] = [
  { id: "f1", item: "Veg thali (dal, rice, 3 roti, sabzi)", meal: "Dinner", mrp: 70, price: 30, qty: 20, pickup: "9:15 – 9:45 PM", reserved: 6 },
  { id: "f2", item: "Poha + chai", meal: "Breakfast", mrp: 35, price: 15, qty: 12, pickup: "9:45 – 10:15 AM", reserved: 3 },
];

function useStored<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  useEffect(() => { try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s) as T); } catch { /* ignore */ } }, [key]);
  const set = (n: T) => { setV(n); try { localStorage.setItem(key, JSON.stringify(n)); } catch { /* ignore */ } };
  return [v, set] as const;
}

const card = "rounded-lg border bg-card p-5";
const input = "mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary";
const today = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function Jankalyan({ role, notify }: { role: "user" | "owner"; notify: (s: string) => void }) {
  const [donations, setDonations] = useStored<Donation[]>("studenthub-jk-donations", DEF_DON);
  const [offers, setOffers] = useStored<Offer[]>("studenthub-jk-offers", DEF_OFF);
  const [bookings, setBookings] = useStored<Booking[]>("studenthub-jk-bookings", []);
  const [don, setDon] = useState({ orgId: "o3", item: "", portions: "" });
  const [off, setOff] = useState({ item: "", meal: "Dinner", mrp: "", price: "", qty: "", pickup: "9:15 – 9:45 PM" });
  const [reserve, setReserve] = useState<Offer | null>(null);
  const [rv, setRv] = useState({ name: "", roll: "", qty: "1" });

  const donated = donations.reduce((s, d) => s + d.portions, 0);
  const sold = offers.reduce((s, o) => s + o.reserved, 0);
  const saved = offers.reduce((s, o) => s + o.reserved * (o.mrp - o.price), 0);

  const addDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const p = Number(don.portions);
    if (!don.item.trim() || !(p > 0)) return notify("Enter the food item and number of portions");
    const org = ORGS.find((o) => o.id === don.orgId)!;
    if (p > org.capacity) return notify(`${org.name} can take at most ${org.capacity} portions`);
    setDonations([{ id: crypto.randomUUID(), orgId: don.orgId, item: don.item.trim(), portions: p, date: today(), status: "Scheduled" }, ...donations]);
    setDon({ ...don, item: "", portions: "" });
    notify(`Pickup scheduled with ${org.name}`);
  };
  const addOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const mrp = Number(off.mrp), price = Number(off.price), qty = Number(off.qty);
    if (!off.item.trim() || !(mrp > 0) || !(qty > 0) || !(price >= 0)) return notify("Fill item, regular price, discounted price and quantity");
    if (price >= mrp) return notify("Discounted price must be lower than the regular price");
    setOffers([{ id: crypto.randomUUID(), item: off.item.trim(), meal: off.meal, mrp, price, qty, pickup: off.pickup, reserved: 0 }, ...offers]);
    setOff({ ...off, item: "", mrp: "", price: "", qty: "" });
    notify("Discounted meal listed for students");
  };
  const confirmReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserve) return;
    const q = Number(rv.qty);
    if (!rv.name.trim() || !rv.roll.trim()) return notify("Enter your name and roll number");
    if (!(q >= 1 && q <= 2)) return notify("You can reserve 1 or 2 plates");
    if (reserve.reserved + q > reserve.qty) return notify("Not enough plates left");
    setOffers(offers.map((o) => (o.id === reserve.id ? { ...o, reserved: o.reserved + q } : o)));
    setBookings([{ id: crypto.randomUUID(), offerId: reserve.id, name: rv.name.trim(), roll: rv.roll.trim(), qty: q }, ...bookings]);
    notify(`Reserved ${q} plate(s) — pay ₹${q * reserve.price} at the counter, ${reserve.pickup}`);
    setReserve(null); setRv({ name: "", roll: "", qty: "1" });
  };

  const stats = [
    ["Portions donated", donated, HandHeart],
    ["Partner organisations", ORGS.length, HeartHandshake],
    ["Discounted plates sold", sold, ShoppingBag],
    ["Students saved", `₹${saved}`, IndianRupee],
  ] as const;

  return (
    <>
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">— Social impact</p>
        <h1 className="font-display text-3xl font-extrabold">Jankalyan</h1>
        <p className="mt-2 text-muted-foreground">No food goes to waste: leftover meals go to ashrams and NGOs, and extra plates are offered at a discount to students who need them.</p>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([l, v, Icon]) => <div key={l} className={card}><div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{l}</p><Icon size={18} className="text-primary" /></div><p className="mt-2 font-display text-3xl font-extrabold">{v}</p></div>)}
      </div>

      {/* Discounted meals */}
      <div className={cn("mb-6", card)}>
        <h2 className="mb-1 font-display text-lg font-bold">Affordable meals for students</h2>
        <p className="mb-4 text-sm text-muted-foreground">Fresh extra plates at a discount, reserved for students from middle-class and low-income families.</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((o) => { const left = o.qty - o.reserved; return (
            <div key={o.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-2"><p className="font-semibold">{o.item}</p><span className="rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success">{Math.round((1 - o.price / o.mrp) * 100)}% off</span></div>
              <p className="mt-1 text-xs text-muted-foreground">{o.meal} · Pickup {o.pickup}</p>
              <p className="mt-3"><span className="font-display text-2xl font-extrabold">₹{o.price}</span> <span className="text-sm text-muted-foreground line-through">₹{o.mrp}</span></p>
              <p className={cn("mt-1 text-xs font-semibold", left > 0 ? "text-muted-foreground" : "text-destructive")}>{left > 0 ? `${left} of ${o.qty} plates left` : "Sold out"}</p>
              <div className="mt-3 flex gap-2">
                {role === "user" ? <Button size="sm" disabled={left <= 0} onClick={() => setReserve(o)}>Reserve plate</Button>
                  : <Button size="sm" variant="outline" onClick={() => { setOffers(offers.filter((x) => x.id !== o.id)); notify("Offer removed"); }}><Trash2 size={14} />Remove</Button>}
              </div>
            </div>); })}
          {offers.length === 0 && <p className="text-sm text-muted-foreground">No discounted meals right now. Check back after meal time.</p>}
        </div>
      </div>

      {role === "owner" && (
        <div className="mb-6 grid gap-6 xl:grid-cols-2">
          <form onSubmit={addOffer} className={card}>
            <h2 className="mb-4 font-display text-lg font-bold">List a discounted meal</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">Food item<input aria-label="Offer item" className={input} value={off.item} onChange={(e) => setOff({ ...off, item: e.target.value })} placeholder="e.g. Rajma chawal" /></label>
              <label className="text-sm font-semibold">Meal<select className={input} value={off.meal} onChange={(e) => setOff({ ...off, meal: e.target.value })}><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select></label>
              <label className="text-sm font-semibold">Plates available<input aria-label="Plates available" type="number" className={input} value={off.qty} onChange={(e) => setOff({ ...off, qty: e.target.value })} /></label>
              <label className="text-sm font-semibold">Regular price (₹)<input aria-label="Regular price" type="number" className={input} value={off.mrp} onChange={(e) => setOff({ ...off, mrp: e.target.value })} /></label>
              <label className="text-sm font-semibold">Discounted price (₹)<input aria-label="Discounted price" type="number" className={input} value={off.price} onChange={(e) => setOff({ ...off, price: e.target.value })} /></label>
              <label className="text-sm font-semibold sm:col-span-2">Pickup time<input className={input} value={off.pickup} onChange={(e) => setOff({ ...off, pickup: e.target.value })} /></label>
            </div>
            <Button type="submit" className="mt-4"><Plus size={16} />List meal</Button>
          </form>
          <form onSubmit={addDonation} className={card}>
            <h2 className="mb-4 font-display text-lg font-bold">Donate leftover food</h2>
            <div className="grid gap-3">
              <label className="text-sm font-semibold">Organisation<select aria-label="Organisation" className={input} value={don.orgId} onChange={(e) => setDon({ ...don, orgId: e.target.value })}>{ORGS.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.type})</option>)}</select></label>
              <label className="text-sm font-semibold">Food item<input aria-label="Donation item" className={input} value={don.item} onChange={(e) => setDon({ ...don, item: e.target.value })} placeholder="e.g. Dal, rice & sabzi" /></label>
              <label className="text-sm font-semibold">Portions<input aria-label="Portions" type="number" className={input} value={don.portions} onChange={(e) => setDon({ ...don, portions: e.target.value })} /></label>
            </div>
            <Button type="submit" className="mt-4"><Truck size={16} />Schedule pickup</Button>
          </form>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={card}>
          <h2 className="mb-4 font-display text-lg font-bold">Partner organisations</h2>
          {ORGS.map((o) => <div key={o.id} className="flex items-center justify-between gap-3 border-b py-3 last:border-0"><div><p className="font-semibold">{o.name}</p><p className="text-xs text-muted-foreground">{o.type} · {o.area} · up to {o.capacity} portions</p></div><a href={`tel:${o.phone}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary"><Phone size={14} />Call</a></div>)}
        </div>
        <div className={card}>
          <h2 className="mb-4 font-display text-lg font-bold">{role === "owner" ? "Donation log" : "Food donated by your mess"}</h2>
          {donations.map((d) => { const org = ORGS.find((o) => o.id === d.orgId); return (
            <div key={d.id} className="flex items-center justify-between gap-3 border-b py-3 last:border-0">
              <div><p className="font-semibold">{d.portions} portions · {d.item}</p><p className="text-xs text-muted-foreground">{org?.name} · {d.date}</p></div>
              {role === "owner" && d.status === "Scheduled" ? <Button size="sm" variant="outline" onClick={() => { setDonations(donations.map((x) => (x.id === d.id ? { ...x, status: "Picked up" } : x))); notify("Marked as picked up"); }}>Mark picked up</Button>
                : <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", d.status === "Picked up" ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}>{d.status}</span>}
            </div>); })}
          {role === "owner" && bookings.length > 0 && <><h3 className="mb-2 mt-5 flex items-center gap-2 text-sm font-bold"><Users size={15} />Student reservations</h3>{bookings.map((b) => <p key={b.id} className="border-b py-2 text-sm last:border-0">{b.name} ({b.roll}) · {b.qty} plate(s) · {offers.find((o) => o.id === b.offerId)?.item ?? "removed offer"}</p>)}</>}
        </div>
      </div>

      {reserve && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" onClick={() => setReserve(null)}>
          <form onSubmit={confirmReserve} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl" role="dialog" aria-label="Reserve plate">
            <h2 className="font-display text-lg font-bold">Reserve: {reserve.item}</h2>
            <p className="mt-1 text-sm text-muted-foreground">₹{reserve.price} per plate · pay at the counter · {reserve.pickup}</p>
            <div className="mt-4 grid gap-3">
              <label className="text-sm font-semibold">Your name<input aria-label="Your name" className={input} value={rv.name} onChange={(e) => setRv({ ...rv, name: e.target.value })} /></label>
              <label className="text-sm font-semibold">Roll number<input aria-label="Roll number" className={input} value={rv.roll} onChange={(e) => setRv({ ...rv, roll: e.target.value })} /></label>
              <label className="text-sm font-semibold">Plates (max 2)<select className={input} value={rv.qty} onChange={(e) => setRv({ ...rv, qty: e.target.value })}><option>1</option><option>2</option></select></label>
            </div>
            <div className="mt-5 flex gap-2"><Button type="submit">Confirm reservation</Button><Button type="button" variant="outline" onClick={() => setReserve(null)}>Cancel</Button></div>
          </form>
        </div>
      )}
    </>
  );
}
