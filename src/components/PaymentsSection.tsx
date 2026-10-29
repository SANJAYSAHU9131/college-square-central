import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck, CalendarDays, CircleDollarSign, Clock3, Download, IndianRupee,
  Printer, ReceiptText, WalletCards, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "user" | "owner";
type Method = "UPI" | "Card" | "Cash" | "Net Banking";

export type Receipt = {
  id: string;
  number: string;
  createdAt: string;
  studentName: string;
  studentId: string;
  messName: string;
  amount: number;
  period: string;
  method: Method;
  txnId: string;
  status: "paid";
};

const STORE = "studenthub-receipts";
const MESS_NAME = "Didi ki Rasoi";
const MESS_FEE = 3200;

const card = "rounded-lg border bg-card p-5 shadow-[0_1px_2px_color-mix(in_oklab,var(--foreground)_5%,transparent)]";
const input = "h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelCls = "mb-1.5 block text-sm font-semibold";
const th = "border-b bg-muted/60 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground";
const td = "border-b px-4 py-4 last:border-b-0";
const cardCls = "h-10 w-full rounded-md border bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function monthLabel(d: Date) { return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }); }
function fmtINR(n: number) { return `₹${n.toLocaleString("en-IN")}`; }

function loadIdentity(): { name: string; roll: string } {
  try {
    const raw = localStorage.getItem("studenthub-profile");
    if (raw) { const p = JSON.parse(raw) as { name?: string; roll?: string }; return { name: p.name?.trim() || "Nikhil Gour", roll: p.roll?.trim() || "BTMC25O1083" }; }
  } catch { /* ignore */ }
  return { name: "Nikhil Gour", roll: "BTMC25O1083" };
}

function loadReceipts(): Receipt[] {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw) as Receipt[];
  } catch { /* ignore */ }
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const before = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const seeded: Receipt[] = [
    { id: "seed-1", number: "SH-2509-0001", createdAt: new Date(last.getFullYear(), last.getMonth(), 3, 10, 24).toISOString(), studentName: "Nikhil Gour", studentId: "BTMC25O1083", messName: MESS_NAME, amount: MESS_FEE, period: monthLabel(last), method: "UPI", txnId: `TXN${Date.now() - 86400000 * 30}`, status: "paid" },
    { id: "seed-2", number: "SH-2508-0001", createdAt: new Date(before.getFullYear(), before.getMonth(), 2, 18, 5).toISOString(), studentName: "Nikhil Gour", studentId: "BTMC25O1083", messName: MESS_NAME, amount: MESS_FEE, period: monthLabel(before), method: "Cash", txnId: `TXN${Date.now() - 86400000 * 60}`, status: "paid" },
  ];
  localStorage.setItem(STORE, JSON.stringify(seeded));
  return seeded;
}

function saveReceipts(list: Receipt[]) { localStorage.setItem(STORE, JSON.stringify(list)); }

function nextNumber(list: Receipt[], createdAt: Date) {
  const seq = list.filter(r => monthKey(new Date(r.createdAt)) === monthKey(createdAt)).length + 1;
  return `SH-${String(createdAt.getFullYear()).slice(2)}${String(createdAt.getMonth() + 1).padStart(2, "0")}-${String(seq).padStart(4, "0")}`;
}

function makeReceipt(list: Receipt[], data: Omit<Receipt, "id" | "number" | "createdAt" | "txnId" | "status">): Receipt {
  const createdAt = new Date().toISOString();
  return {
    ...data,
    id: `rcpt-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
    number: nextNumber(list, new Date(createdAt)),
    createdAt,
    txnId: `TXN${Date.now()}${Math.floor(Math.random() * 90 + 10)}`,
    status: "paid",
  };
}

function receiptHtml(r: Receipt) {
  const dt = new Date(r.createdAt);
  return `<!doctype html><html><head><meta charset="utf-8"><title>Receipt ${r.number}</title>
<style>body{font-family:Georgia,'Times New Roman',serif;margin:0;background:#f4f5f7;color:#1a1d23}
.sheet{max-width:720px;margin:32px auto;background:#fff;border:1px solid #d9dce3;padding:40px}
.head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #1a7a5e;padding-bottom:18px}
.brand{font-size:24px;font-weight:800}.brand span{color:#1a7a5e}
.tag{display:inline-block;background:#1a7a5e;color:#fff;padding:6px 14px;border-radius:999px;font-size:12px;letter-spacing:2px;font-weight:700}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;margin:24px 0;font-size:14px}
.k{color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px}
.total{display:flex;justify-content:space-between;align-items:center;background:#eef7f3;border:1px solid #bfe3d4;border-radius:8px;padding:16px 20px;margin:20px 0}
.total b{font-size:26px}.foot{border-top:1px dashed #c9ccd4;margin-top:24px;padding-top:14px;font-size:11px;color:#6b7280;text-align:center}
table{width:100%;border-collapse:collapse;font-size:14px}th{text-align:left;background:#f4f5f7;padding:10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#6b7280}td{padding:10px;border-bottom:1px solid #eceef2}</style></head>
<body><div class="sheet"><div class="head">
<div><div class="brand">Student<span style="color:#1a7a5e">Hub</span></div><div style="font-size:12px;color:#6b7280">Smart Mess Management</div></div>
<div style="text-align:right"><div class="tag">PAID</div><div style="margin-top:10px;font-size:13px"><b>Receipt ${r.number}</b></div><div style="font-size:12px;color:#6b7280">${dt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div></div></div>
<div class="grid">
<div><div class="k">Received from</div><b>${r.studentName}</b><div style="font-size:12px;color:#6b7280">Roll No. ${r.studentId}</div></div>
<div><div class="k">Paid to</div><b>${r.messName}</b><div style="font-size:12px;color:#6b7280">via StudentHub</div></div>
<div><div class="k">Billing period</div>${r.period}</div>
<div><div class="k">Payment method</div>${r.method}</div>
<div><div class="k">Transaction ID</div>${r.txnId}</div>
<div><div class="k">Status</div>${r.status === "paid" ? "Paid in full" : r.status}</div></div>
<table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
<tr><td>Mess subscription — ${r.period}</td><td style="text-align:right">${fmtINR(r.amount)}</td></tr>
<tr><td style="border:none"></td><td style="border:none;text-align:right;padding-top:6px"><b>Total</b></td></tr></table>
<div class="total"><span>Total paid</span><b>${fmtINR(r.amount)}</b></div>
<div class="foot">This is a computer-generated receipt from StudentHub and does not require a signature.<br>For queries, contact the mess owner through the StudentHub app.</div></div></body></html>`;
}

function downloadReceipt(r: Receipt) {
  const blob = new Blob([receiptHtml(r)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${r.number}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function printReceipt(r: Receipt) {
  const w = window.open("", "_blank", "width=780,height=900");
  if (!w) return;
  w.document.write(receiptHtml(r));
  w.document.close();
  w.focus();
  w.print();
}

function Stat({ label, value, icon: Icon, tone = "primary" }: { label: string; value: string; icon: typeof ReceiptText; tone?: "primary" | "success" | "warning" | "secondary" }) {
  const tones = { primary: "bg-info-soft text-primary", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", secondary: "bg-accent text-secondary" };
  return <div className={card}><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">{value}</p></div><span className={cn("grid h-10 w-10 place-items-center rounded-md", tones[tone])}><Icon size={20} /></span></div></div>;
}

function ReceiptModal({ receipt, onClose, notify }: { receipt: Receipt; onClose: () => void; notify: (s: string) => void }) {
  const dt = new Date(receipt.createdAt);
  const rows: [string, string][] = [
    ["Receipt no.", receipt.number],
    ["Date & time", dt.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })],
    ["Received from", `${receipt.studentName} · ${receipt.studentId}`],
    ["Paid to", receipt.messName],
    ["Billing period", receipt.period],
    ["Payment method", receipt.method],
    ["Transaction ID", receipt.txnId],
  ];
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4" onClick={onClose}>
    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()} role="dialog" aria-label={`Receipt ${receipt.number}`}>
      <div className="mb-5 flex items-start justify-between gap-3 border-b pb-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Payment receipt</p><h2 className="mt-1 font-display text-xl font-extrabold">{receipt.number}</h2></div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close receipt"><X size={18} /></Button>
      </div>
      <div className="mb-5 grid place-items-center rounded-lg bg-success-soft py-4 text-success"><BadgeCheck size={26} /><p className="mt-1.5 text-sm font-bold uppercase tracking-widest">Paid in full</p></div>
      <dl className="space-y-3 text-sm">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-dashed pb-2 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
      </dl>
      <div className="mt-5 flex items-center justify-between rounded-lg bg-info-soft px-4 py-3"><span className="text-sm font-semibold">Total paid</span><span className="font-display text-2xl font-extrabold text-primary">{fmtINR(receipt.amount)}</span></div>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">A copy of this receipt was sent to the student and the mess owner.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button className="flex-1" onClick={() => { downloadReceipt(receipt); notify("Receipt downloaded"); }}><Download size={16} />Download</Button>
        <Button variant="outline" className="flex-1" onClick={() => printReceipt(receipt)}><Printer size={16} />Print</Button>
      </div>
    </div>
  </div>;
}

function PayModal({ amount, period, onClose, onPaid }: { amount: number; period: string; onClose: () => void; onPaid: (method: Method, amt: number) => void }) {
  const [method, setMethod] = useState<Method>("UPI");
  const [amt, setAmt] = useState(String(amount));
  const parsed = Math.max(0, Math.round(Number(amt) || 0));
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()} role="dialog" aria-label="Pay mess bill">
      <div className="mb-5 flex items-start justify-between gap-3 border-b pb-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Secure payment</p><h2 className="mt-1 font-display text-xl font-extrabold">Pay mess bill</h2></div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close payment"><X size={18} /></Button>
      </div>
      <div className="mb-5 space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Mess</span><span className="font-semibold">{MESS_NAME}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Billing period</span><span className="font-semibold">{period}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Amount payable</span><span className="font-display text-lg font-extrabold text-primary">{fmtINR(parsed)}</span></div>
      </div>
      <label className="block text-sm"><span className={labelCls}>Amount (₹)</span><input className={input} type="number" min={1} value={amt} onChange={e => setAmt(e.target.value)} /></label>
      <p className="mt-5 mb-2 text-sm font-semibold">Payment method</p>
      <div className="grid grid-cols-2 gap-2">{(["UPI", "Card", "Cash", "Net Banking"] as const).map(m =>
        <button key={m} onClick={() => setMethod(m)} className={cn("rounded-md border px-3 py-3 text-sm font-semibold transition", method === m ? "border-primary bg-info-soft text-primary" : "bg-background hover:bg-accent")}>{m}</button>)}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">A receipt is generated instantly and shared with both you and the mess owner.</p>
      <Button className="mt-5 w-full" disabled={parsed <= 0} onClick={() => onPaid(method, parsed)}><IndianRupee size={16} />Pay {fmtINR(parsed)}</Button>
    </div>
  </div>;
}

function CashModal({ onClose, onRecord }: { onClose: () => void; onRecord: (student: string, roll: string, amount: number, period: string) => void }) {
  const [student, setStudent] = useState("");
  const [roll, setRoll] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState(monthLabel(new Date()));
  const parsed = Math.round(Number(amount) || 0);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/45 p-4" onClick={onClose}>
    <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()} role="dialog" aria-label="Record cash payment">
      <div className="mb-5 flex items-start justify-between gap-3 border-b pb-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-primary">Offline collection</p><h2 className="mt-1 font-display text-xl font-extrabold">Record cash payment</h2></div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cash form"><X size={18} /></Button>
      </div>
      <div className="space-y-4">
        <label className="block text-sm"><span className={labelCls}>Student name</span><input className={input} value={student} onChange={e => setStudent(e.target.value)} placeholder="e.g. Nikhil Gour" /></label>
        <label className="block text-sm"><span className={labelCls}>Roll number</span><input className={input} value={roll} onChange={e => setRoll(e.target.value)} placeholder="e.g. BTMC25O1083" /></label>
        <label className="block text-sm"><span className={labelCls}>Amount received (₹)</span><input className={input} type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} /></label>
        <label className="block text-sm"><span className={labelCls}>Billing period</span><select className={cardCls} value={period} onChange={e => setPeriod(e.target.value)}>{[0, -1, -2].map(o => <option key={o}>{monthLabel(new Date(new Date().getFullYear(), new Date().getMonth() + o, 1))}</option>)}</select></label>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">The student gets the receipt in their Payments section instantly.</p>
      <Button className="mt-5 w-full" disabled={!student.trim() || !roll.trim() || parsed <= 0} onClick={() => onRecord(student.trim(), roll.trim(), parsed, period)}><ReceiptText size={16} />Save & issue receipt</Button>
    </div>
  </div>;
}

export function PaymentsSection({ role, notify }: { role: Role; notify: (s: string) => void }) {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [viewing, setViewing] = useState<Receipt | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const isOwner = role === "owner";

  useEffect(() => { setReceipts(loadReceipts()); }, []);
  const persist = (list: Receipt[]) => { saveReceipts(list); setReceipts(list); };

  const now = new Date();
  const period = monthLabel(now);
  const thisMonth = monthKey(now);
  const year = now.getFullYear();
  const identity = useMemo(loadIdentity, []);

  const myReceipts = useMemo(() => receipts.filter(r => r.studentId === identity.roll), [receipts, identity.roll]);
  const paidThisMonth = useMemo(() => myReceipts.filter(r => monthKey(new Date(r.createdAt)) === thisMonth).reduce((s, r) => s + r.amount, 0), [myReceipts, thisMonth]);
  const paidThisYear = useMemo(() => myReceipts.filter(r => new Date(r.createdAt).getFullYear() === year).reduce((s, r) => s + r.amount, 0), [myReceipts, year]);
  const due = Math.max(0, MESS_FEE - paidThisMonth);
  const sorted = useMemo(() => [...(isOwner ? receipts : myReceipts)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [receipts, myReceipts, isOwner]);

  const issue = (data: Omit<Receipt, "id" | "number" | "createdAt" | "txnId" | "status">) => {
    const list = loadReceipts();
    const r = makeReceipt(list, data);
    persist([...list, r]);
    setViewing(r);
    return r;
  };

  const studentPay = (method: Method, amt: number) => {
    issue({ studentName: identity.name, studentId: identity.roll, messName: MESS_NAME, amount: amt, period, method });
    setPayOpen(false);
    notify("Payment successful — receipt issued to you and the mess owner");
  };
  const ownerCash = (studentName: string, studentId: string, amount: number, p: string) => {
    issue({ studentName, studentId, messName: MESS_NAME, amount, period: p, method: "Cash" });
    setCashOpen(false);
    notify("Cash payment recorded — receipt issued to student and owner");
  };

  return <>
    {isOwner
      ? <PageHead title="Payments & Receipts" subtitle="Track collections and issue receipts for every payment you receive." eyebrow="Owner workspace" />
      : <PageHead title="Payments & Receipts" subtitle="Pay your mess bill and download receipts for every payment." eyebrow="Billing overview" />}

    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {isOwner
        ? <>
          <Stat label="Collected this month" value={fmtINR(paidThisMonth)} icon={WalletCards} tone="success" />
          <Stat label="Collected this year" value={fmtINR(paidThisYear)} icon={CircleDollarSign} />
          <Stat label="Receipts issued" value={String(receipts.length)} icon={ReceiptText} tone="secondary" />
          <Stat label="Monthly fee" value={fmtINR(MESS_FEE)} icon={IndianRupee} tone="warning" />
        </>
        : <>
          <Stat label="Current bill" value={due > 0 ? fmtINR(due) : "No dues"} icon={CircleDollarSign} tone={due > 0 ? "primary" : "success"} />
          <Stat label="Billing period" value={period} icon={CalendarDays} />
          <Stat label="Paid this month" value={fmtINR(paidThisMonth)} icon={WalletCards} tone="success" />
          <Stat label="Status" value={due > 0 ? "Pending" : "Cleared"} icon={Clock3} tone={due > 0 ? "warning" : "success"} />
        </>}
    </div>

    <div className={cn(card, "mb-6 flex flex-wrap items-center justify-between gap-4", due > 0 && !isOwner && "border-warning/40 bg-warning-soft/40")}>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isOwner ? "Offline collections" : "Current bill"}</p>
        <p className="mt-1 font-display text-xl font-extrabold">
          {isOwner ? "Collect cash from students" : due > 0 ? `${fmtINR(due)} due for ${period}` : `All clear for ${period}`}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{isOwner ? "Record offline payments and issue an instant receipt to the student." : `${MESS_NAME} · monthly fee ${fmtINR(MESS_FEE)}`}</p>
      </div>
      {isOwner
        ? <Button onClick={() => setCashOpen(true)}><ReceiptText size={17} />Record cash payment</Button>
        : <Button variant={due > 0 ? "success" : "outline"} onClick={() => setPayOpen(true)}><IndianRupee size={17} />{due > 0 ? `Pay ${fmtINR(due)}` : "Make a payment"}</Button>}
    </div>

    <div className={cn(card, "p-0")}>
      <div className="p-5 pb-0"><h2 className="mb-4 font-display text-lg font-bold">{isOwner ? "Payment receipts issued" : "Payment history"}</h2></div>
      {sorted.length === 0 ? <p className="px-5 pb-6 text-sm text-muted-foreground">No payments yet.</p> :
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr>{(isOwner ? ["Date", "Student", "Period", "Amount", "Method", "Receipt"] : ["Date", "Description", "Amount", "Method", "Receipt"]).map(h => <th className={th} key={h}>{h}</th>)}</tr></thead>
          <tbody>{sorted.map(r => <tr key={r.id}>
            <td className={td}>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
            {isOwner && <td className={td}><p className="font-semibold">{r.studentName}</p><p className="text-xs text-muted-foreground">{r.studentId}</p></td>}
            {!isOwner && <td className={td}>Mess subscription · {r.period}</td>}
            {isOwner && <td className={td}>{r.period}</td>}
            <td className={cn(td, "font-display font-bold")}>{fmtINR(r.amount)}</td>
            <td className={td}>{r.method}</td>
            <td className={td}><Button variant="outline" size="sm" onClick={() => setViewing(r)}><ReceiptText size={14} />View receipt</Button></td>
          </tr>)}</tbody></table></div>}
    </div>

    {viewing && <ReceiptModal receipt={viewing} onClose={() => setViewing(null)} notify={notify} />}
    {payOpen && <PayModal amount={due > 0 ? due : MESS_FEE} period={period} onClose={() => setPayOpen(false)} onPaid={studentPay} />}
    {cashOpen && <CashModal onClose={() => setCashOpen(false)} onRecord={ownerCash} />}
  </>;
}

function PageHead({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow?: string }) {
  return <div className="mb-7"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">{eyebrow && <><span className="h-px w-5 bg-primary" />{eyebrow}</>}</div><h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-muted-foreground sm:text-base">{subtitle}</p></div>;
}
