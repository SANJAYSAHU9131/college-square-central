import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => { throw redirect({ to: "/", replace: true }); },
  head: () => ({ meta: [
    { title: "Open StudentHub | Campus Workspace" },
    { name: "description", content: "Open the StudentHub campus workspace directly without signing in." },
    { property: "og:title", content: "Open StudentHub | Campus Workspace" },
    { property: "og:description", content: "Direct access to meals, attendance, and dining analytics." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
});
