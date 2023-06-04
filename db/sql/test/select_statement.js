//query to be made on the databse to get all points
let query = `SELECT jsonb_build_object(
  'type',     'FeatureCollection',
  'features', jsonb_agg(feature)
)
FROM (
  SELECT jsonb_build_object(
    'type',       'Feature',
    'geometry',   ST_AsGeoJSON(coordinates)::jsonb,
    'properties', jsonb_build_object(
        'point_name', point_name,
        'email', email,
        'description', description
    )
  ) AS feature
  FROM pointtable
) features`