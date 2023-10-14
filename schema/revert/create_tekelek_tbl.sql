-- Revert wavdb:create_tekelek_tbl from pg

BEGIN;

DROP TABLE wav_schema.tekelek;

COMMIT;
