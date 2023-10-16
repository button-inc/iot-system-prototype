-- Verify wavdb:add_tekelek_records on pg

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM wav_schema.tekelek WHERE sensor_id IN ('1B3364', '1B3365', '2077C4', '2078C1', '29ED704', '860147041814987', '860536048877304', '862061040704024', '862315069676244', '868326028641728')) THEN 
        RAISE EXCEPTION 'Records not found'; 
    END IF; 
END $$;

