const knexfile = require('./knexfile')
const knex = require('knex')(knexfile.development)

const knexPostgis = require('knex-postgis')
const st = knexPostgis(knex) 

// NOTE: latitude and longitude are primary key. This prevents dupes when fetching from database.
// 1. It makes updating the API very simple (only have to write, as the old version will be overwritten)
// 2. Places with the same latitude and longitude won't work in leaflet.js anyway. 
// https://dev.mysql.com/doc/refman/8.0/en/json.html

const getDmi = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('dmisensor', 'locations.device_id', 'dmisensor.device_id')
  .then((result) => { 
    response.status(200).json(result)
    return
  }, (error) => {
    response.status(500).json(error)
    return
  })
}

// const getCityProbe = (request, response) => {
//   knex('locations')
//   .withSchema('public')
//   .select('*', st.asGeoJSON('geometry').as('geojson'))
//   .join('cityprobe2', 'locations.device_id', 'cityprobe2.device_id')
//   .then((result) => { 
//     response.status(200).json(result)
//     return
//   }, (error) => {
//     response.status(500).json(err)
//     return
//   })
// }

const getSCK = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('smartcitizen', 'locations.device_id', 'smartcitizen.device_id')
  .then((result) => { 
    response.status(200).json(result)
    return
  }, (error) => {
    response.status(500).json(error)
    return
  })
}

const getWiFi = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('wifilocations', 'locations.device_id', 'wifilocations.device_id')
  .then((result) => { 
    response.status(200).json(result)
    return
  }, (error) => {
    response.status(500).json(error)
    return
  })
}

const getLocationById = (request, response) => {
  knex('locations')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('dmisensor', 'locations.device_id', 'dmisensor.device_id')
  .join('cityprobe2', 'locations.device_id', 'cityprobe2.device_id')
  .join('smartcitizen', 'locations.device_id', 'smartcitizen.device_id')
  .join('wifilocations', 'locations.device_id', 'wifilocations.device_id')
  .where('id','=', id)
  .then((result) => { 
    response.status(200).json(result)
    return
  }, (error) => {
    response.status(500).json(error)
    return
  })
}

const createLocation = (request, response) => {
  const coordinates = request.body.coordinates
  // console.log(coordinates)
  const json = JSON.parse(request.body.json)
  const device_id = json.device_id
  const sensor_type = json.sensorType

  var query;

  console.log("json:", json)

  // insert new location observation. If the geometry already exists, overwrite the JSON to the newest value. 
  // https://stackoverflow.com/questions/1109061/insert-on-duplicate-update-in-postgresql
  // https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT

  knex('locations')
  //.withSchema('public')
  .insert({geometry: coordinates, device_type: sensor_type, device_id: device_id})
  .onConflict("device_id", "geometry")
  .merge({geometry: coordinates, device_type: sensor_type}) // FIXME: this merge is being ignored. Not sure why. 
  .then(() => {
    if(json.sensorSource == "DMI"){
      console.log(json)
      knex('dmisensor')
      .insert({device_id: device_id, time: json.time, t: json.temperature__celcius, h: json.humidity__pct, p: json.pressure__hPa, 
        radia_glob: json.radia_glob, wind_dir: json.wind_dir, wind_speed: json.wind_speed, precip: json.precip, sun: json.sun, 
        visibility: json.visibility, json: json.jsonmap})
      .then(() => {console.log("inserted into dmisensor.")})
    } else if(json.sensorSource == "SmartCitizen"){
      knex('smartcitizen')
      .insert({device_id: device_id, time: json.time, l: json.mDigitalAmbientLightSensor, nA: json.mI2SDigitalMemsMicrophonewithcustomAudioProcessingAlgorithm,
      t: json.mTemperature, h: json.mHumidity, p: json.mDigitalBarometricPressureSensor, mP2: json.mParticleMatterPM2_5, mPX: json.mParticleMatterPM10,
      mP1: json.mParticleMatterPM1, eCO2: json.mEquivalentCarbonDioxideDigitalIndoorSensor, TVOC: json.mTotalVolatileOrganicCompoundsDigitalIndoorSensor})
      .then(() => {console.log("inserted into smartcitizen")})
    } else if(json.sensorSource == "Open Data Aarhus WiFi Routers"){
      knex('wifilocations')
      .insert({device_id: device_id, city: json.city, name: json.name, zip: json.zip, street: json.street, department: json.department, houseno: json.no})
      .onConflict("device_id").merge({device_id: device_id, city: json.city, name: json.name, zip: json.zip, street: json.street, department: json.department, houseno: json.no})
      .then(() => {console.log("inserted into wifilocations")})
    }
  })
  .then((result) => {
    response.status(200).send("Location added!")
    return
  }, (error) => {
    if(error.constraint && error.constraint == 'locations_geometry_key'){
      response.status(400).send(error)
    } else {
      //console.error("failed to insert ", device_id)
      console.error(error)
      response.status(500).send(error)
    }
    return
  })
} 

const getFields = (request, response) => {
  console.log("----------------------------------------------------------------")
  let params = request.body.data

  console.log("FORM:")
  console.log(params)

  // No query inserted or the form wasn't filled correctly. Basic form checking. 
  if(Object.keys(params).length === 0){
    console.log("no params")
    return response.status(400).send("no params");
  }

  var q = knex('locations')
  .withSchema('public')
  
  for (const FL in params.fields) {
    const element = params.fields[FL];
    if(element == "geometry"){ // force geometry into geojson format.
      q.select(st.asGeoJSON('geometry')) // https://github.com/jfgodoy/knex-postgis/blob/master/tests/functions.js
    } else {
      q.select(element)
    }
  }

  for (let i=0; i<params.source.length; i++) {
    q.leftJoin(params.source[i], `${params.source[i]}.device_id`, '=', 'locations.device_id')
  }
  if(params.clause){
    //q.where(params.clause.replace('%3D',' ='))
    console.log(params.clause)
  }
  if(params.orderSource && params.orderType){ 
    q.orderBy(`${params.source[0]}.${params.orderSource}`, `${params.orderType}`)
  }
  if(params.limit){
    q.limit(10)
  }

  console.log("STATEMENTS.")
  console.log(q._statements)
  console.log("SQL.")
  console.log(q.toSQL())
  q
  .then((rows) => {
    console.log("ROWS:")
    console.log(rows)
    response.status(200).json(rows)
  }, (error) => {
    response.status(500).send(error)
    return
  })

  /*
  client.query(query, (error, results) => {
    if (error) {
      console.log(error)
      response.status(400).send(error)
    } else {
      response.status(200).json(results.rows) 
    }
  })
  client.end 
  */
}

const deleteLocation = (request, response) => {
  const id = parseInt(request.params.id)
  /*

  client.query(`DELETE FROM locations WHERE id = '${id}' CASCADE`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Location deleted with ID: ${id}`)
  })
  */
}

const nukeTable = (request, response) => {
  /*
  client.query(`truncate table locations CASCADE`, (error, results) => {
    if(error) {
      throw error
    }
    response.status(200).send(`Truncated all data.`)
  })
  */
}

module.exports = {
  getDmi,
  getSCK,
  getWiFi,
  getLocationById,
  getFields,
  createLocation,
  deleteLocation,
  nukeTable
}