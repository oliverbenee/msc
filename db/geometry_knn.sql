/*CREATE EXTENSION IF NOT EXISTS postgis; 
CREATE EXTENSION IF NOT EXISTS postgis_topology;
SELECT postgis_full_version();*/

/* https://www.crunchydata.com/blog/a-deep-dive-into-postgis-nearest-neighbor-search */
/*CREATE OPERATOR <-> (LEFTARG = geometry, RIGHTARG = geometry,
  PROCEDURE = geometry_distance_centroid,
  COMMUTATOR = '<->');*/

SELECT l.device_id, geometry <-> ST_MakePoint( -118.291995, 36.578581 ) AS dist
FROM locations as l
ORDER BY dist LIMIT 10


