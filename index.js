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

////////////////////////////////////////
// API Fetch opendata.dk sensor data. //
////////////////////////////////////////

// https://itk-dev.github.io/datatidy/user-guide/da/tutorial/

const API_URL_CITYLAB_SENSOR="http://portal.opendata.dk/api/3/action/datastore_search?resource_id=c65b055d-a020-4871-ab51-bdbc3fd73fd8"

const fetch = require("node-fetch")

app.get('/citylab', (req, res) => {
  fetch(API_URL_CITYLAB_SENSOR)
  .then((response) => response.json())
  .then((data) => res.send(data.result.records))
  .catch(console.error());
})

//////////////////////////////////////////
// API Fetch cityflow.live sensor data. //
//////////////////////////////////////////

const API_URL_CITYPROBE2_SENSOR_LOCATION="https://api.cityflow.live/devices"
const API_URL_CITYPROBE2_SENSOR_LATEST="https://api.cityflow.live/measurements/latest"
const HEADER_CITYPROBE2_SENSORS = {
  Authorization: "Bearer " + "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTI0LCJpYXQiOjE2MTk2MzAwMzMsImV4cCI6MTkwOTcxNjQzM30.o2XZJEE9RE71Z-2z8oYLYD-9QANbi-fF1iTRvroTrx0"
};

app.get('/cityprobe2list', (req, res) => {
  fetch(API_URL_CITYPROBE2_SENSOR_LOCATION, {headers: HEADER_CITYPROBE2_SENSORS})
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(console.error());
})

app.get('/cityprobe2latest', (req, res) => {
  fetch(API_URL_CITYPROBE2_SENSOR_LATEST, {headers: HEADER_CITYPROBE2_SENSORS})
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(console.error());
})

////////////////////////////////
// API Fetch DMI sensor data. //
////////////////////////////////

const API_URL_DMI_METOBS_STATIONS="https://dmigw.govcloud.dk/v2/metObs/collections/station/items"
const API_KEY_DMI_METOBS = "03814681-8a26-4e7d-8aa6-dfac3c679f3f" 

app.get('/dmimetobslist', (req, res) => {
  fetch(API_URL_DMI_METOBS_STATIONS + "?limit=100&datetime=2023-01-01T00:00:00Z&api-key=" + API_KEY_DMI_METOBS)
  .then((response) => response.json())
  .then((data) => res.send(data))
  .catch(console.error())
})

const API_URL_DMI_METOBS_COLLECTIONS = "https://dmigw.govcloud.dk/v2/metObs/collections/observation/items"

app.get('/dmimetobs', (req, res) => {
  fetch(API_URL_DMI_METOBS_COLLECTIONS + "?limit=500&datetime=2023-01-01T00:00:00Z&api-key=" + API_KEY_DMI_METOBS)
  .then((response => response.json()))
  .then((data) => res.send(data))
  .catch(console.error())
})