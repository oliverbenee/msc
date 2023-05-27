const router = require('express').Router()

//////////////////
// Serve pages. //
//////////////////

router.get('/', (req, res) => {
  res.redirect('/index');
})
router.get('/index', (req, res) => {
  res.render('index', {layout: 'main'});
})
router.get('/index/:subpage', (req, res) => {
  res.send('parameter: ' + req.params.subpage + ' which is of type: ' + typeof(req.params.subpage));
})

//////////////////////
// Database access. // https://blog.logrocket.com/crud-rest-api-node-js-express-postgresql/#what-crud-api
//////////////////////

const db = require('../db/queries')
router.get('/locations/dmi', db.getDmi)
//app.get('/locations/cityprobe2', db.getCityProbe)
router.get('/locations/sck', db.getSCK)
router.get('/locations/wifi', db.getWiFi)
router.get('/locations/metno', db.getMetNo)
router.get('/locations/ausensor', db.getAUSensor)

router.get('/locations/:id', db.getLocationById)
//router.post('/locations', db.createLocation)
router.delete('/locations/:id', db.deleteLocation)
router.purge('/locations', db.nukeTable)

// Fetch data for the table
router.put('/locations', db.getFields)

/////////////////////////
// Cache API requests. //
/////////////////////////

let mcache = require('memory-cache')
// https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
// Data caching. Time is in seconds.
let cache = (duration) => { 
  //console.log("checking cache")
  return (req, res, next) => {
    let key = '__express__' + (req.originalUrll || req.url) + req.body
    let cachedbody = mcache.get(key)
    if(cachedbody) {
      res.send(cachedbody)
      //console.log("sent cached data")
      return
    } else {
      //console.log("no cache found")
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

router.get('/citylab', cache(3600), (req, res) => {
  fetch(API_URL_CITYLAB_SENSOR)
  .then((response) => response.json())
  .then((data) => res.send(data.result.records))
  .catch(error => {console.log(error)})
})

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

const API_KEY_DMI_METOBS = "03814681-8a26-4e7d-8aa6-dfac3c679f3f" 
const API_URL_DMI_METOBS_STATIONS="https://dmigw.govcloud.dk/v2/metObs/collections/station/items"
const API_URL_DMI_METOBS_COLLECTIONS = "https://dmigw.govcloud.dk/v2/metObs/collections/observation/items"

const API_KEY_DMI_OCEANOBS="7ad6421d-2820-456e-b643-9031f5d97f00"
const API_URL_DMI_OCEANOBS_STATIONS="https://dmigw.govcloud.dk/v2/oceanObs/collections/station/items"
const API_URL_DMI_OCEANOBS_COLLECTIONS = "https://dmigw.govcloud.dk/v2/oceanObs/collections/observation/items"

router.get('/dmi/list/metobs', cache(3600), (req, res) => {
  fetch(API_URL_DMI_METOBS_STATIONS + "?limit=100&status=Active&api-key=" + API_KEY_DMI_METOBS)
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

router.get('/dmi/obs/metobs', cache(3600), (req, res) => {
  fetch(API_URL_DMI_METOBS_COLLECTIONS + "?limit=100&period=latest&api-key=" + API_KEY_DMI_METOBS)
  .then((response => response.json()))
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

router.get('/dmi/list/oceanobs', cache(3600), (req, res) => {
  fetch(API_URL_DMI_OCEANOBS_STATIONS + "?limit=100&period=latest&status=Active&api-key=" + API_KEY_DMI_OCEANOBS)
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(error => {console.log(error)})
})

router.get('/dmi/obs/oceanobs', cache(3600), (req, res) => {
  fetch(API_URL_DMI_OCEANOBS_COLLECTIONS + "?period=latest&api-key=" + API_KEY_DMI_OCEANOBS)
  .then((response => response.json()))
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

///////////////////////////////////
// API Fetch Smart Citizen kits. //
///////////////////////////////////

const API_URL_SMARTCITIZEN_LOCATIONS="https://api.smartcitizen.me"

router.get('/scklocations', cache(3600), (req, res) => {
  fetch(API_URL_SMARTCITIZEN_LOCATIONS + "/devices?near=56.172592, 10.189799&distance=1000000")
  .then((response => response.json()))
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

////////////////////////////////////////////
// API Fetch opendata.dk Wi-Fi locations. //
////////////////////////////////////////////

const API_URL_WIFI_LOCATIONS=`https://admin.opendata.dk/api/3/action/datastore_search_sql?sql=SELECT * from "5a4a9d62-b17e-4a7d-a249-f6a6bf11ef62"`
router.get('/wifilocations', cache(3600), (req, res) => {
  fetch(API_URL_WIFI_LOCATIONS)
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(error => {console.log(error)});
})

///////////////////////////////////
// API Fetch jordstykker GeoJSON //
///////////////////////////////////

const API_URL_DATAFORSYNINGEN_JORDSTYKKER=`https://api.dataforsyningen.dk/jordstykker?format=geojson
&kommunekode=0751
&polygon=[[[10.230232293107784, 56.18303091786568], [10.256998318307586, 56.16888887943998], 
[10.250478389092224, 56.13351098726795], [10.21170196796946, 56.11150290519495], [10.145473213308414, 56.11877653389602], 
[10.125227117323934, 56.15321188662785], [10.145130059139174, 56.18035579663258], [10.171896084338977, 56.18627902871378], 
[10.230232293107784, 56.18303091786568]]]`
router.get('/jordstykker', cache(3600), (req, res) => {
  fetch(API_URL_DATAFORSYNINGEN_JORDSTYKKER)
  .then((response) => response.json())
  .then((featurecollection) => res.send(featurecollection))
  .catch(error => {console.log(error)})
})

///////////////////////////////////////
// API Fetch opendata.dk speedtraps. //
///////////////////////////////////////

const API_URL_SPEEDTRAPS=`https://admin.opendata.dk/api/3/action/datastore_search_sql?sql=SELECT * from "c3097987-c394-4092-ad1d-ad86a81dbf37"`
router.get('/speedtraps', cache(3600), (req, res) => {
  fetch(API_URL_SPEEDTRAPS)
  .then((response) => response.json())
  .then((data) => res.send(data.result.records))
  .catch(error => {console.log(error)})
})

///////////////////////////////////////
// API Fetch AU.dk air measurements. //
///////////////////////////////////////

let myHeaders = new fetch.Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
myHeaders.append("Origin", "https://envs2.au.dk");
myHeaders.append("Cookie", "CookieScriptConsent={action:reject,categories:^[^],key:284a4681-d2c9-45c9-b58b-a46c4fd6d999}; mitstudie-login=true; allow_cookies=true; __RequestVerificationToken_L0x1ZnRkYXRhL1ByZXNlbnRhdGlvbg2=Z35qSPoidytIPQsf4dMmnBB4s80eOT-3gffAGnotpMODHi0INdYHFUcXr6EGqa0K55w0unEHem_ATWd0pRJ-Mj5GXiftrT1wwpLrPNqI2Qo1");
const raw = "__RequestVerificationToken=8L5V1DUKuKh6JGZlcUI4whnegPbWkYedTXJS8MMuo5QenVCEjERTOIkyyMdFU7ARUpGxah0szVNdv0RyRgiQ_rd9umLLVRj2UQRryd1IUcc1";
const requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

const API_URL_AULUFTDATA = "https://envs2.au.dk/Luftdata/Presentation/table/MainTable/"
router.get('/AUluft/banegaardsgade', cache(3600), (req, res) => {
  fetch(API_URL_AULUFTDATA + "Aarhus/AARH3", requestOptions)
    .then(response => response.text())
    .then(result => res.send(result))
    .catch(error => console.log('error', error));
})
router.get('/AUluft/botaniskhave', cache(3600), (req, res) => {
  fetch(API_URL_AULUFTDATA + "Aarhus/AARH6", requestOptions)
    .then(response => response.text())
    .then(result => res.send(result))
    .catch(error => console.log('error', error));
})
router.get('/AUluft/hcandersensboulevard', cache(3600), (req, res) => {
  fetch(API_URL_AULUFTDATA + "Copenhagen/HCAB", requestOptions)
    .then(response => response.text())
    .then(result => res.send(result))
    .catch(error => console.log('error', error))
})
router.get('/AUluft/oesterbro', cache(3600), (req, res) => {
  fetch(API_URL_AULUFTDATA + "Aalborg/AALB5", requestOptions)
    .then(response => response.text())
    .then(result => res.send(result))
    .catch(error => console.log('error', error))
})
router.get('/AUluft/vesterbro', cache(3600), (req, res) => {
  fetch(API_URL_AULUFTDATA + "Aalborg/AALB4", requestOptions)
    .then(response => response.text())
    .then(result => res.send(result))
    .catch(error => console.log('error', error))
})

const API_URL_METNO_AIRQUALITYFORECAST = 'https://api.met.no/weatherapi/airqualityforecast/0.1/'
router.get('/metno/stations', cache(3600), (req, res) => {
  fetch(API_URL_METNO_AIRQUALITYFORECAST + 'stations')
    .then(response => response.json())
    .then(result => res.send(result))
    .catch(error => console.log('error', error))
})

router.get('/metno/:station', cache(3600), (req, res) => {
  let stationId = req.params.station
  fetch(API_URL_METNO_AIRQUALITYFORECAST + 'met?station=' + stationId)
    .then(response => response.json())
    .then(result => res.send(result))
    .catch(error => console.log('error', error))
})

module.exports.router = router;

// TODO: https://data.sensor.community/airrohr/v1/filter/country=DK