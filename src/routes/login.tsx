import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Store, UserRound, Utensils, Mail, Lock, ArrowRight, ShieldCheck, Smartphone, Chrome, MessageSquare } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | StudentHub" },
      { name: "description", content: "Sign in to StudentHub with Google, phone number, or email as a mess owner or a student user." },
      { property: "og:title", content: "Login | StudentHub" },
      { property: "og:description", content: "Choose your role and sign in with Google, phone, or email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

type Role = "user" | "owner";
type Method = "google" | "phone" | "email";

const roles: { id: Role; label: string; description: string; icon: typeof UserRound }[] = [
  { id: "owner", label: "Mess Owner", description: "Manage your mess, menu, attendance, and payments.", icon: Store },
  { id: "user", label: "User", description: "Student or resident — mark meals, pay bills, give feedback.", icon: UserRound },
];

const methods: { id: Method; label: string; icon: typeof Mail }[] = [
  { id: "google", label: "Google", icon: Chrome },
  { id: "phone", label: "Phone", icon: Smartphone },
  { id: "email", label: "Email", icon: Mail },
];

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const accounts: Record<Role, { email: string; phone: string }> = {
  owner: { email: "dumbledoreharry2001@gmail.com", phone: "9876543210" },
  user: { email: "student@gmail.com", phone: "9123456780" },
};

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("user");
  const [method, setMethod] = useState<Method>("google");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState("");

  const done = () => { localStorage.setItem("studenthub-role", role); navigate({ to: "/" }); };
  const roleLabel = role === "owner" ? "Mess Owner" : "User";

  const googleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid Gmail address."); return; }
    if (email.trim().toLowerCase() !== accounts[role].email) { setError(`Login failed — this Gmail is not registered as a ${roleLabel} account.`); return; }
    done();
  };

  const issueCode = () => { setCode(String(Math.floor(100000 + Math.random() * 900000))); setOtp(["", "", "", "", "", ""]); setOtpSent(true); setError(""); };
  const resetOtp = () => { setOtpSent(false); setCode(""); setOtp(["", "", "", "", "", ""]); setError(""); };

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "phone") {
      if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""))) { setError("Please enter a valid 10-digit mobile number."); return; }
      if (phone !== accounts[role].phone) { setError(`Login failed — this mobile number is not registered as a ${roleLabel} account.`); return; }
    }
    if (method === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email address."); return; }
      if (email.trim().toLowerCase() !== accounts[role].email) { setError(`Login failed — this Gmail is not registered as a ${roleLabel} account.`); return; }
    }
    issueCode();
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(d => !d)) { setError("Please enter the 6-digit code."); return; }
    if (otp.join("") !== code) { setError("Incorrect code. Please try again."); return; }
    done();
  };

  const setOtpDigit = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    setError("");
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const onOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const inputClass = "h-11 w-full rounded-md border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-3" aria-label="StudentHub home">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Utensils size={20} /></span>
          <span className="font-display text-xl font-extrabold">Student<span className="text-secondary">Hub</span></span>
        </Link>
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight">Smart mess management for your campus.</h1>
          <p className="mt-4 max-w-md text-sidebar-muted">Attendance, payments, food-waste prediction, and feedback — all in one place for students and mess owners.</p>
          <div className="mt-8 flex items-center gap-2 text-sm text-sidebar-muted"><ShieldCheck size={17} className="text-secondary" /> Trusted by 40+ campus messes</div>
        </div>
        <p className="text-xs text-sidebar-muted">© 2026 StudentHub</p>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-3 lg:hidden" aria-label="StudentHub home">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground"><Utensils size={20} /></span>
            <span className="font-display text-xl font-extrabold">Student<span className="text-secondary">Hub</span></span>
          </Link>

          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">Choose how you want to sign in.</p>

          {/* Role selection */}
          <div className="mt-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Sign in as">
            {roles.map(({ id, label, description, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={role === id}
                onClick={() => setRole(id)}
                className={cn(
                  "rounded-lg border-2 p-4 text-left transition-colors",
                  role === id ? "border-primary bg-info-soft" : "border-border bg-card hover:border-primary/40"
                )}
              >
                <span className={cn("mb-3 grid h-10 w-10 place-items-center rounded-md", role === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  <Icon size={20} />
                </span>
                <p className="font-display text-sm font-bold">{label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
              </button>
            ))}
          </div>

          {/* Sign-in method selection */}
          <div className="mt-6" role="radiogroup" aria-label="Sign-in method">
            <div className="grid grid-cols-3 gap-2 rounded-lg border bg-card p-1.5">
              {methods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  onClick={() => { setMethod(id); setError(""); }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-semibold transition-colors",
                    method === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {method === "google" && (
            <div className="mt-6 space-y-4">
              <Button type="button" variant="outline" className="h-11 w-full" onClick={googleSignIn}>
                <GoogleIcon /> Continue with Google as {roleLabel}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-secondary" /> Your Google account is used only for sign-in.
              </p>
            </div>
          )}

          {method !== "google" && !otpSent && (
            <form onSubmit={sendOtp} className="mt-6 space-y-4">
              {method === "phone" ? (
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold">Mobile number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                    <input id="phone" type="tel" inputMode="numeric" maxLength={10} value={phone}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                      placeholder="9876543210" className={inputClass + " pl-12"} />
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder={role === "owner" ? "owner@mess.com" : "student@gmail.com"} className={inputClass} />
                  </div>
                </div>
              )}
              {error && <p role="alert" className="rounded-md bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="h-11 w-full">Send code <MessageSquare size={16} /></Button>
              <p className="text-center text-xs text-muted-foreground">We'll send a 6-digit code to verify it's you.</p>
            </form>
          )}

          {method !== "google" && otpSent && (
            <form onSubmit={verifyOtp} className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Code sent to <span className="font-semibold text-foreground">{method === "phone" ? `+91 ${phone}` : email}</span>. <button type="button" onClick={resetOtp} className="font-semibold text-primary hover:underline">Change</button></p>
              <p className="rounded-md bg-info-soft px-3 py-2 text-sm">Demo code: <strong className="font-display tracking-widest text-primary">{code}</strong></p>
              <div>
                <label htmlFor="otp-0" className="mb-1.5 block text-sm font-semibold">Verification code</label>
                <div className="flex gap-2">
                  {otp.map((digit, i) => (
                    <input key={i} ref={el => { otpRefs.current[i] = el; }} id={`otp-${i}`} type="text" inputMode="numeric"
                      autoComplete="one-time-code" value={digit} onChange={e => setOtpDigit(i, e.target.value)}
                      onKeyDown={e => onOtpKeyDown(i, e)} aria-label={`Digit ${i + 1}`}
                      className="h-12 w-full rounded-md border bg-card text-center font-display text-lg font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                  ))}
                </div>
              </div>
              {error && <p role="alert" className="rounded-md bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
              <Button type="submit" className="h-11 w-full">Verify & sign in as {roleLabel} <ArrowRight size={17} /></Button>
              <button type="button" onClick={issueCode} className="w-full text-center text-sm font-semibold text-primary hover:underline">Resend code</button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to StudentHub? <Link to="/" className="font-semibold text-primary hover:underline">Explore the dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
