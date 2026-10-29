-- Village Barber: backend-only tables. Customer access remains through the
-- application's validated API; keys with elevated access stay server-side.
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.village_shop_settings (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0)
);

CREATE TABLE IF NOT EXISTS public.village_appointments (
  id uuid PRIMARY KEY,
  request_payload text NOT NULL,
  details jsonb NOT NULL,
  created_at bigint NOT NULL,
  booking_date text GENERATED ALWAYS AS (details->>'date') STORED NOT NULL,
  employee_id text GENERATED ALWAYS AS (details->>'employeeId') STORED NOT NULL,
  occupied_minutes int4range GENERATED ALWAYS AS (
    int4range(
      split_part(details->>'time', ':', 1)::integer * 60 + split_part(details->>'time', ':', 2)::integer,
      split_part(details->>'time', ':', 1)::integer * 60 + split_part(details->>'time', ':', 2)::integer + (details->>'minutes')::integer,
      '[)'
    )
  ) STORED NOT NULL,
  CHECK ((details->>'minutes')::integer BETWEEN 1 AND 1440),
  CHECK (booking_date ~ '^\d{4}-\d{2}-\d{2}$'),
  CHECK (details->>'time' ~ '^([01]\d|2[0-3]):[0-5]\d$'),
  CONSTRAINT village_no_overlapping_appointments EXCLUDE USING gist (
    booking_date WITH =,
    employee_id WITH =,
    occupied_minutes WITH &&
  )
);
CREATE INDEX IF NOT EXISTS village_appointments_created_at ON public.village_appointments (created_at DESC);

CREATE TABLE IF NOT EXISTS public.village_gallery_photos (
  id uuid PRIMARY KEY,
  object_key text NOT NULL UNIQUE,
  caption text NOT NULL DEFAULT '' CHECK (length(caption) <= 150),
  created_at bigint NOT NULL
);

ALTER TABLE public.village_shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_gallery_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.village_shop_settings, public.village_appointments, public.village_gallery_photos FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.village_shop_settings, public.village_appointments, public.village_gallery_photos TO service_role;

-- Photos are served through the existing application photo endpoints.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('village-photos', 'village-photos', false, 8388608, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.village_save_settings(p_payload jsonb, p_revision integer)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE changed integer;
BEGIN
  INSERT INTO public.village_shop_settings (id,payload,revision) VALUES ('village',p_payload,1)
  ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,revision=public.village_shop_settings.revision+1
  WHERE public.village_shop_settings.revision=p_revision;
  GET DIAGNOSTICS changed = ROW_COUNT;
  RETURN changed=1;
END;
$$;
REVOKE ALL ON FUNCTION public.village_save_settings(jsonb,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.village_save_settings(jsonb,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.village_add_gallery_photo(p_id uuid,p_key text,p_caption text,p_created bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  LOCK TABLE public.village_gallery_photos IN SHARE ROW EXCLUSIVE MODE;
  IF (SELECT count(*) FROM public.village_gallery_photos)>=30 THEN RETURN false; END IF;
  INSERT INTO public.village_gallery_photos(id,object_key,caption,created_at) VALUES(p_id,p_key,p_caption,p_created);
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.village_add_gallery_photo(uuid,text,text,bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.village_add_gallery_photo(uuid,text,text,bigint) TO service_role;
