# Vercel deployment

Connect the repository to a Next.js Vercel project. The root `vercel.json` selects `npm run build:vercel` and the Dublin region, near the existing Supabase project.

The local preview keeps using Vinext on port 5173. Vercel uses Next.js with the server-only Cloudflare environment compatibility module; Supabase provides all production database and storage operations.

Required Vercel server environment variables:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (encrypted/sensitive, never prefixed with `NEXT_PUBLIC_`)

Optional: `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_JWKS_URL`.

Customer URL: `/`. Barber URL: `/berber`.

The owner deferred configuring the administrator account. Therefore production `/berber` displays an inactive-login message, and admin APIs deny access, including requests with forged local authentication headers. Activating a real production sign-in flow and authorizing the barber account is required before panel access. The local preview keeps its existing mock login.

The 14-day cleanup is already scheduled in Supabase and does not depend on Vercel Cron or a running local computer.

Verified before deployment: production build, customer page, locked barber page, settings/gallery reads, denial of unauthenticated appointment listing, and availability unit tests.
