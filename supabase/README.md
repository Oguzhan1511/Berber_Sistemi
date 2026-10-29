# Village Barber / Supabase

Project: Berber_Sistemi (`jwzqiewywnachcrpqatw`).

Database tables, backend-only RPCs and the private `village-photos` bucket are provisioned. The application is configured for Supabase. Test employees and appointment records were removed after verification; a fresh setup starts with empty records.

In the ignored `.dev.vars` file, configure:

```
SUPABASE_URL=https://jwzqiewywnachcrpqatw.supabase.co
SUPABASE_SECRET_KEY=<your sb_secret_... server key>
```

Restart `npm run dev` whenever changing the key. The application uses D1/R2 while no server key is set. Once set, database and photo operations use Supabase; errors do not fall back to a different database. No browser code receives the secret key. Hosted deployments require these same server-side environment values.

Do not put secret keys in Git, browser variables or chat. Existing ChatGPT-based admin authorization remains in place. Supabase Auth has not replaced the admin login.

Tables use RLS and revoke access for `anon` and `authenticated`. Server routes authorize callers before privileged operations. The no-policy RLS advisor notices are expected for these backend-only tables. Appointment overlap is enforced by a Postgres exclusion constraint scoped to employee and date, using half-open time ranges so adjacent bookings are accepted.

Checks completed: schema creation, initial import counts, overlap rejection, private-table privileges, private bucket configuration, settings revision checks, TypeScript, availability tests and local D1/R2 regression tests. Live connection verified on 2026-10-29: settings read/write, appointment availability, eight simultaneous requests yielding one success, idempotent retries, same-time appointments for different barbers, and employee photo upload/download/save/remove. Temporary booking test records were removed.

## Appointment retention

Supabase Cron job `village-appointments-retention-14-days` runs every day at 21:00 GMT (00:00 Europe/Istanbul). It permanently removes appointment records whose appointment date is at least 14 calendar days before the current Istanbul date. November 1 records expire on November 15. The rule uses the appointment date, not creation time or appointment hour. All customer fields in the appointment row are removed. Workers continue independently of the local preview server. If execution is delayed, the next run catches all overdue rows. Existing manual local backups are not covered by this database cleanup. See `appointment-retention.sql` for the applied SQL.
