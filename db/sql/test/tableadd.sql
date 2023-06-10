CREATE TABLE public.pointtable
(
    id SERIAL PRIMARY KEY,
    point_name character varying(64),
    email character varying(64),
    description character varying(100),
    coordinates geography
)