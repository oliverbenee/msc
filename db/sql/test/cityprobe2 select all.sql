SELECT *, st_asgeojson(geometry) AS geojson FROM locations 
JOIN cityprobe2 ON locations.device_id = cityprobe2.device_id
ORDER BY geometry ASC