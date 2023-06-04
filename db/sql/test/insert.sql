INSERT INTO pointtable (point_name, email, description, coordinates)
VALUES ('TestPolygon', 'polygon@hotmail.com', 'A polygon feature', 
		ST_GeomFromText('POLYGON((-73.651829 45.453922, 
					  -73.648095 45.454072, 
					  -73.64758 45.451065, 
					  -73.6514 45.44926, 
					  -73.65449 45.451365, 
					  -73.651829 45.453922))', 4326))