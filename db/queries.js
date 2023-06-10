const knexfile = require('./knexfile')
const knex = require('knex')(knexfile.development)

const knexPostgis = require('knex-postgis')
const st = knexPostgis(knex) 

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

const getMetNo = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('metdotno', 'locations.device_id', 'metdotno.device_id')
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

const getAUSensor = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('ausensor', 'locations.device_id', 'ausensor.device_id')
  .then((result) => { 
    response.status(200).json(result)
    return
  }, (error) => {
    response.status(500).json(error)
    return
  })
}

const getOpenMeteo = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('open-meteo', 'locations.device_id', 'open-meteo.device_id')
  .then((result) => { 
    response.status(200).json(result)
    return
  }, (error) => {
    response.status(500).json(error)
    return
  })
}

const getSMHI = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('smhi', 'locations.device_id', 'smhi.device_id')
  .then((result) => {
    response.status(200).json(result)
  }, (error) => {
    response.status(500).json(error)
    return
  })
}

const getOpenSenseMap = (request, response) => {
  knex('locations')
  .withSchema('public')
  .select('*', st.asGeoJSON('geometry').as('geojson'))
  .join('opensensemap', 'locations.device_id', 'opensensemap.device_id')
  .then((result) => {
    response.status(200).json(result)
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

// Deprecated.
// const createLocation = (request, response) => {
//   const coordinates = request.body.coordinates
//   // console.log(coordinates)
//   const json = JSON.parse(request.body.json)
//   const device_id = json.device_id
//   const sensor_type = json.device_type

//   knex('locations')
//   //.withSchema('public')
//   .insert({geometry: coordinates, device_type: sensor_type, device_id: device_id})
//   .onConflict("device_id", "geometry")
//   .merge({geometry: coordinates, device_type: sensor_type}) // FIXME: this merge is being ignored. Not sure why. 
//   .then(() => {
//     try {
//     if(json.sensorSource == "DMI"){
//       let obj = {device_id: device_id, time: json.time, t: json.temperature__celcius, h: json.humidity__pct, p: json.pressure__hPa, 
//         radia_glob: json.radia_glob, wind_dir: json.wind_dir, wind_speed: json.wind_speed, precip: json.precip, sun: json.sun, 
//         visibility: json.visibility, json: json.jsonmap}
//       knex('dmisensor')
//       .insert(obj)
//       .onConflict(['device_id', 'time']).merge()
//       .then(() => {/*console.log("inserted into dmisensor.")*/})
//     } else if(json.sensorSource == "SmartCitizen"){
//       let obj = {device_id: device_id, time: json.time, l: json.mDigitalAmbientLightSensor, nA: json.mI2SDigitalMemsMicrophonewithcustomAudioProcessingAlgorithm,
//         t: json.mTemperature, h: json.mHumidity, p: json.mDigitalBarometricPressureSensor, mP2: json.mParticleMatterPM2_5, mPX: json.mParticleMatterPM10,
//         mP1: json.mParticleMatterPM1, eCO2: json.mEquivalentCarbonDioxideDigitalIndoorSensor, TVOC: json.mTotalVolatileOrganicCompoundsDigitalIndoorSensor}
//       knex('smartcitizen')
//       .insert(obj)
//       .onConflict().merge()
//       .then(() => {/*console.log("inserted into smartcitizen")*/})
//     } else if(json.sensorSource == "Open Data Aarhus WiFi Routers"){
//       let obj = {device_id: device_id, city: json.city, name: json.name, zip: json.zip, street: json.street, department: json.department, houseno: json.no}
//       knex('wifilocations')
//       .insert(obj)
//       .onConflict().merge()
//       .then(() => {/*console.log("inserted into wifilocations")*/})
//     } else if(json.sensorSource == "MET.no"){
//       console.log("is met.no")
//       let obj = {device_id: device_id, time: json.time, name: json.name, municipality: json.municipality, height: json.height, t: json.temperature__celcius, 
//         h: json.humidity__pct, wind_speed: json.wind_speed, wind_dir: json.wind_dir, p: json.pressure__hPa, precip: json.precip, 
//         json: json.jsonmap}
//       knex('metdotno')
//       .insert(obj)
//       .onConflict().merge()
//       .then(() => {/*console.log("inserted into metdotno")*/})
//     } else if(json.sensorSource == "Aarhus Universitet"){
//       let obj = {device_id: device_id, time: json.time, no2: json.no2, nox: json.nox, co: json.co, so2: json.so2, mp2: json.mp2, mpx: json.mpx, json: json.jsonmap}
//       knex('ausensor')
//       .insert(obj)
//       .onConflict().merge()
//       .then(() => {/*console.log("inserted into ausensor")*/})
//     } else {
//       console.log("no sensorsource accepts ", json.sensorSource)
//     }
//     } catch (e) { console.error("failed insert", e) }
//   })
//   .then((result) => {
//     response.status(200).send("Location added!")
//     return
//   }, (error) => {
//     if(error.constraint && error.constraint == 'locations_geometry_key'){
//       response.status(400).send(error)
//     } else {
//       //console.error("failed to insert ", device_id)
//       console.error(error)
//       response.status(500).send(error)
//     }
//     return
//   })
// } 

function createLocationFromBackend(object){
  const coordinates = object.coordinates
  let json = object.json
  let device_id = json.device_id
  let sensor_type = json.device_type
  knex('locations')
  //.withSchema('public')
  .insert({geometry: coordinates, device_type: sensor_type, device_id: device_id})
  .onConflict("device_id", "geometry")
  .merge({geometry: coordinates, device_type: sensor_type}) 
  .then(() => {
    if(json.sensorSource == "DMI"){
      let obj = {device_id: device_id, time: json.time, t: json.temperature__celcius, h: json.humidity__pct, p: json.pressure__hPa, 
        radia_glob: json.radia_glob, wind_dir: json.wind_dir, wind_speed: json.wind_speed, precip: json.precip, sun: json.sun, 
        visibility: json.visibility, json: json.jsonmap}
      knex('dmisensor')
      .insert(obj)
      .onConflict(['device_id', 'time']).merge()
      .then(() => {/*console.log("inserted into dmisensor.")*/})
    } else if(json.sensorSource == "SmartCitizen"){
      let obj = {device_id: device_id, time: json.time, l: json.mDigitalAmbientLightSensor, nA: json.mI2SDigitalMemsMicrophonewithcustomAudioProcessingAlgorithm,
        t: json.mTemperature, h: json.mHumidity, p: json.mDigitalBarometricPressureSensor, mP2: json.mParticleMatterPM2_5, mPX: json.mParticleMatterPM10,
        mP1: json.mParticleMatterPM1, eCO2: json.mEquivalentCarbonDioxideDigitalIndoorSensor, TVOC: json.mTotalVolatileOrganicCompoundsDigitalIndoorSensor}
      knex('smartcitizen')
      .insert(obj)
      .onConflict(['device_id', 'time']).merge()
      .then(() => {/*console.log("inserted into smartcitizen")*/})
    } else if(json.sensorSource == "Open Data Aarhus WiFi Routers"){
      let obj = {device_id: device_id, city: json.city, name: json.name, zip: json.zip, street: json.street, department: json.department, houseno: json.no}
      knex('wifilocations')
      .insert(obj)
      .onConflict("device_id").merge()
      .then(() => {/*console.log("inserted into wifilocations")*/})
    } else if(json.sensorSource == "MET.no"){
      // console.log("is met.no")
      let obj = {device_id: device_id, name: json.name, municipality: json.municipality, height: json.height, t: json.temperature__celcius, 
        h: json.humidity__pct, wind_speed: json.wind_speed, wind_dir: json.wind_dir, p: json.pressure__hPa, precip: json.precip, 
        json: json.jsonmap}
      knex('metdotno')
      .insert(obj)
      .onConflict(['device_id', 'time']).merge()
      .then(() => {/*console.log("inserted into metdotno")*/})
    } else if(json.sensorSource == "Aarhus Universitet"){
      let obj = {device_id: device_id, time: json.time, no2: json.no2, nox: json.nox, 
        co: json.co, so2: json.so2, mP2: json.mp2, mPX: json.mpx, json: json.jsonmap}
      knex('ausensor')
      .insert(obj)
      .onConflict(['device_id', 'time']).merge(obj)
      .then(() => {/*console.log("inserted into ausensor")*/})
    } else if(json.sensorSource == "Open-Meteo"){
      // console.log("Database received object:")
      let obj = {device_id: device_id, time: json.time, t: json.temperature__celcius,
      h: json.humidity__pct, precip: json.precip, p: json.pressure__hPa, visibility: json.visibility,
      wind_speed: json.wind_speed, wind_dir: json.wind_dir }
      // console.log(obj)
      knex('open-meteo')
      .insert(obj)
      .onConflict(['device_id', 'time']).merge(obj)
      .then(() => {/*console.log("inserted into open-meteo")*/})
    } else if(json.sensorSource == "SMHI"){
      let obj = {device_id: device_id, time: json.time, t: json.t, h: json.h, p: json.p, wind_dir: json.wind_dir,
      wind_speed: json.wind_speed, radia_glob: json.radia_glob, precip:json.precip, sun: json.sun, visibility: json.visibility}
      knex('smhi')
      .insert(obj)
      .onConflict(['device_id', 'time']).merge(obj)
      .then(() => {/*console.log("inserted into smhisensor")*/})
    } else if(json.sensorSource == "OpenSenseMap"){
      let obj = {
        description: json.description, device_id: device_id, exposure: json.exposure, h: json.h, json: json, 
        l: json.l, model: json.model, name: json.name, p: json.p, precip: json.precip, t: json.t, time: json.time, 
        wind_dir: json.wind_dir, wind_speed: json.wind_speed }
      knex('opensensemap')
      .insert(obj)
      .onConflict(['device_id', 'time']).merge(obj)
      .then(() => {/*console.log("inserted into opensensemap")*/})
    } else {
      console.log("no sensorsource accepts ", json.sensorSource)
    }
  })
  .then((result) => {/*console.log("added location.")*/},
  (error) => { console.error(error) })
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
  // ----------------------------------------------------------------------------

  let q = knex('locations')
  .withSchema('public')
  
  var isDist

  for (const FL in params.fields) { // all ok.
    const element = params.fields[FL];
    if(element == "geometry"){ // force geometry into geojson format.
      q.select(st.asGeoJSON('geometry')) // https://github.com/jfgodoy/knex-postgis/blob/master/tests/functions.js
    } else if(element == "st_x"){q.select(st.x('geometry'))} // simply latitude. works.
    else if(element == "st_y"){q.select(st.y('geometry'))} // simply longitude. works.
    else if(element == "st_distance" && params.targetGeom != undefined){ //distance works. 
      q.select(st.distance('geometry', st.setSRID(st.geomFromGeoJSON(params.targetGeom.geometry), 3857)))
      isDist = true
    }
    else {q.select(element)}
  }

  for (let i=0; i<params.source.length; i++) { // all ok.
    q.leftJoin(params.source[i], `${params.source[i]}.device_id`, '=', 'locations.device_id')
  }
  //-----------------------------------------------------------------------------

  let isJsonParam = params.clause_param === "jsonsubsetof"

  if(params.clause_column && params.clause_param && params.clause_value && !isJsonParam){ // all ok.
    q.where(params.clause_column, params.clause_param, parseFloat(params.clause_value))
  } else if(isJsonParam && params.clause_value && params.clause_column){ // key and value.
    q.whereRaw(`${params.source[0]}.json->>? = ?`, [params.clause_column, JSON.parse(params.clause_value)])    
  }

  if(params.geoClause && params.targetGeom){
    switch(params.geoClause){
      case 'st_within':
        q.where(st.within("locations.geometry", st.buffer(st.setSRID(st.geomFromGeoJSON(params.targetGeom.geometry), 3857), )))
        break
      case 'st_dwithin': 
        q.where(st.dwithin("locations.geometry", st.setSRID(st.geomFromGeoJSON(params.targetGeom.geometry), 3857), parseFloat(params.searchDist)))
        break
      case '!st_dwithin':
        q.whereNot(st.dwithin("locations.geometry", st.setSRID(st.geomFromGeoJSON(params.targetGeom.geometry), 3857), parseFloat(params.searchDist)))
        break
      case "knn": // KNN works. 
        q.distinct(st.distance("locations.geometry", st.setSRID(st.geomFromGeoJSON(params.targetGeom.geometry), 3857)).as("dist"))
        isDist = true;
        break;
      default:
        console.log("real clause", params.geoClause)
    }
  }

  //-----------------------------------------------------------------------------
  if(params.orderSource && params.orderType && !isDist){  // ok.
    if(params.orderSource != "st_x" && params.orderSource != "st_y"){
      q.orderBy(`${params.source[0]}.${params.orderSource}`, `${params.orderType}`)
    } else {
      console.log("IS X OR Y")
      let orderVal
      if(params.orderSource == "st_x"){orderVal = st.x("geometry")}
      else if(params.orderSource == "st_y"){orderVal = st.y("geometry")}
      q.orderBy(orderVal, `${params.orderType}`)
    }
  }
  if(params.orderSource == 'st_distance' && isDist && params.orderType){
    q.orderBy("dist", `${params.orderType}`)
  } else {
    console.log("OS:", params.orderSource, "ID: ", isDist, "OT: ", params.orderType)
  }
  if(params.limit){q.limit(params.limit)} //ok.

  console.log("SQL.")
  console.log(q.toSQL())
  q
  .then((rows) => {
    console.log('result found, which has %d rows', rows.length)
    // console.log(rows)
    response.status(200).json(rows)
  }, (error) => {
    console.log("error.", error)
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
  getMetNo,
  getAUSensor,
  getOpenMeteo,
  getSMHI,
  getOpenSenseMap,
  getLocationById,
  getFields,
  createLocationFromBackend,
  deleteLocation,
  nukeTable
}