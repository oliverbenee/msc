select *
from locations as l
LEFT JOIN cityprobe2 on l.device_id=cityprobe2.device_id
LEFT JOIN dmisensor on l.device_id=dmisensor.device_id
LEFT JOIN smartcitizen on l.device_id=smartcitizen.device_id