# Vercel deployment

Connect the repository to a Next.js Vercel project. The root `vercel.json` selects `npm run build:vercel` and the Dublin region, near the existing Supabase project.

The local preview keeps using Vinext on port 5173. Vercel uses Next.js with the server-only Cloudflare environment compatibility module; Supabase provides all production database and storage operations.

Required Vercel server environment variables:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (encrypted/sensitive, never prefixed with `NEXT_PUBLIC_`)

Optional: `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_JWKS_URL`.

Customer URL: `/`. Barber URL: `/berber`.

Production `/berber` presents a username/password login. Configure `BARBER_ADMIN_USERNAME` and `BARBER_ADMIN_PASSWORD_HASH` as server-only environment variables. The PBKDF2-SHA256 hash format is `pbkdf2-sha256:600000:<32-character salt>:<64-character hash>`; the salt is encoded as UTF-8 when deriving the hash. Never put the actual password or password hash in Git.

Apply `supabase/admin-auth.sql` for sessions and the persistent login attempt limiter. Sessions use cryptographically random tokens in HttpOnly, Secure, SameSite=Lax host-only cookies. Only SHA-256 token hashes are stored in the database; sessions expire after 8 hours. Logout revokes the server record. Changes to the password hash invalidate existing sessions. Production never trusts the preview's injected authentication headers.

The 14-day cleanup is already scheduled in Supabase and does not depend on Vercel Cron or a running local computer.

Verified before deployment: production build, customer page, locked barber page, settings/gallery reads, denial of unauthenticated appointment listing, and availability unit tests.
