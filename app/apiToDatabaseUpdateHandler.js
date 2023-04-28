const db = require('../db/queries')
const path = require('path')
const router = require('./routes').router
const axios = require('axios')
axios.defaults.baseURL = 'http://localhost:3000'

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

const { SmartCitizenKitFactory, SensorOptions, WiFiRouterFactory, 
  NullSensorFactory, MetNoAirQualitySensorFactory, 
  CopenhagenMeterologySensorFactory, AarhusUniversityAirqualitySensorFactory, 
  DMIFreeDataSensorFactory } = require('./sensorNodeFactory')

let sensorOptions = new SensorOptions();
let smartCitizenKitFactory = new SmartCitizenKitFactory();
let wiFiRouterFactory = new WiFiRouterFactory();
let nullSensorFactory = new NullSensorFactory();
let metNoAirQualitySensorFactory = new MetNoAirQualitySensorFactory();
let copenhagenMeterologySensorFactory = new CopenhagenMeterologySensorFactory();
let aarhusUniversityAirqualitySensorFactory = new AarhusUniversityAirqualitySensorFactory()
let dmiFreeDataSensorFactory = new DMIFreeDataSensorFactory()

function getInsertTemplate(lat, lng, sensor){
  return {"coordinates": "POINT(" + lat + " " + lng + ")", "json": sensor}
}
// FETCH ALL API's. INSERT THE DATA INTO THE DB. 
function sendPositionToDatabase(lat, lng, sensor){
  db.createLocationFromBackend(getInsertTemplate(lat, lng, sensor))
}

function fetchDMIFreeData(urls) {
  Promise.all(urls.map(url =>
    axios.get(url)
    .then(response => {return response.data})
  ))
  .then((values) => {
    console.log("done fetching. ")
    console.log(values)
    //console.log(values)
    // locations.
    let locationFeatures = values[0].features
    // sensor data.
    let sensorFeatures = values[1].features
    var noOfEmptyObservationStations = 0;
    locationFeatures.forEach(item => {
      // Identify associated station for the location.
      var latitude = item.geometry.coordinates[1]
      var longitude = item.geometry.coordinates[0]
      var stationId = item.properties.stationId
      var stationType = item.properties.type

      // Now find the features for that sensor in the metobs. 
      var featuresForThatSensor = sensorFeatures.filter(feature => feature.properties.stationId == stationId)
      var hasFeatures = featuresForThatSensor.length != 0
      if (hasFeatures) {
        featuresForThatSensor.stationType = stationType
        console.log("params: ", featuresForThatSensor)
        sendPositionToDatabase(latitude, longitude, dmiFreeDataSensorFactory.create(featuresForThatSensor))
      }
    })
  })
  .catch((error) => { console.error("ERROR.", error)/*, error.data.features) */ })
}
async function fetchDMI() {
  console.log("begin updating dmi sensors")
  const metobsUrls = ['/dmi/list/metobs', '/dmi/obs/metobs']
  // // use map() to perform a fetch and handle the response for each url
  fetchDMIFreeData(metobsUrls);
    //console.log("No of empty observation stations: ", noOfEmptyObservationStations)
  const oceanobsUrls = ['/dmi/list/oceanobs', 'dmi/obs/oceanobs']
  fetchDMIFreeData(oceanobsUrls)
}
async function fetchSCK(){
  console.log("fetchsck")
  axios.get('/scklocations')
  .then(response => {return response.data})
  .then((list) => {
    console.log(`Found ${list.length} elements`)
    list.forEach((kit) => {
    try {
      if (kit.system_tags.indexOf("offline") !== -1) {
        var latitude = kit.data.location.latitude
        var longitude = kit.data.location.longitude
        let device = smartCitizenKitFactory.create(kit)
        sendPositionToDatabase(latitude, longitude, device)
      } else {
        console.log("Found dead sensor.")
      }
    } catch (e) { 
      console.log("skipping a sensor without data.", e) 
    }
  })
  })
  .catch((error) => console.error("ERROR.", error))
}
async function fetchWiFi(){
  axios.get('/wifilocations')
  .then(response => {return response.data})
  .then((data) => {
    data.result.records.forEach(record =>{
      let latitude = record.lat
      let longitude = record.lng
      sendPositionToDatabase(latitude, longitude, wiFiRouterFactory.create(record))
    })
  })
  .catch(error => console.error(error))
}
async function fetchMetNoAQ() {
  axios.get('/metno/stations')
  .then(values => {
    // console.log(values)
    let locationFeatures = values.data
    locationFeatures.forEach(feature => {
      let stationData = {
        device_id: feature.eoi,
        location_name: feature.name,
        height: feature.height,
        municipality: feature.kommune.name
      }

      axios.get(`/metno/${stationData.device_id}`)
      .then(response => response.json())
      .then((res) => {
        // console.log("--------------------------------")
        var finalStationData = stationData
        let observations = res.data.time[0].variables
        // console.log("observations:", observations)
        // un-nest JSON.
        try {
        for (const key in observations) {
          if (Object.hasOwnProperty.call(observations, key)) {
            const element = observations[key].value;
            finalStationData[key] = element
          }
        }
        let sensor = metNoAirQualitySensorFactory.create(finalStationData)
        sendPositionToDatabase(feature.latitude, feature.longitude, sensor)
        //console.log("lat: ", feature.latitude, "lng: ", feature.longitude, "SD:", stationData, "OB: ", sensor)
        } catch(e){console.log(e)}
      }, (error) => {
        console.warn("MET.no has no observations for station of id: ", stationData.device_id)
      }).catch((error) => console.error(error))
    })
  })
}

let AUStationLatLngs = new Map()
let AUStationdevids = new Map()
function setupAUStations() {
  // Cross-reffed using: https://envs.au.dk/faglige-omraader/luftforurening-udledninger-og-effekter/overvaagningsprogrammet/maalestationer
  // and google maps,
  // with: https://envs2.au.dk/Luftdata/Presentation/table/Aarhus/AARH3
  // this list is not exhaustive, but includes the most important ones. 
  AUStationLatLngs.set("banegaardsgade", [56.150556, 10.200833]);
  AUStationdevids.set("banegaardsgade", "AARH3"); // OK.
  AUStationLatLngs.set("botaniskhave", [56.159573, 10.193892]); // botanisk have "AARH6". CANT BE IMPROVED
  AUStationdevids.set("botaniskhave", "AARH6"); // OK.
  //AUStationLatLngs.set("AARH4", [56.159509, 10.193597]) // valdemarsgade. An old one, the one they moved to botanisk have. "AARH4"

  AUStationLatLngs.set("vesterbro", [57.052222, 9.917500]);
  AUStationdevids.set("vesterbro", "AALB4"); // OK. 
  AUStationLatLngs.set("oesterbro", [57.046667, 9.930833]);
  AUStationdevids.set("oesterbro", "AALB5"); // OK. 

  AUStationLatLngs.set("groennelykkevej", [55.397222, 10.366667]);
  AUStationdevids.set("groennelykkevej", "ODEN6"); // OK.
  AUStationLatLngs.set("raadhus", [55.396389, 10.389167]);
  AUStationdevids.set("raadhus", "ODEN2"); // OK.

  AUStationLatLngs.set("hcandersensboulevard", [55.675024, 12.569641]);
  AUStationdevids.set("hcandersensboulevard", "HCAB"); // OK. 
  AUStationLatLngs.set("hcoerstedinstitute", [55.7011638, 12.5586069]);
  AUStationdevids.set("hcoerstedinstitute", "HCØ"); // OK. 
  AUStationLatLngs.set("hvidovre", [55.631678, 12.462922]);
  AUStationdevids.set("hvidovre", "HVID"); // OK. 
  AUStationLatLngs.set("jagtvej", [55.6995582, 12.5536595]);
  AUStationdevids.set("jagtvej", "JAGT1"); // OK. 

  //------
  AUStationLatLngs.set("anholt");
  AUStationdevids.set("anholt", "ANHO");
  AUStationLatLngs.set("foellesbjerg");
  AUStationdevids.set("foellesbjerg", "FOEL");
  AUStationLatLngs.set("risoe");
  AUStationdevids.set("risoe", "RISOE");
  AUStationLatLngs.set("ulborg");
  AUStationdevids.set("ulborg", "ULBG");
}
setupAUStations();
function fetchAARH(location) {
  console.log("fetchaarh")
  axios.get('/AUluft/' + location)
    .then(string => {
      console.log("foundaarh")
      // console.log("found a place")
      let $table = $(string.data)
      var header = [];
      var rows = [];

      //console.log("TABLE", $table)
      
      // build json headers from table headers. 
      $table.find("thead th").each(function () {
        // The format is made in html "correct" for Danish typing. 
        // Convert to be usable in JSON. 
        header.push($(this).html().trim()
        .replace("Målt (starttid)", "time")
        .replace("CO","co")
        .replace("NO<sub>2</sub>", "no2")
        .replace("NO<sub>X</sub>","nox")
        .replace("PM<sub>10</sub> Teom", "mpx"));
      });
    
      // convert each row of the table body to json entries.
      $table.find("tbody tr").each(function () {
        var row = {};
        $(this).find("td").each(function (i) {
            var key = header[i]
            .replace("SO<sub>2</sub>", "so2")
            .replace("O<sub>3</sub>", "o3")
            .replace("PM<sub>2.5</sub> Teom","pm25"),
            value = $(this).html().trim().replace(",",".")
            if(key != "time"){value = parseFloat(value)}

            row[key] = value;
        });
        rows.push(row);
      });
      let LM = rows[0]
      // console.log("rows", rows)
      console.log("sending latlng: ", [AUStationLatLngs.get(location)[0], AUStationLatLngs.get(location)[1]])
      console.log("and latest: ", LM)
      sendPositionToDatabase(AUStationLatLngs.get(location)[0], AUStationLatLngs.get(location)[1], aarhusUniversityAirqualitySensorFactory.create({device_id: AUStationdevids.get(location), latest: LM}))  
    })
    .catch((error) => {console.error("fetch: " + location, error)})
}
function fetchAUSensor(){
  fetchAARH("banegaardsgade")
  fetchAARH("botaniskhave")
  fetchAARH("hcandersensboulevard")
  fetchAARH("oesterbro")
  fetchAARH("vesterbro")
}

function tableToJson(table) {
  console.log(table)
  var rows = table.rows;
  var propCells = rows[0].cells.toString();
  var propNames = [];
  var results = [];
  var obj, row, cells;

  // Use the first row for the property names
  // Could use a header section but result is the same if
  // there is only one header row
  for (var i=0, iLen=propCells.length; i<iLen; i++) {
    propNames.push(propCells[i].textContent || propCells[i].innerText);
  }

  // Use the rows for data
  // Could use tbody rows here to exclude header & footer
  // but starting from 1 gives required result
  for (var j=1, jLen=rows.length; j<jLen; j++) {
    cells = rows[j].cells;
    obj = {};

    for (var k=0; k<iLen; k++) {
      obj[propNames[k]] = cells[k].textContent || cells[k].innerText;
    }
    results.push(obj)
  }
  return results;
}

function fetchAll(){
  fetchDMI()
  fetchSCK()
  fetchWiFi()
  fetchMetNoAQ()
  fetchAUSensor()
}

setInterval(() => {
  fetchAll()
}, 60000)

// WFL works
// SCK works