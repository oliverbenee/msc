'use strict';
//console.log("leafletmap script up")

// Specify map data source. Use openstreetmap! The tiles are the "map fragments" you see. 
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})

// Initialize map, set its view on top of IT-byen, and xoom in.
var map = L.map('map', {
  drawControl: true, 
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
 * MARKER LAYERS.
 */

var markers = L.markerClusterGroup({
  chunkedLoading: true,
  showCoverageOnHover: false, // this would have been nice but doesn't seem to work. 
  spiderfyOnMaxZoom: true,
  zoomToBoundsOnClick: true, 
  removeOutsideVisibleBounds: true,
  spiderLegPolylineOptions: {weight: 1.5, opacity: 0.5}
})
map.addLayer(markers) // A little cheat, that lets us ignore the layers control. 

let dmiLayer = L.layerGroup()
let cityprobe2layer = L.layerGroup()
let scklayer = L.layerGroup()
let errorlayer = L.layerGroup()
let allPointsLG = L.layerGroup()

// https://www.npmjs.com/package/leaflet-groupedlayercontrol
let overlaysObj = {
  "Sensors": {
    "DMI": dmiLayer,
    "CityProbe2": cityprobe2layer,
    "Smart Citizen Kit": scklayer,
    "Sensors with no data": errorlayer
  },
  "Tools": {
    "Clustering": markers
  }
}

let overlayOptions= {
  groupCheckboxes: true,
}

var control = L.control.groupedLayers(null, overlaysObj, overlayOptions).addTo(map);

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
  var sensorIcon = L.icon({
    iconUrl: sensor.iconUrl,
    iconSize: [16, 16], // Not sure about image sizes, but this should be fine for now. 
    iconAnchor: [8, 8], // IMAGE POSITIONING PIXEL. PLACED IN CENTER
  })
  
  // check if the marker exists. if it does, just update it, and block the dupe check from running. 
  // We have to do it like this, because js doesn't let us return out of a foreach loop.
  let isUpdated = false
  // if we find a marker at that position, update it instead of making a new one. 
  map.eachLayer((layer) => { 
    if(layer instanceof L.Marker){
      if(layer.getLatLng().distanceTo(L.latLng(lat, lng)) < 0.0000001){
        //console.log("UPDATEEEE" + sensor.sensorType + "ID: " + sensor.device_id)
        layer.bindPopup(tableHTML(lat, lng, sensor) /*"UPDATED"*/)
        isUpdated = true
      }
    } 
  })

  // Place a NEW marker. 
  if(!isUpdated){
    //console.log(`no dupe found for: ${sensor.device_id}. It is a ${sensor.device_type} from ${sensor.sensorSource}`)
    var locationMarker = L.marker([lat, lng], {icon: sensorIcon}).addTo(markers); // Note, we add the marker to a group "markers", which allows clustering to work. 
    if(sensor.device_type){
      let range = sensorFactory.getRangeMap(sensor.device_type);
      //let circle = createErrorCircle(lat, lng, range);
      //markers.addLayer(circle)
      // Pop-ups for data. 
      locationMarker.bindPopup(tableHTML(lat, lng, sensor))
      
      // for layer filtering.
      let publisher = sensorFactory.getPublisherMap(sensor.device_type)
      if(publisher == "Montem"){
        cityprobe2layer.addLayer(locationMarker)
        cityprobe2layer.addLayer(createErrorCircle(lat, lng, sensorFactory.getRangeMap(sensor.device_type)))
      }
      if(publisher == "DMI"){
        dmiLayer.addLayer(locationMarker)
        dmiLayer.addLayer(createErrorCircle(lat, lng, sensorFactory.getRangeMap(sensor.device_type)))
      }
      if(publisher == "SmartCitizen"){
        scklayer.addLayer(locationMarker)
        scklayer.addLayer(createErrorCircle(lat, lng, sensorFactory.getRangeMap(sensor.device_type)))
      }
      if(publisher == "null"){
        errorlayer.addLayer(locationMarker)
      }
    }
    // clustering tool. 
    //markers.addLayer(locationMarker)
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
  // Locations are fetched seperately from sensor data.
  const response = await fetch('/cityprobe2list')
  const locationdata = await response.json()

  const response2 = await fetch('/cityprobe2latest')
  const sensordata = await response2.json()

  // Place CityProbe2 markers.
  locationdata.forEach((item, index) => {
    var location = item.id;
    var elemToUse = sensordata["150"].filter(function(data){ return data.device_id == location})
    //console.log("For location: " + location + ", ElemToUse: " + JSON.stringify(elemToUse[0]))
    if(!elemToUse[0]){
      placeSensorDataMarker(item.latitude, item.longitude, sensorFactory.createNullSensor())
    } else {  
      var paramsForCityProbe2Sensor = jQuery.extend(elemToUse[0], item)
      var newSensor = sensorFactory.createCityProbe2Sensor(paramsForCityProbe2Sensor);
      sendPositionToDatabase(item.latitude, item.longitude, newSensor);
    }
  })
}

// Fetch DMI free data. 
async function fetchDMIData(){
    // Locations are fetched seperately from sensor data.
    const response = await fetch('/dmimetobslist')
    const dmiData = await response.json()
    const features = dmiData.features

    const response2 = await fetch('/dmimetobs')
    const dmiData2 = await response2.json()
    const features2 = dmiData2.features

    var noOfEmptyObservationStations = 0;
    features.forEach(item => {
      // Identify associated station for the location.
      var latitude = item.geometry.coordinates[1] // THIS IS LATITUDE
      var longitude = item.geometry.coordinates[0] // THIS IS LONGITUDE
      var stationId = item.properties.stationId
      var stationType = item.properties.type

      // Now find the features for that sensor in the metobs. 
      var featuresForThatSensor = features2.filter(feature => feature.properties.stationId == stationId)
      if(featuresForThatSensor.length != 0){
        var paramsForDMISensor = jQuery.extend(stationId, featuresForThatSensor)
        //console.log("----------------------------")
        //console.log("found " + featuresForThatSensor.length + " features. ")
        paramsForDMISensor.stationType = stationType
        //console.log(paramsForDMISensor)
        sendPositionToDatabase(latitude, longitude, sensorFactory.createDMIFreeDataSensor(paramsForDMISensor))
      } else { // The sensor has no data. FIXME: This may be caused because we don't fetch all values from the API. 
        //placeSensorDataMarker(latitude, longitude, sensorFactory.createNullSensor())
        noOfEmptyObservationStations++;
      }
    })
    //console.log("No of empty observation stations: ", noOfEmptyObservationStations)
}

async function fetchSCK(){
  const response = await fetch('/scklocations')
  const data = await response.json()
  
  data.forEach(item => {
    if(item.system_tags.indexOf("offline") !== -1){
      //console.log(item)
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
}

// Fetch data from the MySQL database. 
async function fetchDatabase(){
  //console.log("begin fetch database")
  const response = await fetch('/locations/dmi')
  const data = await response.json()
  addMarkersToMap(data);
  const response2 = await fetch('/locations/cityprobe2')
  const data2  = await response2.json()
  addMarkersToMap(data2);
  const response3 = await fetch('locations/sck')
  const data3 = await response3.json()
  addMarkersToMap(data3);

  function addMarkersToMap(data) {
    data.forEach(item => {
      //console.log("----------------------------------------------------");
      //console.log("geojson");
      var parsedObject = JSON.parse(item.geojson);

      //console.log("sensor json");
      let sensor = item;
      // console.log(sensor);

      sensor.ORIGIN = "database";
      sensor.iconUrl = "img/msql.png";
      let device_type = sensor.device_type
      //console.log("DT: " + device_type)
      sensor.iconUrl = sensorFactory.getIconMap(device_type)

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
fetchDatabase()

// refresh databazz every 30 seconds
let refreshTimer = 60000
setInterval(() => {
  setTimeout(() => {
    fetchCityProbe2()
    //fetchDMIData()
    fetchSCK()
  }, refreshTimer-7000)
  fetchDatabase()
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

// capture drawn data event.
map.on('draw:created', (event) => {
  var layer = event.layer
  if(layer && layer instanceof L.Circle) {
    console.log("circle at: " + layer.getBounds())
    getCircleMarkers(layer.getBounds())
  }
  // Each time we create a feature(point, line or polygon), we add this feature to the feature group wich is drawnItems in this case
  drawnItems.addLayer(layer);
});

function getCircleMarkers(bounds){
  var layers = [];
  drawnItems.eachLayer((layer)=>{
    if(layer && layer instanceof L.CircleMarkers && !(layer instanceof L.Circle)){ //only circleMarkers, exclude Circles
        if(bounds.contains(layer.getLatLng())){
        layers.push(layer)
      }
      console.log("circle")
      console.log(layer)
    }
  });
  console.log(layers)
  return layers;
}