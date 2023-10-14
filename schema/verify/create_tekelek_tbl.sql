-- Verify wavdb:create_tekelek_tbl on pg

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'wav_schema' 
        AND tablename = 'tekelek'
    ) THEN
        RAISE EXCEPTION 'Table wav_schema.tekelek does not exist';
    END IF;
END $$;
