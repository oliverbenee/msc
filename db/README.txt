So, knex.js is a bit picky with how files are to be named and stored. For the sake of reference, i will explain their functions here:

data/migrations // Code run on start of knex.js server.
///////////// 20230413091734_locations.js // Contains the setup for all tables. 
///////////////////////////////////////////////////////////////////////////////
data/seeds // Code contains "default start data" for the server
//////// locations.js // populates default data through knex.js
///////////////////////////////////////////////////////////////////////////////
sql // A variety of SQL test files. 
///////////////////////////////////////////////////////////////////////////////
knexfile.js // contains the settings to connect to PostgreSQL
queries.js // contains the "real" select queries to access database information.