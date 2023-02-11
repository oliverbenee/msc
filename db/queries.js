// https://www.youtube.com/watch?v=_n-Ai30C1qs
// https://blog.logrocket.com/crud-rest-api-node-js-express-postgresql/#what-crud-api

const { Pool } = require('pg')
// This should mimic your server settings in PostGreSQL. 
const client = new Pool({
  host: "localhost",
  user: "postgres",
  password: "g37TbukJZ",
  port: 5432,
  database: "postgres",
})

client.connect(); // connect to client. 

// -------------------------------------------

function setupPostGIS(){
  client.query(`CREATE EXTENSION IF NOT EXISTS postgis; 
  CREATE EXTENSION IF NOT EXISTS postgis_topology;
  SELECT postgis_full_version();`, (err, res) => { 
    if(err) throw err;
  })
  client.end
}
setupPostGIS()

function createTable(){
  client.query(`CREATE TABLE IF NOT EXISTS public.locations(
    id SERIAL PRIMARY KEY, 
    coordinates GEOGRAPHY(Point), 
    name CHARACTER VARYING(100))`, (err, res) => { 
      if(err) throw err
    })
  client.end
}

const getLocations = (request, response) => {
  client.query('SELECT *, st_asgeojson(coordinates) AS geojson FROM locations ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getLocationById = (request, response) => {
  const id = parseInt(request.params.id)
  let query = `SELECT *, st_asgeojson(geom) AS geojson FROM locations WHERE id = ${id}`
  client.query(query, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const createLocation = (request, response) => {
  const coordinates = request.body.coordinates
  const name = request.body.name
  console.log("c: " + coordinates + " n: " + name)

  let query = `INSERT INTO locations(coordinates, name) values('${coordinates}', '${name}')`
  client.query(query, (error, results) => {
    if (error) {
      throw error
      res.send(error)
    } else {
      response.status(201).send(`Location added!`)
    }
  })
} 

const updateLocation = (request, response) => {
  const id = parseInt(request.params.id)
  const name = request.body.name
  const coordinates = request.body.coordinates
 
  let query = 
  client.query(`UPDATE locations SET name = '${name}', coordinates = '${coordinates}' WHERE id = '${id}'`,
    (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}

const deleteLocation = (request, response) => {
  const id = parseInt(request.params.id)

  client.query(`DELETE FROM locations WHERE id = '${id}'`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Location deleted with ID: ${id}`)
  })
}

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
}
 