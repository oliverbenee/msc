//////////////////////////
// SET UP EXPRESS PAGE. //
//////////////////////////

const express = require('express')
const app = express()
const port = 3000

const exphbs = require('express-handlebars')
app.set('view engine', '.hbs')
app.engine('.hbs', exphbs.engine({
  defaultLayout: 'main',
  extname: '.hbs', // Shorten handlebars file name.
  layoutsDir: `${__dirname}/views/layouts`
}))

app.use(express.static(`${__dirname}/public`)) // serve static webpages. Use content from the public folder.

// Allows us to connect to the web server. 
app.listen(port, () => { console.log(`listening on port ${port}`) })

//////////////////////////////
// END SET UP EXPRESS PAGE. //
// BEGIN EXPRESS ROUTER.    //
//////////////////////////////

app.get('/', (req, res) => {
  res.redirect('/index');
})

app.get('/index', (req, res) => {
  res.render('index', {layout: 'main'});
})

app.get('/index/:subpage', (req, res) => {
  res.send('parameter: ' + req.params.subpage + ' which is of type: ' + typeof(req.params.subpage));
})

//////////////////////////////
// PostGreSQL database link // https://blog.logrocket.com/crud-rest-api-node-js-express-postgresql/#what-crud-api
//////////////////////////////

// Use bodyparser as a middleware for parsing requests.
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
) 

// Database queries. 
const db = require('./db/queries')
app.get('/locations/dmi', db.getDmi)
//app.get('/locations/cityprobe2', db.getCityProbe)
app.get('/locations/sck', db.getSCK)
app.get('/locations/wifi', db.getWiFi)
app.get('/locations/:id', db.getLocationById)
app.post('/locations', db.createLocation)
app.delete('/locations/:id', db.deleteLocation)
app.purge('/locations', db.nukeTable)

// Fetch data for the table
app.put('/locations', db.getFields)

var mcache = require('memory-cache')

// https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
// Data caching. Time is in seconds.
var cache = (duration) => { 
  console.log("checking cache")
  return (req, res, next) => {
    let key = '__express__' + (req.originalUrll || req.url) + req.body
    let cachedbody = mcache.get(key)
    if(cachedbody) {
      res.send(cachedbody)
      console.log("sent cached data")
      return
    } else {
      console.log("no cache found")
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration*1000)
        res.sendResponse(body)
      }
      next()
    }
  }
}

////////////////////////////////////////
// API Fetch opendata.dk sensor data. //
////////////////////////////////////////

// https://itk-dev.github.io/datatidy/user-guide/da/tutorial/

const API_URL_CITYLAB_SENSOR="http://portal.opendata.dk/api/3/action/datastore_search?resource_id=c65b055d-a020-4871-ab51-bdbc3fd73fd8"

const fetch = require("node-fetch")

app.get('/citylab', cache(3600), (req, res) => {
  fetch(API_URL_CITYLAB_SENSOR)
  .then((response) => response.json())
  .then((data) => res.send(data.result.records))
  .catch(error => {console.log(error)})
})

//////////////////////////////////////////
// API Fetch cityflow.live sensor data. //
//////////////////////////////////////////

/*
  UPDATE 18-04-2023:
  Unfortunately, it appears, that the founders of Montem A/S has shut down their business. The code here is preserved for documentation purposes. 


const API_URL_CITYPROBE2_SENSOR_LOCATION="https://api.cityflow.live/devices"
const API_URL_CITYPROBE2_SENSOR_LATEST="https://api.cityflow.live/measurements/latest"
const HEADER_CITYPROBE2_SENSORS = {
  Authorization: "Bearer " + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTI0LCJpYXQiOjE2MTk2MzAwMzMsImV4cCI6MTkwOTcxNjQzM30.o2XZJEE9RE71Z-2z8oYLYD-9QANbi-fF1iTRvroTrx0"
};

app.get('/cityprobe2list', cache(3600), (req, res) => {
  /*
  fetch(API_URL_CITYPROBE2_SENSOR_LOCATION, {headers: HEADER_CITYPROBE2_SENSORS})
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
  res(204).send("Sorry, there is no data here.")
})

app.get('/cityprobe2latest', cache(3600), (req, res) => {
  /*
  fetch(API_URL_CITYPROBE2_SENSOR_LATEST, {headers: HEADER_CITYPROBE2_SENSORS})
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
 res(204).send("Sorry, there is no data here.")
})
*/

////////////////////////////////
// API Fetch DMI sensor data. //
////////////////////////////////

const API_URL_DMI_METOBS_STATIONS="https://dmigw.govcloud.dk/v2/metObs/collections/station/items"
const API_KEY_DMI_METOBS = "03814681-8a26-4e7d-8aa6-dfac3c679f3f" 

app.get('/dmimetobslist', cache(3600), (req, res) => {
  fetch(API_URL_DMI_METOBS_STATIONS + "?limit=100&status=Active&api-key=" + API_KEY_DMI_METOBS)
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

const API_URL_DMI_METOBS_COLLECTIONS = "https://dmigw.govcloud.dk/v2/metObs/collections/observation/items"

app.get('/dmimetobs', cache(3600), (req, res) => {
  fetch(API_URL_DMI_METOBS_COLLECTIONS + "?api-key=" + API_KEY_DMI_METOBS)
  .then((response => response.json()))
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

///////////////////////////////////
// API Fetch Smart Citizen kits. //
///////////////////////////////////

const API_URL_SMARTCITIZEN_LOCATIONS="https://api.smartcitizen.me"

app.get('/scklocations', cache(3600), (req, res) => {
  fetch(API_URL_SMARTCITIZEN_LOCATIONS + "/devices?near=56.172592, 10.189799&distance=1000000")
  .then((response => response.json()))
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

////////////////////////////////////////////
// API Fetch opendata.dk Wi-Fi locations. //
////////////////////////////////////////////

const API_URL_WIFI_LOCATIONS=`https://admin.opendata.dk/api/3/action/datastore_search_sql?sql=SELECT * from "5a4a9d62-b17e-4a7d-a249-f6a6bf11ef62"`
app.get('/wifilocations', cache(3600), (req, res) => {
  fetch(API_URL_WIFI_LOCATIONS)
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

///////////////////////////////////
// API Fetch jordstykker GeoJSON //
///////////////////////////////////

const API_URL_DATAFORSYNINGEN_JORDSTYKKER=`https://api.dataforsyningen.dk/jordstykker?format=geojson&kommunekode=0751&per_side=500`
app.get('/jordstykker', cache(3600), (req, res) => {
  fetch(API_URL_DATAFORSYNINGEN_JORDSTYKKER)
  .then((response) => response.json())
  .then((featurecollection) => res.send(featurecollection))
  .catch(error => {console.log(error)})
})

///////////////////////////////////////
// API Fetch opendata.dk speedtraps. //
///////////////////////////////////////

const API_URL_SPEEDTRAPS=`https://admin.opendata.dk/api/3/action/datastore_search_sql?sql=SELECT * from "c3097987-c394-4092-ad1d-ad86a81dbf37"`
app.get('/speedtraps', cache(3600), (req, res) => {
  fetch(API_URL_SPEEDTRAPS)
  .then((response) => response.json())
  .then((data) => res.send(data.result.records))
  .catch(error => {console.log(error)})
})