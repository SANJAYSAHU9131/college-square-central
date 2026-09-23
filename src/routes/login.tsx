import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Store, UserRound, Utensils, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | StudentHub" },
      { name: "description", content: "Sign in to StudentHub as a mess owner or a student user." },
      { property: "og:title", content: "Login | StudentHub" },
      { property: "og:description", content: "Choose your role and sign in to StudentHub." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

type Role = "user" | "owner";

const roles: { id: Role; label: string; description: string; icon: typeof UserRound }[] = [
  { id: "owner", label: "Mess Owner", description: "Manage your mess, menu, attendance, and payments.", icon: Store },
  { id: "user", label: "User", description: "Student or resident — mark meals, pay bills, give feedback.", icon: UserRound },
];

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("Please enter your email and password."); return; }
    navigate({ to: "/" });
  };

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

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder={role === "owner" ? "owner@mess.com" : "student@college.edu"}
                  className="h-11 w-full rounded-md border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input id="password" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-md border bg-card pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
              </div>
            </div>
            {error && <p role="alert" className="rounded-md bg-destructive-soft px-3 py-2 text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full">
              Sign in as {role === "owner" ? "Mess Owner" : "User"} <ArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to StudentHub? <Link to="/" className="font-semibold text-primary hover:underline">Explore the dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
