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

// NOTE: latitude and longitude are primary key. This prevents dupes when fetching from database.
// 1. It makes updating the API very simple (only have to write, as the old version will be overwritten)
// 2. Places with the same latitude and longitude won't work in leaflet.js anyway. 
// https://dev.mysql.com/doc/refman/8.0/en/json.html
function createTable(){
  client.query(`CREATE TABLE IF NOT EXISTS public.locations(
    id SERIAL, 
    geometry GEOGRAPHY(Point) PRIMARY KEY,
    json JSON NOT NULL)`, (err, res) => { 
      if(err) throw err
    })
  client.end
}
createTable() // just ensures, that the table will exists, so stuff doesn't break. 

const getLocations = (request, response) => {
  client.query('SELECT *, st_asgeojson(geometry) AS geojson FROM locations ORDER BY id ASC', (error, results) => {
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
  const json = request.body.json
  //console.log("c: " + coordinates + " j: " + json)

  let query = `INSERT INTO locations(geometry, json) values('${coordinates}', '${json}')`
  client.query(query, (error, results) => {
    if (error) {
      throw error
      res.send(error)
    } else {
      response.status(201).send(`Location added!`)
    }
  })
} 

// Unnecessary, since we can just write over the location. TODO: Delete. 
const updateLocation = (request, response) => {
  const id = parseInt(request.params.id)
  const json = request.body.json
  const coordinates = request.body.coordinates
 
  let query = 
  client.query(`UPDATE locations SET json = '${json}', geometry = '${coordinates}' WHERE id = '${id}'`,
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

const nukeTable = (request, response) => {
  client.query(`truncate table locations`, (error, results) => {
    if(error) {
      throw error
    }
    response.status(200).send(`Truncated all data.`)
  })
}

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  nukeTable
}
 