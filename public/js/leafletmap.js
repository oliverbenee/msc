'use strict';
//console.log("leafletmap script up")

// Specify map data source. Use openstreetmap! The tiles are the "map fragments" you see. 
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})

// Initialize map, set its view on top of IT-byen, and xoom in.
var map = L.map('map', {
  layers: osm, 
  center: [56.172196954673105, 10.188960985472951],
  zoom: 13
})

/*
  Geolocation
 */

// Use html5's geolocation permission to fetch user position and navigate to that place. (Stay there). 
navigator.geolocation.watchPosition(success, err);
let userPosMarker, userPosCircle, foundUser;

// Find and map user position, if we got position. 
function success(pos){
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const acc = pos.coords.accuracy;

  // Check if the value or marker already exists. 
  if(userPosMarker){
    map.removeLayer(userPosMarker);
    map.removeLayer(userPosCircle);
  }

  // Create marker on map and accuracy circle.
  userPosMarker = L.marker([lat,lng], {icon: L.icon({iconUrl: "img/location.png", iconSize: [48,48]})}).addTo(map);
  userPosCircle = L.circle([lat,lng], {radius:acc}).addTo(map);

  // Update view once user information has changed. (Only once.)
  if(!foundUser){
    map.fitBounds(userPosCircle.getBounds());
    foundUser = true;
  } 
  //map.setView([lat, lng]); // see map.flyTo
}

// Error handling of not retrieving user position. 
function err(pos){
  if(err.code === 1) { // Geolocation request denied.
    alert("please allow geolocation access thanks")
  } else {
    alert("failed to retrieve location. Code: " + err.code)
  }
}

/*
 * Geocoding
 */

//L.Control.geocoder().addTo(map);

// Format key and value for sensor into something readable. I think leaflet only accepts html strings as input?
function tableHTML(lat, lng, sensor){                                                                                         //padding order: top, right, down, left // outer border for table
  const style = "<style>thead, tbody {display: block;} tbody {max-height: 150px; overflow: auto; width: 100%; max-width: 300px; font-size: 1em; padding: 0.5em 0em 0.5em 0.5em; border: 1px solid #ddd; margin-bottom: 1em; } </style>"
  const loc = "<table><thead><tr><th>Location</th><th>(" + lat + ", " + lng + ")</th></tr></thead><tbody>"

  var tableListOutput = "<tr><td>Most recent data<br></td></tr> "
  Object.entries(sensor).forEach(([key, value]) => {
    tableListOutput += "<tr><td>" + `${key}` + "</td><td>" + `${value}` + "</td></tr>"
  })
  var tableListEnd = "</tbody></table>"

  return style+loc+tableListOutput+tableListEnd
}

/* 
 * ADDITIONAL MAP LAYERS
 */ 

var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
var SafeCast = L.tileLayer('https://s3.amazonaws.com/te512.safecast.org/{z}/{x}/{y}.png', {
	maxZoom: 16,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://blog.safecast.org/about/">SafeCast</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
let OpenWeatherMap_API_KEY ='<insert your api key here>'
var OpenWeatherMap_Clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: OpenWeatherMap_API_KEY,
	opacity: 0.5
});
var OpenWeatherMap_Pressure = L.tileLayer('http://{s}.tile.openweathermap.org/map/pressure/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: OpenWeatherMap_API_KEY,
	opacity: 0.5
});
var OpenWeatherMap_Wind = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: OpenWeatherMap_API_KEY,
	opacity: 0.5
});

// let mbapik = pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ
let basemaps = {
  "OpenStreetMap": osm,
  "CartoDB": CartoDB_Positron
};

/*
 * MARKER LAYERS.
 */

let layers = L.layerGroup(); // This is a container object to quickly scan all layers with markers.
let markers = L.layerGroup();

var markerClusterGroupingTool = L.markerClusterGroup({
  chunkedLoading: true,
  showCoverageOnHover: false, // this would have been nice but doesn't seem to work. 
  spiderfyOnMaxZoom: true,
  zoomToBoundsOnClick: true, 
  removeOutsideVisibleBounds: true,
  spiderLegPolylineOptions: {weight: 1.5, opacity: 0.5}
})
markers.addLayer(markerClusterGroupingTool) // A little cheat, that lets us ignore the layers control. 

let dmiLayer = L.layerGroup()
let cityprobe2layer = L.layerGroup()
let scklayer = L.layerGroup()
let errorlayer = L.layerGroup()
let wifilayer = L.layerGroup()

let markerlayers = [dmiLayer, cityprobe2layer, scklayer, errorlayer, wifilayer]

// https://www.npmjs.com/package/leaflet-groupedlayercontrol
let overlaysObj = {
  "Sensors": {
    "DMI": dmiLayer,
    "CityProbe2": cityprobe2layer,
    "Smart Citizen Kit": scklayer,
    "Sensors with no data": errorlayer,
    "SafeCast Radiation": SafeCast,
    "WiFi Locations": wifilayer
  },
  "Tools": {
    "Cluster markers": markers
  }
}

let overlayOptions= {
  groupCheckboxes: true,
}

var control = L.control.groupedLayers(basemaps, overlaysObj, overlayOptions).addTo(map);

/*
map.on('overlayadd', (event) => {
  if(event.name == "All Points"){
    if(!map.hasLayer(dmiLayer)){map.addLayer(dmiLayer);}
    if(!map.hasLayer(cityprobe2layer)){map.addLayer(cityprobe2layer);}
    if(!map.hasLayer(scklayer)){map.addLayer(scklayer)}
  } else if(event.name == "DMI" || "CityProbe2" || "Smart Citizen Kit"){
    map.removeLayer(markers)
  }
})
*/

// add scalebar in meter to the map
L.control.scale({metric: true}).addTo(map);

// Place a marker, and add a pop-up to it. Still useful in case there is no data!
function placeSensorDataMarker(lat, lng, sensor){
  var iconUrl = "img/msql.png";
  let device_type = sensor.device_type
  iconUrl = sensorFactory.getIconMap(device_type)
  //console.log("device type: '" + device_type + "', iconUrl: " + iconUrl)

  var sensorIcon = L.icon({
    iconUrl: iconUrl,
    iconSize: [16, 16], // Not sure about image sizes, but this should be fine for now. 
    iconAnchor: [8, 8], // IMAGE POSITIONING PIXEL. PLACED IN CENTER
  })
  
  // check if the marker exists. if it does, just update it, and block the dupe check from running. 
  // We have to do it like this, because js doesn't let us return out of a foreach loop.
  let isUpdated = false
  // if we find a marker at that position, update it instead of making a new one. 
  markerlayers.forEach((ML) => { 
    ML.eachLayer((layer) => { 
      if(layer instanceof L.Marker){
        if(layer.getLatLng().distanceTo(L.latLng(lat, lng)) < 0.0000001){
          //console.log("UPDATEEEE" + sensor.sensorType + "ID: " + sensor.device_id)
          layer.bindPopup(tableHTML(lat, lng, sensor) /*"UPDATED"*/)
          layer.sensor = sensor
          isUpdated = true
        }
      } 
    })
  })

  // Place a NEW marker. 
  if(!isUpdated){
    //console.debug(`no dupe found for: ${sensor.device_id}. It is a ${sensor.device_type} from ${sensor.sensorSource}`)
    var locationMarker = L.marker([lat, lng], {icon: sensorIcon}).addTo(markers); // Note, we add the marker to a group "markers", which allows clustering to work. 
    if(sensor.device_type){
      //let circle = createErrorCircle(lat, lng, range);
      //markers.addLayer(circle)
      // Pop-ups for data. 
      locationMarker.sensor = sensor
      locationMarker.bindPopup(tableHTML(lat, lng, sensor))
      
      // for layer filtering.
      let publisher = sensorFactory.getPublisherMap(sensor.device_type)
      if(publisher == "Montem"){
        cityprobe2layer.addLayer(locationMarker)
        cityprobe2layer.addLayer(createErrorCircle(lat, lng, sensorFactory.getRangeMap(sensor.device_type)))
      } else if(publisher == "DMI"){
        dmiLayer.addLayer(locationMarker)
        dmiLayer.addLayer(createErrorCircle(lat, lng, sensorFactory.getRangeMap(sensor.device_type)))
      } else if(publisher == "SmartCitizen"){
        scklayer.addLayer(locationMarker)
        scklayer.addLayer(createErrorCircle(lat, lng, sensorFactory.getRangeMap(sensor.device_type)))
      } else if(publisher == "Aarhus Municipality"){
        wifilayer.addLayer(locationMarker)
        wifilayer.addLayer(createErrorCircle(lat, lng, sensorFactory.getRangeMap(sensor.device_type)))
      } else if(publisher == "null"){
        errorlayer.addLayer(locationMarker)
      } else {
        console.error("no layer found for: " + publisher)
        console.error("object: " + sensor)
      }
    }
    // clustering tool. 
    layers.addLayer(locationMarker)
    markerClusterGroupingTool.addLayer(locationMarker)
  }
}

// send data to database.
function sendPositionToDatabase(lat, lng, sensor){
  // Add marker to databass.
  fetch('/locations', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "coordinates": "POINT(" + lat + " " + lng + ")", "json": JSON.stringify(sensor) })
  })
}

// Test code for sensor factory. 
import {SensorFactory} from './sensorNodeFactory.js'
const sensorFactory = new SensorFactory(); 
/*
const testsensor = sensorFactory.create({id: "This is a test", sensorType: "CityProbe2"})
placeSensorDataMarker(56.172689, 10.042084, testsensor, testsensor.iconUrl)
const testsensor2 = sensorFactory.create({device_id: "This is a test", sensorType: "CityLab"})
placeSensorDataMarker(56.1720735,10.0418602, testsensor2, testsensor2.iconUrl)
*/

/*
 * FETCH DATA FROM APIs. 
 */

// Fetch data for the CityProbe2 devices.
async function fetchCityProbe2(){
  const urls = ['/cityprobe2list', '/cityprobe2latest']
  // use map() to perform a fetch and handle the response for each url
  Promise.all(urls.map(url =>
    fetch(url)
      .then(response => response.json())
      .catch(console.error)
  ))
  .then((values) => {
    // locations
    let locationdata = values[0]
    // sensor data
    let sensordata = values[1]
    // Place CityProbe2 markers.
    locationdata.forEach((item) => {
      var location = item.id;
      var elemToUse = sensordata["150"].filter(function(data){ return data.device_id == location})
      console.debug("For location: " + location + ", ElemToUse: " + JSON.stringify(elemToUse[0]))
      if(!elemToUse[0]){
        placeSensorDataMarker(item.latitude, item.longitude, sensorFactory.createNullSensor())
      } else {  
        var paramsForCityProbe2Sensor = jQuery.extend(elemToUse[0], item)
        var newSensor = sensorFactory.createCityProbe2Sensor(paramsForCityProbe2Sensor);
        sendPositionToDatabase(item.latitude, item.longitude, newSensor);
      }
    })
  })
}

// Fetch DMI free data. 
async function fetchDMIData() {
  console.log("fetchdmi")
  const urls = ['/dmimetobslist', '/dmimetobs']
  // use map() to perform a fetch and handle the response for each url
  Promise.all(urls.map(url =>
      fetch(url)
      .then(response => response.json())
      .catch(console.error)
    ))
    .then((values) => {
      // locations
      let features = values[0].features
      console.log(features)
      // sensor data
      let features2 = values[1].features
      console.log(features2)
      var noOfEmptyObservationStations = 0;
      features.forEach(item => {
        // Identify associated station for the location.
        var latitude = item.geometry.coordinates[1] // THIS IS LATITUDE
        var longitude = item.geometry.coordinates[0] // THIS IS LONGITUDE
        var stationId = item.properties.stationId
        var stationType = item.properties.type

        // Now find the features for that sensor in the metobs. 
        var featuresForThatSensor = features2.filter(feature => feature.properties.stationId == stationId)
        if (featuresForThatSensor.length != 0) {
          var paramsForDMISensor = jQuery.extend(stationId, featuresForThatSensor)
          //console.debug("found " + featuresForThatSensor.length + " features. ")
          paramsForDMISensor.stationType = stationType
          //console.debug(paramsForDMISensor)
          sendPositionToDatabase(latitude, longitude, sensorFactory.createDMIFreeDataSensor(paramsForDMISensor))
        } else { // The sensor has no data. FIXME: This may be caused because we don't fetch all values from the API. 
          placeSensorDataMarker(latitude, longitude, sensorFactory.createNullSensor())
          noOfEmptyObservationStations++;
        }
      })
    })
  //console.log("No of empty observation stations: ", noOfEmptyObservationStations)
}

// Fetch Smart Citizen kits.
async function fetchSCK(){
  fetch('/scklocations')
  .then(response => response.json())
  .catch(console.error)
  .then((data) => {
    data.forEach((item) => {
      if(item.system_tags.indexOf("offline") !== -1){
        var latitude = item.data.location.latitude
        var longitude = item.data.location.longitude
        let sensors = new Map();
        item.data.sensors.forEach((sensor) => {
          let sensorName = sensor.unit
          let sensorValue = sensor.value
        })
       sendPositionToDatabase(latitude, longitude, sensorFactory.createSmartCitizenKitSensor(item))
      }
    })
  })
}

async function fetchWiFi(){
  fetch('/wifilocations')
  .then(response => response.json())
  .catch(console.error)
  .then((data) => {
    data.result.records.forEach(record =>{
      let latitude = record.lat
      let longitude = record.lng
      sendPositionToDatabase(latitude, longitude, sensorFactory.createWiFiRouterLocation(record))
    })
  })
}

// Fetch data from the MySQL database. 
async function fetchDatabase(){
  const response = await fetch('/locations/dmi')
  const data = await response.json()
  addMarkersToMap(data);
  const response2 = await fetch('/locations/cityprobe2')
  if(response2[0] != '<'){
    const data2  = await response2.json()
    addMarkersToMap(data2);
  } 
  const response3 = await fetch('locations/sck')
  const data3 = await response3.json()
  addMarkersToMap(data3);
  const response4 = await fetch('/locations/wifi')
  const data4 = await response4.json()
  addMarkersToMap(data4);


  function addMarkersToMap(data) {
    data.forEach(item => {
      var parsedObject = JSON.parse(item.geojson);
      let sensor = item;
      // console.debug(sensor);

      sensor.ORIGIN = "database";

      // parse geoJSON. 
      var newmarker = L.geoJSON(parsedObject, {
        coordsToLatLng: function (coords) { return new L.LatLng(coords[0], coords[1], coords[2]); },
        onEachFeature: function (feature, layer) {
          //var mysqliconextension = L.Icon.extend({ options: { iconUrl: sensor.iconUrl, iconSize: [16, 16] } });
          //mysqlicon = new mysqliconextension();
          placeSensorDataMarker(parsedObject.coordinates[0], parsedObject.coordinates[1], sensor);
          //var newMarker = L.marker([parsedObject.coordinates[0], parsedObject.coordinates[1]], {icon: mysqlicon}).addTo(map)
          //newMarker.bindPopup(tableHTML(parsedObject.coordinates[0], parsedObject.coordinates[1], sensor))
        }
      });
    });
  }
}

// refresh databazz every 30 seconds
let refreshTimer = 60000

function fetchAll(){
  try {
    setTimeout(() => {
      fetchCityProbe2()
      fetchDMIData()
      fetchSCK()
      fetchWiFi()
    }, refreshTimer - 7000)
  } catch(error) {
    console.error("failed to fetch data.")
    console.error(error)
  }
  fetchDatabase()
}
fetchAll()

setInterval(() => {
  fetchAll()
}, refreshTimer)

function createErrorCircle(lat, lng, radius){
  // error circle.
  var circle = L.circle([lat, lng], {
    color: 'yellow',
    fillcolor: '#ffc800',
    fillopacity: 90,
    radius: radius
  })
  return circle
}

/* LEAFLET DRAWING TOOLS.
 * Leaflet.js drawing tools.
 * Based on: https://tarekbagaa.medium.com/the-power-of-postgresql-with-leaflet-and-nodejs-express-e5a2a1f94611
 */

// FeatureGroup is to store editable layers
let drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

let drawControl = new L.Control.Draw({
  /*
  draw: {
    polygon: {
      allowIntersection: false,
      drawError:{
        color: 'red',
        timeout: 3000
      },
      showArea: true,
      metric: true
      
    }, 
    edit: {
      featureGroup: drawnItems
    }
  }
  */
})
map.addControl(drawControl)

// Inspired from: https://stackoverflow.com/questions/64702581/leaflet-js-draw-rectangle-and-filter-circle-markers-in-the-rectangle-and-updat
// capture drawn data event.
map.on('draw:created', (event) => {
  var layer = event.layer
  if(layer && layer instanceof L.Rectangle) { // GetBounds works like a square, so it doesn't work properly if you make polygons.
    console.debug("drawn Rectangle")
    getMarkers(layer.getBounds())
  }
  // Each time we create a feature(point, line or polygon), we add this feature to the feature group wich is drawnItems in this case
  drawnItems.addLayer(layer);
});

function getMarkers(bounds){
  console.debug("getmarkers")
  var layers = [];

    markers.eachLayer((layer) => { 
      if(layer instanceof L.Marker){
        if(bounds.contains(layer.getLatLng())){
          layers.push(layer)
        }
      } 
    })

  console.log("found the following layers: ")
  console.log(layers)

  let sensorsToTable = []
  layers.forEach((elem) => {
    console.log(elem.sensor)
    console.log("lat: " + elem._latlng.lat + ", lng: " + elem._latlng.lng)
    sensorsToTable.push(elem.sensor)
    
    //console.log(conv)
  })
  let table = document.getElementById("queryTable")
  table.innerHTML = ""
  table.appendChild(buildHtmlTable(sensorsToTable))

  return layers;
}

var _table_ = document.createElement('table'),
  _tr_ = document.createElement('tr'),
  _th_ = document.createElement('th'),
  _td_ = document.createElement('td');
_table_.className="queryTable"

// Builds the HTML Table out of myList json data from Ivy restful service.
function buildHtmlTable(arr) {
  console.debug("array: ")
  console.debug(arr)
  var table = _table_.cloneNode(false),
    columns = addAllColumnHeaders(arr, table);
  for (var i = 0, maxi = arr.length; i < maxi; ++i) {
    var tr = _tr_.cloneNode(false);
    for (var j = 0, maxj = columns.length; j < maxj; ++j) {
      var td = _td_.cloneNode(false);
      var cellValue = arr[i][columns[j]];
      td.appendChild(document.createTextNode(cellValue || ''));
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  return table;
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records
function addAllColumnHeaders(arr, table) {
  var columnSet = [],
    tr = _tr_.cloneNode(false);
  for (var i = 0, l = arr.length; i < l; i++) {
    for (var key in arr[i]) {
      if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
        columnSet.push(key);
        var th = _th_.cloneNode(false);
        th.appendChild(document.createTextNode(key));
        tr.appendChild(th);
      }
    }
  }
  table.appendChild(tr);
  return columnSet;
}