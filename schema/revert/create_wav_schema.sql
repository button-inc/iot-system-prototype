-- Revert wavdb:create_wav_schema from pg

BEGIN;

DROP SCHEMA wav_schema;

COMMIT;
