
SELECT *, st_asgeojson(geometry)
FROM locations 
INNER JOIN cityprobe2 ON locations.device_id = cityprobe2.device_id 
LEFT JOIN dmisensor ON locations.device_id = dmisensor.device_id
ORDER BY cityprobe2.device_id asc 

/* select * from cityprobe2 where h is null */