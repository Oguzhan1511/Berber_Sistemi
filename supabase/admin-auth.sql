CREATE TABLE IF NOT EXISTS public.village_admin_sessions (
  token_hash text PRIMARY KEY,
  username text NOT NULL,
  credential_version text NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS village_admin_sessions_expiry ON public.village_admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS public.village_login_attempts (
  key_hash text PRIMARY KEY,
  attempts integer NOT NULL,
  window_start timestamptz NOT NULL
);
ALTER TABLE public.village_admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_login_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.village_admin_sessions,public.village_login_attempts FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.village_admin_sessions,public.village_login_attempts TO service_role;
CREATE OR REPLACE FUNCTION public.village_consume_login_attempt(p_key text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE counter integer;
BEGIN
 INSERT INTO public.village_login_attempts(key_hash,attempts,window_start) VALUES(p_key,1,now())
 ON CONFLICT(key_hash) DO UPDATE SET
 attempts=CASE WHEN public.village_login_attempts.window_start <= now()-interval '15 minutes' THEN 1 ELSE public.village_login_attempts.attempts+1 END,
 window_start=CASE WHEN public.village_login_attempts.window_start <= now()-interval '15 minutes' THEN now() ELSE public.village_login_attempts.window_start END
 RETURNING attempts INTO counter;
 RETURN counter<=10;
END;
$$;
REVOKE ALL ON FUNCTION public.village_consume_login_attempt(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.village_consume_login_attempt(text) TO service_role;
SELECT cron.schedule('village-auth-cleanup','15 * * * *',$job$
DELETE FROM public.village_admin_sessions WHERE expires_at<=now();
DELETE FROM public.village_login_attempts WHERE window_start<now()-interval '1 day';
$job$);
