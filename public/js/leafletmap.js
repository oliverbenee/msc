'use strict';
import { CityProbe2Factory, DMIFreeDataSensorFactory, SmartCitizenKitFactory, WiFiRouterFactory, NullSensorFactory, SensorOptions } from './sensorNodeFactory.js'
let sensorOptions = new SensorOptions()
let cityProbe2Factory = new CityProbe2Factory();
let dmiFreeDataSensorFactory = new DMIFreeDataSensorFactory();
let smartCitizenKitFactory = new SmartCitizenKitFactory();
let wiFiRouterFactory = new WiFiRouterFactory();
let nullSensorFactory = new NullSensorFactory();

let openStreetMapTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})

var map = L.map('map', {
  layers: openStreetMapTileLayer, 
  center: [56.172196954673105, 10.188960985472951],
  zoom: 13,
  preferCanvas: false
})

/*
  Geolocation
 */

navigator.geolocation.watchPosition(onFoundUserPosition, onFailedToFindPosition);
let userPosMarker, userPosCircle, foundUser;

function onFoundUserPosition(pos){
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const acc = pos.coords.accuracy;

  // Check if the value or marker already exists. 
  if(userPosMarker){
    map.removeLayer(userPosMarker);
    map.removeLayer(userPosCircle);
  }

  userPosMarker = L.marker([lat,lng], {icon: L.icon({iconUrl: "img/location.png", iconSize: [48,48]})}).addTo(map);
  userPosCircle = L.circle([lat,lng], {radius:acc}).addTo(map);
  userPosMarker.bindPopup("You are here!")

  // Update view once user information has changed. (Only once.)
  if(!foundUser){
    map.fitBounds(userPosCircle.getBounds());
    foundUser = true;
  } 
}

// Error handling of not retrieving user position. 
function onFailedToFindPosition(pos){
  if(onFailedToFindPosition.code === 1) { // Geolocation request denied.
    alert("please allow geolocation access thanks")
  } else {
    alert("failed to retrieve location. Code: " + onFailedToFindPosition.code)
  }
}

/*
 * Geocoding
 * https://github.com/perliedman/leaflet-control-geocoder/blob/master/demo/index.html
 * 
 * Note: not directly DAWA. Can be found here... https://github.com/kjoller/leaflet-control-geocoder-dawa/blob/new/demo/index.html
 */

var gcpoly
var geocoder = L.Control.Geocoder.nominatim();
if (typeof URLSearchParams !== 'undefined' && location.search) {
  // parse /?geocoder=nominatim from URL
  var params = new URLSearchParams(location.search);
  var geocoderString = params.get('geocoder');
  if (geocoderString && L.Control.Geocoder[geocoderString]) {
    console.log('Using geocoder', geocoderString);
    geocoder = L.Control.Geocoder[geocoderString]();
  } else if (geocoderString) {
    console.warn('Unsupported geocoder', geocoderString);
  }
}

var control = L.Control.geocoder({
  query: 'Moon',
  placeholder: 'Search here...',
  geocoder: geocoder
})
.on('markgeocode', (e) => { 
  var bbox = e.geocode.bbox;
  gcpoly = L.polygon([
    bbox.getSouthEast(),
    bbox.getNorthEast(),
    bbox.getNorthWest(),
    bbox.getSouthWest()
  ]).addTo(map)
  map.fitBounds(gcpoly.getBounds())
})
.addTo(map);

// Format key and value for sensor into something readable. I think leaflet only accepts html strings as input?
function getPopupTableHTML(lat, lng, sensor){
  const loc = `<table><thead><tr><th>(${lat},${lng})</tr></th></thead><tbody>`
  var tableListOutput;
  Object.entries(sensor).forEach(([key, value]) => {
    if(value != null){
      tableListOutput += "<tr><td>" + `${key}` + "</td><td>" + `${value}` + "</td></tr>"
    }
  })
  var tableListEnd = "</tbody></table>"

  return loc+tableListOutput+tableListEnd
}

/*
 * Add SideBar
 */

var sidebar = L.control.sidebar('sidebar', {
  position: 'left',
  autoPan: true
});
map.addControl(sidebar)

/* 
 * ADDITIONAL MAP LAYERS
 */ 

let arcGISMapTileLayer = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19
})
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
  "OpenStreetMap: Standard": openStreetMapTileLayer,
  "Positron by CartoDB: Standard": CartoDB_Positron,
  "MapServer by ArcGIS Online: Satellite": arcGISMapTileLayer
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
let matrikelkortlayer = L.layerGroup()
let trueMatLayer = L.layerGroup()
let aggMatLayer = L.layerGroup()
let speedTrapLayer = L.layerGroup()
let markerlayers = [dmiLayer, cityprobe2layer, scklayer, errorlayer, wifilayer]

// https://www.npmjs.com/package/leaflet-groupedlayercontrol
let overlaysObj = {
  "Sensors": {
    "DMI": dmiLayer,
    "CityProbe2": cityprobe2layer,
    "Smart Citizen Kit": scklayer,
    "Sensors with no data": errorlayer,
    //"SafeCast Radiation": SafeCast,
    "WiFi Locations": wifilayer,
    "Speedtraps": speedTrapLayer
  },
  "Tools": {
    "Cluster markers": markers,
    "Matrikelkort": matrikelkortlayer
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

// From: https://leafletjs.com/examples/zoom-levels/example-setzoom.html
const ZoomViewer = L.Control.extend({
  onAdd() {
    const gauge = L.DomUtil.create('div');
    gauge.style.width = '200px';
    gauge.style.background = 'rgba(255,255,255,0.5)';
    gauge.style.textAlign = 'left';
    map.on('zoomstart zoom zoomend', (ev) => {
      gauge.innerHTML = `Zoom level: ${map.getZoom()}`;
    });
    return gauge;
  }
});
const zoomViewer = (new ZoomViewer()).addTo(map);

// Place a marker, and add a pop-up to it.
function placeSensorDataMarker(lat, lng, sensor){
  var iconUrl = "img/msql.png";
  let device_type = sensor.device_type
  iconUrl = sensorOptions.getIconMap(device_type)

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
          sidebar.setContent(getPopupTableHTML(lat,lng,sensor)).show();
          //layer.bindPopup(tableHTML(lat, lng, sensor) /*"UPDATED"*/)
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
      locationMarker.on('click', () => {
        sidebar.setContent(getPopupTableHTML(lat, lng, sensor)).show()
      })
      //locationMarker.bindPopup(tableHTML(lat, lng, sensor))
      
      // for layer filtering.
      let publisher = sensorOptions.getPublisherMap(sensor.device_type)
      var layerToAddTo = errorlayer
      // switch statements are faster than if-else. 
      switch(publisher){
        case "Montem": 
          layerToAddTo = cityprobe2layer
          break
        case "DMI": 
          layerToAddTo = dmiLayer
          break
        case "SmartCitizen": 
          layerToAddTo = scklayer
          break
        case "Aarhus Municipality":
          layerToAddTo = wifilayer
          break
        default: 
          console.warn("no layer found. Will be added to the error layer.", JSON.stringify(sensor))
      }
      layerToAddTo.addLayer(locationMarker)
    }
    // clustering tool. 
    layers.addLayer(locationMarker)
    markerClusterGroupingTool.addLayer(locationMarker)
  }
}

function sendPositionToDatabase(lat, lng, sensor){
  fetch('/locations', {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ "coordinates": "POINT(" + lat + " " + lng + ")", "json": JSON.stringify(sensor) })
  })
}

/*
 * FETCH DATA FROM APIs. 
 */

function handleErrors(response) {
  if (!response.ok) {
    return Promise.reject(response)
  }
  return response;
}

// Fetch data for the CityProbe2 devices.
async function fetchCityProbe2(){
  const urls = ['/cityprobe2list', '/cityprobe2latest']
  // use map() to perform a fetch and handle the response for each url
  Promise.all(urls.map(url =>
    fetch(url)
      .then(handleErrors)
      .then(response => response.json())
      .catch((error) => console.error(error))
  ))
  .then(handleErrors)
  .then((values) => {
    let locationdata = values[0]
    let sensordata = values[1]
    // Place CityProbe2 markers.
    locationdata.forEach((item) => {
      var location = item.id;
      var elemToUse = sensordata["150"].filter(function(data){ return data.device_id == location})
      //console.debug("For location: " + location + ", ElemToUse: " + JSON.stringify(elemToUse[0]))
      if(!elemToUse[0]){
        placeSensorDataMarker(item.latitude, item.longitude, nullSensorFactory.create())
      } else {
        var paramsForCityProbe2Sensor = jQuery.extend(elemToUse[0], item)
        var newSensor = cityProbe2Factory.create(paramsForCityProbe2Sensor);
        sendPositionToDatabase(item.latitude, item.longitude, newSensor);
      }
    })
  })
  .catch((error) => console.error(error))
}

// Fetch DMI free data. 
async function fetchDMIData() {
  const urls = ['/dmimetobslist', '/dmimetobs']
  // use map() to perform a fetch and handle the response for each url
  Promise.all(urls.map(url =>
    fetch(url)
    .then(handleErrors)
    .then(response => response.json())
    ))
    .then((values) => {
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
          var paramsForDMISensor = jQuery.extend(stationId, featuresForThatSensor)
          paramsForDMISensor.stationType = stationType
          sendPositionToDatabase(latitude, longitude, dmiFreeDataSensorFactory.create(paramsForDMISensor))
        } else {
          placeSensorDataMarker(latitude, longitude, nullSensorFactory.create())
          noOfEmptyObservationStations++;
        }
      })
    })
    //console.log("No of empty observation stations: ", noOfEmptyObservationStations)
}

// Fetch Smart Citizen kits.
async function fetchSCK(){
  fetch('/scklocations')
  .then(handleErrors)
  .then(response => response.json())
  .then((kit) => {
    try {
      if (kit.system_tags.indexOf("offline") !== -1) {
        var latitude = kit.data.location.latitude
        var longitude = kit.data.location.longitude
        let sensors = new Map();
        sendPositionToDatabase(latitude, longitude, smartCitizenKitFactory.create(kit))
      } else {
        console.log("Found dead sensor: ", item.id)
      }
    } catch (e) { 
      console.log("skipping a sensor without data.", e) 
    }
  })
}

// Fetch locations of WiFi Routers. 
async function fetchWiFi(){
  fetch('/wifilocations')
  .then(handleErrors)
  .then(response => response.json())
  .then((data) => {
    data.result.records.forEach(record =>{
      let latitude = record.lat
      let longitude = record.lng
      sendPositionToDatabase(latitude, longitude, wiFiRouterFactory.create(record))
    })
  })
  .catch(error => console.error(error))
}

/*
 * MATRIKELKORTET. 
 */

// kommunekode: https://danmarksadresser.dk/adressedata/kodelister/kommunekodeliste

let defaultstyle = {
  fillOpacity: 0.3,
  weight: 1,
  fillColor: "#f59042",
  color: "#f59042",
  dashArray: '3'
}
let highlightStyle = {weight: 5,
  color: '#666',
  dashArray: '',
  fillOpacity: 0.7
}

function highlightFeature(e) {
  var layer = e.target;
  layer.setStyle(highlightStyle);
  layer.bringToFront();
  info.update(layer.feature.properties)
}
function resetHighlight(e) {
  console.info("mouseout")
  let layer = e.target
  layer.setStyle(defaultstyle)
}
function zoomToFeature(e) {
  console.info("click")
  map.fitBounds(e.target.getBounds());
  sidebar.setContent(e.target.popupContent)
}

// https://gis.stackexchange.com/questions/183725/leaflet-pop-up-does-not-work-with-geojson-data
// https://gis.stackexchange.com/questions/229723/displaying-properties-of-geojson-in-popup-on-leaflet
// https://leafletjs.com/examples/geojson/
function onEachFeature(feature, layer){
  layer.on({
    //mouseover: highlightFeature,
    //mouseout: resetHighlight,
    mouseclick: zoomToFeature
  })
  //let popupContent = `<p> ${JSON.stringify(feature.properties)}</p>`
  let popupContent = getPopupTableHTML(feature.properties.visueltcenter_x, feature.properties.visueltcenter_y, feature.properties)
}

// https://www.youtube.com/watch?v=xerlQ3tE8Ew <-- large geojson
// https://www.youtube.com/watch?v=1SGbqlo19HQ <-- other, the one you used
// style guide: https://leafletjs.com/reference.html#path-option
let vtoptions = {
  maxZoom: 16, // max zoom to preserve detail on
  tolerance: 5, // more simplification = better performance.
  style: defaultstyle,
  buffer: 3, // tile buffer, pre-rendering outside the area expected of the user to go.
  debug: 1,
  solidChildren: true,
  onEachFeature: onEachFeature // oneachfeature doesn't work on geojson.vt
}

// https://dawadocs.dataforsyningen.dk/dok/api/jordstykke#s%C3%B8gning
function fetchGeojson(){
  var startTime = performance.now()
  fetch(`https://api.dataforsyningen.dk/jordstykker?format=geojson&kommunekode=0751&polygon=[[[10.230232293107784, 56.18303091786568],
  [10.256998318307586, 56.16888887943998],
  [10.250478389092224, 56.13351098726795],
  [10.21170196796946, 56.11150290519495],
  [10.145473213308414, 56.11877653389602],
  [10.125227117323934, 56.15321188662785],
  [10.145130059139174, 56.18035579663258],
  [10.171896084338977, 56.18627902871378], [10.230232293107784, 56.18303091786568]]]`)
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    L.geoJson(data, vtoptions)
    .addTo(trueMatLayer) // makes the map run faster when zoomed out.
    L.geoJSON.vt(data, vtoptions)
    .addTo(aggMatLayer)
    // var vectorGrid = L.vectorGrid.slicer(data, {
    //   rendererFactory: L.svg.tile,
    //   vectorTileLayerStyles: {
    //     sliced: function(properties, zoom) {
    //       return {
    //         fillColor: '#800026',
    //         fillOpacity: 0.5,
    //          //fillOpacity: 1,
    //         stroke: true,
    //         fill: true,
    //         color: 'black',
    //            //opacity: 0.2,
    //         weight: 0,
    //       }
    //     }
    //   },
    //   interactive: true
    // })
    //console.log(vectorGrid)
    // vectorGrid.on('mouseover', function(e) {
    //   console.log("YES.")
    //   var properties = e.layer.properties;
    //   console.log("set up popup which fails")
    //   L.popup()
    //     .setContent("BWOAH")
    //     .setLatLng(e.latlng)
    //     .openOn(map);
    //   console.log("call clearhighlight")
    //   clearHighlight();
    //   var style = {
    //     fillColor: '#800026',
    //     fillOpacity: 0.5,
    //     stroke: true,
    //     fill: true,
    //     color: 'red',
    //     opacity: 1,
    //     weight: 2,
    //   };
    //   console.log("specified popup")
    //   vectorGrid.setFeatureStyle(properties.wb_a3, style);
    // })
  })
  .catch(error => console.error(error))
  aggMatLayer.addTo(matrikelkortlayer)
  var endTime = performance.now()
  console.log(`Call to fetchGeojson took ${endTime - startTime} milliseconds`)
}

function fetchSpeedTraps(){
  fetch('/speedtraps')
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    data.forEach(elem => {
      let latlngs = [[elem.POINT_1_LAT, elem.POINT_1_LNG], [elem.POINT_2_LAT, elem.POINT_2_LNG]]
      L.polyline(latlngs, {
        color: 'red'
      })
      .on('click', () => {
        sidebar.setContent(getPopupTableHTML(elem.POINT_1_LAT, elem.POINT_1_LNG, elem)).show()
      })
      .addTo(speedTrapLayer)
    })
  })
}

// use vector tiles at far-level zoom to improve performance.
map.on("zoomend", () => {
  if (map.hasLayer(matrikelkortlayer)) {
    let zoomLevel = map.getZoom()
    let minLevelToAggregate = 16
    if(zoomLevel >= minLevelToAggregate){
      matrikelkortlayer.removeLayer(aggMatLayer)
      matrikelkortlayer.addLayer(trueMatLayer)
    } else {
      if(matrikelkortlayer.hasLayer(trueMatLayer)){
        matrikelkortlayer.removeLayer(trueMatLayer)
        matrikelkortlayer.addLayer(aggMatLayer)
      }
    }
  }
})

// Fetch data from the MySQL database. 
async function fetchDatabase(){
  let sources=  ['dmi', 'cityprobe2', 'sck', 'wifi']
  Promise.all(sources.map(url =>
    fetch('/locations/' + url)
      .then(handleErrors)
      .then(response => response.json())
      .then((values) => addMarkersToMap(values))
      .catch(error => console.error(error))
  ))

  function addMarkersToMap(data) {
    data.forEach(item => {
      var parsedObject = JSON.parse(item.geojson);
      let sensor = item;

      var newmarker = L.geoJSON(parsedObject, {
        coordsToLatLng: function (coords) { return new L.LatLng(coords[0], coords[1], coords[2]); },
        onEachFeature: function (feature, layer) {
          placeSensorDataMarker(parsedObject.coordinates[0], parsedObject.coordinates[1], sensor);
        }
      })
    })
  }
}
fetchDatabase()

// let second = 1000;
// let refreshTimer = 300 * second

function fetchAll(){
  new Promise((resolve, reject) => {
    fetchCityProbe2()
    fetchDMIData()
    fetchSCK()
    fetchWiFi()
  })
  .then(fetchDatabase())
  .catch((error) => console.error(error))
  fetchGeojson()
  fetchSpeedTraps()
}
fetchAll()

// setInterval(() => {
//   fetchAll()
// }, refreshTimer)

function createErrorCircle(lat, lng, radius){
  var circle = L.circle([lat, lng], {
    color: 'yellow',
    fillcolor: '#ffc800',
    fillopacity: 90,
    radius: radius
  })
  return circle
}

/*
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
  drawnItems.addLayer(layer);
  console.log(layer)
});

function getMarkers(bounds){
  console.debug("getmarkers")
  var layers = [];

    markers.eachLayer((layer) => { 
      if(layer instanceof L.Marker || layer instanceof L.polyline){
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
  var table = _table_.cloneNode(false),
  columns = addAllColumnHeaders(arr, table);
  for (var i = 0, maxi = arr.length; i < maxi; ++i) {
    if(arr[i] != undefined){
      var tr = _tr_.cloneNode(false);
      for (var j = 0, maxj = columns.length; j < maxj; ++j) {
        var td = _td_.cloneNode(false);
        var cellValue = arr[i][columns[j]];
        if(typeof cellValue === 'object' && !Array.isArray(cellValue) && cellValue !== null){cellValue = JSON.stringify(cellValue)}
        td.appendChild(document.createTextNode(cellValue || ''));
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
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