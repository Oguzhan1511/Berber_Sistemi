-- Applied migration: village_appointments_retention_14_days.
-- pg_cron uses GMT on this project; 21:00 GMT is 00:00 Europe/Istanbul.
-- Use the appointment date, not created_at. An appointment on November 1
-- expires on November 15, irrespective of its scheduled hour.
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'village-appointments-retention-14-days',
  '0 21 * * *',
  $job$DELETE FROM public.village_appointments
WHERE booking_date <= to_char((CURRENT_TIMESTAMP AT TIME ZONE 'Europe/Istanbul')::date - 14, 'YYYY-MM-DD');$job$
);
