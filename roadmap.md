# StudentHub professionalization roadmap

## Current request: prediction dashboard reference upgrade
- [x] Match uploaded analytics layout with working time and meal filters, charts, and sortable performance table.
- [x] Preserve kitchen planning, attendance logging, export, and AI recommendations; verify desktop and narrow layouts.

- [ ] 1. Database schema: profiles, user_roles (owner/student), messes (seeded), menu_days (seeded 4-week menu), attendance, feedback — with GRANTs + RLS
- [ ] 2. Real auth: enable email/password + Google sign-in; rewrite login page (sign-in + sign-up with role choice)
- [ ] 3. Route guard: protect the app behind login, redirect signed-out users to /login
- [ ] 4. Wire data to the database: Discover messes, Meal Menu (owner edits persist for everyone), Attendance, Feedback
- [ ] 5. Visual polish + mobile experience pass
- [ ] 6. Verify end-to-end (typecheck, build, Playwright)
