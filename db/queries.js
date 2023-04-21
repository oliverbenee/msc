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

client.connect();

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

//----------------------------------

// NOTE: latitude and longitude are primary key. This prevents dupes when fetching from database.
// 1. It makes updating the API very simple (only have to write, as the old version will be overwritten)
// 2. Places with the same latitude and longitude won't work in leaflet.js anyway. 
// https://dev.mysql.com/doc/refman/8.0/en/json.html

// Create all tables in order, otherwise you will have to restart a couple of times. 
function createTable(){
  client.query(`CREATE TABLE IF NOT EXISTS public.locations(
    geometry GEOGRAPHY(Point) UNIQUE NOT NULL,
    device_type VARCHAR,
    device_id VARCHAR PRIMARY KEY);
    
    CREATE TABLE IF NOT EXISTS public.cityprobe2(
    device_id VARCHAR UNIQUE NOT NULL,
    FOREIGN KEY (device_id) REFERENCES locations(device_id) ON DELETE CASCADE, 
    time TIMESTAMP, 
    aPS float(4), b float(5), h float(5), l float(5), mP1 float(5), mP2 float(5), mP4 float(5), mPX float(5), nA float(5), 
    nMa float(5), nMi float(5), nS float(5), nP1 float(5), nP2 float(5), nP4 float(5), nPX float(5), p float(6), t float(5));
    
    CREATE TABLE IF NOT EXISTS public.dmisensor(
    device_id VARCHAR UNIQUE NOT NULL,
    FOREIGN KEY (device_id) REFERENCES locations(device_id) ON DELETE CASCADE, 
    time TIMESTAMP, 
    t float(5), h float(5), p float(6), radia_glob float(5), wind_dir float(5), wind_speed float(5), precip float(5), sun float(5), visibility float(5),
    json JSON);
    
    CREATE TABLE IF NOT EXISTS public.smartcitizen(
      device_id VARCHAR UNIQUE NOT NULL,
      FOREIGN KEY (device_id) REFERENCES locations(device_id) ON DELETE CASCADE,
      time TIMESTAMP,
      l float(5), nA float(5), t float(5), h float(5), p float(6), mP2 float(5), mPX float(5), mP1 float(5), eCO2 float(5), TVOC float(5));

    CREATE TABLE IF NOT EXISTS public.wifilocations(
      device_id VARCHAR UNIQUE NOT NULL,
      FOREIGN KEY (device_id) REFERENCES locations(device_id) ON DELETE CASCADE,
      city VARCHAR, name VARCHAR, zip VARCHAR, street VARCHAR, department VARCHAR, houseno VARCHAR);
    `, (err, res) => {
      if(err) throw err
    })
  client.end
}
createTable()

const getDmi = (request, response) => {
  client.query('SELECT *, st_asgeojson(geometry) AS geojson FROM locations JOIN dmisensor ON locations.device_id = dmisensor.device_id ORDER BY geometry ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
  client.end
}

const getCityProbe = (request, response) => {
  client.query('SELECT *, st_asgeojson(geometry) AS geojson FROM locations JOIN cityprobe2 ON locations.device_id = cityprobe2.device_id ORDER BY geometry ASC', (error, results) => {
    if(error) {
      throw error
    }
    response.status(200).send(results.rows)
  })
  client.end
}

const getSCK = (request, response) => {
  client.query('SELECT *, st_asgeojson(geometry) AS geojson FROM locations JOIN smartcitizen ON locations.device_id = smartcitizen.device_id ORDER BY geometry ASC', (error, results) => {
    if(error){
      throw error
    }
    response.status(200).send(results.rows)
  })
  client.end
}

const getWiFi = (request, response) => {
  client.query('SELECT *, st_asgeojson(geometry) AS geojson FROM locations JOIN wifilocations ON locations.device_id = wifilocations.device_id ORDER BY geometry ASC', (error, results) => {
    if(error){
      throw error
    }
    response.status(200).send(results.rows)
  })
  client.end
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
  client.end
}

const createLocation = (request, response) => {
  const coordinates = request.body.coordinates
  // console.log(coordinates)
  const json = JSON.parse(request.body.json)
  const device_id = json.device_id
  const sensor_type = json.sensorType

  var query;

  // insert new location observation. If the geometry already exists, overwrite the JSON to the newest value. 
  // https://stackoverflow.com/questions/1109061/insert-on-duplicate-update-in-postgresql
  // https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT
  client.query(`INSERT INTO locations(geometry, device_type, device_id) values('${coordinates}', '${sensor_type}', '${device_id}') ON CONFLICT(device_id) DO UPDATE SET geometry='${coordinates}', device_type='${sensor_type}'`, (err, res) => {
    if(err && !err.message.includes("duplicate")){
      console.log("FAILED TO INSERT: " + device_id)
      response.send("failed to insert: " + device_id)
      return
    } else {
      if(json.sensorSource == "Montem"){
        query = `INSERT INTO cityprobe2(device_id, time, aPS, b, h, l, mP1, mP2, mP4, mPX, nA, nMa, nMi, nS, nP1, nP2, nP4, nPX, p, t) VALUES 
        ('${device_id}','${json.time}', '${json.avg_particle_size__mcm}', '${json.battery_level__pct}', '${json.humidity__pct}', '${json.luminosity__lx}', 
        '${json.PM1__mcgPERcm3}', '${json.PM2_5__mcgPERcm3}', '${json.PM4__mcgPERcm3}', '${json.PM10__mcgPERcm3}', '${json.average__dB_A}', 
        '${json.maximum__dB_A}', '${json.minimum__dB_A}', '${json.standarddeviation}', 
        '${json.pc_1__cm3}', '${json.pc_2_5__cm3}', '${json.pc_4__cm3}', '${json.p_conc__cm3}', '${json.pressure__hPa}', '${json.temperature__celcius}')
        ON CONFLICT(device_id) DO UPDATE SET 
        time='${json.time}', aPS='${json.avg_particle_size__mcm}', b='${json.battery_level__pct}', h='${json.humidity__pct}', l='${json.luminosity__lx}', 
        mP1='${json.PM1__mcgPERcm3}', mP2='${json.PM2_5__mcgPERcm3}', mP4='${json.PM4__mcgPERcm3}', mPX='${json.PM10__mcgPERcm3}', nA='${json.average__dB_A}', 
        nMa='${json.maximum__dB_A}', nMi='${json.minimum__dB_A}', nS='${json.standarddeviation}', 
        nP1='${json.pc_1__cm3}', nP2='${json.pc_2_5__cm3}', nP4='${json.pc_4__cm3}', nPX='${json.p_conc__cm3}', p='${json.pressure__hPa}', t='${json.temperature__celcius}'`
      } else if(json.sensorSource == "DMI"){
        query = `INSERT INTO dmisensor(device_id, time, t, h, p, radia_glob, wind_dir, wind_speed, precip, sun, visibility, json) 
        VALUES ('${device_id}', '${json.time}', '${json.temperature__celcius}', '${json.humidity__pct}', '${json.pressure__hPa}', '${json.radia_glob}', '${json.wind_dir}', '${json.wind_speed}', '${json.precip}', '${json.sun}', '${json.visibility}', '${json.jsonmap}')
        ON CONFLICT(device_id) DO UPDATE SET 
        time = '${json.time}', t = '${json.temperature__celcius}', h ='${json.humidity__pct}', p='${json.pressure__hPa}', radia_glob='${json.radia_glob}',wind_dir='${json.wind_dir}',wind_speed='${json.wind_speed}',precip='${json.precip}',sun='${json.sun}',visibility= '${json.visibility}', json='${json.jsonmap}'`    
      } else if(json.sensorSource == "SmartCitizen"){
        query = `
        INSERT INTO smartcitizen (device_id, time, l, nA, t, h, p, mP2, mPX, mP1, eCO2, TVOC) VALUES
        ('${json.device_id}', '${json.time}', ${json.mDigitalAmbientLightSensor}, ${json.mI2SDigitalMemsMicrophonewithcustomAudioProcessingAlgorithm},
        ${json.mTemperature}, ${json.mHumidity}, ${json.mDigitalBarometricPressureSensor}, ${json.mParticleMatterPM2_5}, ${json.mParticleMatterPM10},
        ${json.mParticleMatterPM1}, ${json.mEquivalentCarbonDioxideDigitalIndoorSensor}, ${json.mTotalVolatileOrganicCompoundsDigitalIndoorSensor})
        ON CONFLICT(device_id) DO UPDATE SET
        l=${json.mDigitalAmbientLightSensor}, nA=${json.mI2SDigitalMemsMicrophonewithcustomAudioProcessingAlgorithm}, t=${json.mTemperature},
        h=${json.mHumidity}, p=${json.mDigitalBarometricPressureSensor}, mP2=${json.mParticleMatterPM2_5}, mPX=${json.mParticleMatterPM10},
        mP1=${json.mParticleMatterPM1}, eCO2=${json.mEquivalentCarbonDioxideDigitalIndoorSensor}, TVOC=${json.mTotalVolatileOrganicCompoundsDigitalIndoorSensor}`
      } else if(json.sensorSource == "Open Data Aarhus WiFi Routers"){
        query = `INSERT INTO wifilocations(device_id, city, name, zip, street, department, houseno)
        VALUES ('${device_id}', '${json.city}', '${json.name}', '${json.zip}', '${json.street}', '${json.department}', '${json.no}')
        ON CONFLICT(device_id) DO UPDATE SET 
        city='${json.city}', name='${json.name}', zip='${json.zip}', street='${json.street}', department='${json.department}', houseno='${json.no}'`  
      } else {
        console.log("Unknown sensor source: " + json.sensorSource)
        query = null;
        return
      }
      if(query){
        client.query(query, (error, results) => {
          if (error) {console.log(error); response.send(error) } 
          else {
            //console.log("location added."); 
            response.status(201).send(`Location added!`)
          }
        })
      }
    }
  })
  client.end
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

  var query
  query = `SELECT ${params.fields} FROM locations`
  for(let i=0; i<params.source.length; i++){
    query += ` LEFT JOIN ${params.source[i]} ON locations.device_id = ${params.source[i]}.device_id`
  }
  if(params.clause){
    query += ` WHERE ${params.clause.replace('%3D',' =')}`
  }
  if(params.orderSource && params.orderType){ 
    query += ` ORDER BY ${params.source[0]}.${params.orderSource} ${params.orderType}`
  }
  if(params.limit){
    query += ` LIMIT ${params.limit}`
  }

  console.log(query)
  client.query(query, (error, results) => {
    if (error) {
      console.log(error)
      response.status(400).send(error)
    } else {
      response.status(200).json(results.rows) 
    }
  })
  client.end 
}

const deleteLocation = (request, response) => {
  const id = parseInt(request.params.id)

  client.query(`DELETE FROM locations WHERE id = '${id}' CASCADE`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Location deleted with ID: ${id}`)
  })
}

const nukeTable = (request, response) => {
  client.query(`truncate table locations CASCADE`, (error, results) => {
    if(error) {
      throw error
    }
    response.status(200).send(`Truncated all data.`)
  })
}

module.exports = {
  getDmi,
  //getCityProbe,
  getSCK,
  getWiFi,
  getLocationById,
  getFields,
  createLocation,
  deleteLocation,
  nukeTable
}