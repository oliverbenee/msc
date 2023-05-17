select geometry
from public.locations
where ST_dwithin(locations.geometry, 
				 ST_GeomFromGeojson('{"type":"Point", "coordinates":[5.591549, 58.96134]}'), 
				 500)
