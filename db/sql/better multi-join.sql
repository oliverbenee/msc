select * from locations
left join cityprobe2 on locations.device_id=cityprobe2.device_id
left join dmisensor on locations.device_id=dmisensor.device_id
where cityprobe2.device_id is not null 
or dmisensor.device_id is not null