'use strict';
import { NullSensorFactory, SensorOptions, CopenhagenMeterologySensorFactory } from '../sensornodefactory/sensorNodeFactory.js'
const sensorOptions = new SensorOptions()
//let cityProbe2Factory = new CityProbe2Factory();
const nullSensorFactory = new NullSensorFactory();
const copenhagenMeterologySensorFactory = new CopenhagenMeterologySensorFactory();

const openStreetMapTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})

const map = L.map('map', {
  layers: openStreetMapTileLayer, 
  center: [58.25602,8.35935],
  zoom: 7,
  preferCanvas: false
})

/*
  Geolocation
 */

//navigator.geolocation.watchPosition(onFoundUserPosition, onFailedToFindPosition);
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
 * Note: not directly DAWA. Can be found here... https://github.com/kjoller/leaflet-control-geocoder-dawa/blob/new/demo/index.html
 */

var gcpoly
let geocoder = L.Control.Geocoder.nominatim();
if (typeof URLSearchParams !== 'undefined' && location.search) {
  // parse /?geocoder=nominatim from URL
  let params = new URLSearchParams(location.search);
  let geocoderString = params.get('geocoder');
  if (geocoderString && L.Control.Geocoder[geocoderString]) {
    console.log('Using geocoder', geocoderString);
    geocoder = L.Control.Geocoder[geocoderString]();
  } else if (geocoderString) {
    console.warn('Unsupported geocoder', geocoderString);
  }
}
const geocoderControl = L.Control.geocoder({
  query: 'Katrinebjergvej',
  placeholder: 'Search here...',
  geocoder: geocoder
}).on('markgeocode', (e) => { 
  let bbox = e.geocode.bbox;
  gcpoly = L.polygon([
    bbox.getSouthEast(),
    bbox.getNorthEast(),
    bbox.getNorthWest(),
    bbox.getSouthWest()
  ]).addTo(map)
  map.fitBounds(gcpoly.getBounds())
}).addTo(map);

/*
 * Add SideBar
 */

let sidebar = L.control.sidebar('sidebar', {
  position: 'left',
  autoPan: true
});
map.addControl(sidebar)

/* 
 * ADDITIONAL MAP LAYERS
 */ 

const arcGISMapTileLayer = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19
})
const CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});
const SafeCast = L.tileLayer('https://s3.amazonaws.com/te512.safecast.org/{z}/{x}/{y}.png', {
	maxZoom: 16,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://blog.safecast.org/about/">SafeCast</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var OpenWeatherMap_Clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: 'bd600f61e5aa20c8a5e82cbc55e02a08',
	opacity: 0.5
});
var OpenWeatherMap_Pressure = L.tileLayer('http://{s}.tile.openweathermap.org/map/pressure/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: 'bd600f61e5aa20c8a5e82cbc55e02a08',
	opacity: 0.5
});
var OpenWeatherMap_Wind = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid={apiKey}', {
	maxZoom: 19,
	attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
	apiKey: 'bd600f61e5aa20c8a5e82cbc55e02a08',
	opacity: 0.5
});

// let mbapik = pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ
const basemaps = {
  "OpenStreetMap: Standard": openStreetMapTileLayer,
  "Positron by CartoDB: Standard": CartoDB_Positron,
  "MapServer by ArcGIS Online: Satellite": arcGISMapTileLayer
};

/*
 * MARKER LAYERS.
 */

let layers = L.layerGroup(); // This is a container object to quickly scan all layers with markers.
let markers = L.layerGroup(); // this layer is used for markerclustergroups.

// const markerClusterGroupingTool = L.markerClusterGroup({
//   chunkedLoading: true,
//   showCoverageOnHover: false, // this would have been nice but doesn't seem to work. 
//   spiderfyOnMaxZoom: true,
//   zoomToBoundsOnClick: true, 
//   removeOutsideVisibleBounds: true,
//   spiderLegPolylineOptions: {weight: 1.5, opacity: 0.5}
// })
// markers.addLayer(markerClusterGroupingTool) // This lets us ignore the layers control. 

const dmiLayer = L.layerGroup()
//let cityprobe2layer = L.layerGroup()
const scklayer = L.layerGroup()
const errorlayer = L.layerGroup()
const wifilayer = L.layerGroup()
const matrikelkortlayer = L.layerGroup()
const trueMatLayer = L.layerGroup()
const aggMatLayer = L.layerGroup()
const speedTrapLayer = L.layerGroup()
const dbQueryLayer = L.layerGroup()
const metNoAirLayer = L.layerGroup()
const envZoneLayer = L.layerGroup()
const variousUniversitiesLayer = L.layerGroup()
const openMeteoLayer = L.layerGroup()
const smhiLayer = L.layerGroup()
const openSenseMapLayer = L.layerGroup()
const markerlayers = [dmiLayer, scklayer, errorlayer, wifilayer, dbQueryLayer, metNoAirLayer, variousUniversitiesLayer, openMeteoLayer, openSenseMapLayer]

// https://www.npmjs.com/package/leaflet-groupedlayercontrol
let overlaysObj = {
  "Sensors": {
    "DMI": dmiLayer,
    //"CityProbe2": cityprobe2layer,
    "Smart Citizen Kit": scklayer,
    "Sensors with no data": errorlayer,
    "Speedtraps": speedTrapLayer,
    "MET.no Air Quality Sensor": metNoAirLayer,
    "Various universities in Denmark": variousUniversitiesLayer,
    "Open-meteo": openMeteoLayer,
    "SMHI": smhiLayer,
    "OpenSenseMap": openSenseMapLayer
  },
  "Other": {
    "WiFi Locations": wifilayer,
  },
  "Tools": {
    // "Cluster markers": markers,
    "SafeCast Radiation": SafeCast,
    "Matrikelkort": matrikelkortlayer,
    "OWM Clouds": OpenWeatherMap_Clouds,
    "OWM Wind": OpenWeatherMap_Wind,
    "OWM Pressure": OpenWeatherMap_Pressure
  }
}
let control = L.control.groupedLayers(basemaps, overlaysObj, { groupCheckboxes: true }).addTo(map);
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
// const zoomViewer = (new ZoomViewer()).addTo(map);

// Place a marker, and add a pop-up to it.
function placeSensorDataMarker(lat, lng, sensor){
  let iconUrl = "img/msql.png";
  let device_type = sensor.device_type
  let gic = sensorOptions.getIconMap(device_type)
  if(gic){ iconUrl = gic } 
  else { console.error("No icon found for '", device_type, "'") }

  // for layer filtering.
  let publisher = sensorOptions.getPublisherMap(sensor.device_type)
  let layerToAddTo = errorlayer
  // switch statements are faster than if-else. 
  switch (publisher) {
    // case "Montem": 
    //   layerToAddTo = cityprobe2layer
    //   break
    case "DMI":
      layerToAddTo = dmiLayer
      break
    case "SmartCitizen":
      layerToAddTo = scklayer
      break
    case "Aarhus Municipality":
      layerToAddTo = wifilayer
      break
    case "MET.no":
      layerToAddTo = metNoAirLayer
      break
    case "Aarhus Universitet":
      layerToAddTo = variousUniversitiesLayer
      break
    case "Open-Meteo":
      layerToAddTo = openMeteoLayer
      break
    case "SMHI":
      layerToAddTo = smhiLayer
      break;
    case "OpenSenseMap":
      layerToAddTo = openSenseMapLayer
      break
    default:
      console.warn(`no layer found. Will be added to the error layer. publisher: '${publisher}' `, sensor)
      layerToAddTo = errorlayer
  }

  let sensorIcon = L.icon({
    iconUrl: iconUrl,
    iconSize: [16, 16], // Not sure about image sizes, but this should be fine for now. 
    iconAnchor: [8, 8], // IMAGE POSITIONING PIXEL. PLACED IN CENTER
  })
  
  // check if marker of same source exists at location. If one is found, update it instead of making a new one.
  // We have to do it like this, because js doesn't let us return out of a foreach loop.
  let isUpdated = false
  layerToAddTo.eachLayer((layer) => {
    let isMarkerThere = layer instanceof L.Marker && layer.getLatLng().distanceTo(L.latLng(lat, lng)) < 0.0000001
    if(isMarkerThere){
      //console.log("UPDATEEEE" + sensor.device_type + "ID: " + sensor.device_id)
      layer.sensor = sensor
      layer.on('click', () => { sidebar.setContent(buildSidebarTable(lat, lng, sensor)) })
      isUpdated = true
    }
  })

  // Place a NEW marker. 
  if(!isUpdated){
    let locationMarker = L.marker([lat, lng], {icon: sensorIcon}).addTo(markers); // Note, we add the marker to a group "markers", which allows clustering to work. 
    if(sensor.device_type){
      // Pop-ups for data. 
      locationMarker.sensor = sensor
      locationMarker.on('click', () => { sidebar.setContent(buildSidebarTable(lat, lng, sensor)).show() })
      layerToAddTo.addLayer(locationMarker)
    }
    // clustering tool. 
    layers.addLayer(locationMarker)
    // markerClusterGroupingTool.addLayer(locationMarker)
  }
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

/*
  UPDATE 18-04-2023:
  Unfortunately, it appears, that the founders of Montem A/S has shut down their business. The code here is preserved for documentation purposes. 
*/
// async function fetchCityProbe2(){
//   const urls = ['/cityprobe2list', '/cityprobe2latest']
//   // use map() to perform a fetch and handle the response for each url
//   Promise.all(urls.map(url =>
//     fetch(url)
//       .then(handleErrors)
//       .then(response => response.json())
//       .catch((error) => console.error(error))
//   ))
//   .then(handleErrors)
//   .then((values) => {
//     let locationdata = values[0]
//     let sensordata = values[1]
//     // Place CityProbe2 markers.
//     locationdata.forEach((item) => {
//       var location = item.id;
//       var elemToUse = sensordata["150"].filter(function(data){ return data.device_id == location})
//       //console.debug("For location: " + location + ", ElemToUse: " + JSON.stringify(elemToUse[0]))
//       if(!elemToUse[0]){
//         placeSensorDataMarker(item.latitude, item.longitude, nullSensorFactory.create())
//       } else {
//         var paramsForCityProbe2Sensor = jQuery.extend(elemToUse[0], item)
//         var newSensor = cityProbe2Factory.create(paramsForCityProbe2Sensor);
//         sendPositionToDatabase(item.latitude, item.longitude, newSensor);
//       }
//     })
//   })
//   .catch((error) => console.error(error))
// }

// outdated data.
const API_URL_OD_COPENHAGEN_METEROLOGY = 'https://admin.opendata.dk/api/3/action/datastore_search?resource_id=315bf474-2fb1-49f1-8ae0-32c4b74e6b07'
function fetchODCMet(){
  fetch(API_URL_OD_COPENHAGEN_METEROLOGY)
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    let IN = data.result.records[0]
    let CMS = copenhagenMeterologySensorFactory.create(IN)
    // the location here is a "best guess using: https://www.opendata.dk/city-of-copenhagen/meteorologi"
    placeSensorDataMarker(55.0421, 12.03341, CMS)
  })
}

/*
 * MATRIKELKORTET. 
 * kommunekode: https://danmarksadresser.dk/adressedata/kodelister/kommunekodeliste
 */

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
  let layer = e.target;
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
  sidebar.setContent(buildSidebarTable(e.target.latitude, e.target.longitude, e.target.popupContent)).show()
  sidebar.setContent(e.target.popupContent).show()
}

// https://gis.stackexchange.com/questions/183725/leaflet-pop-up-does-not-work-with-geojson-data
// https://gis.stackexchange.com/questions/229723/displaying-properties-of-geojson-in-popup-on-leaflet
function onEachFeature(feature, layer){
  layer.on({
    //mouseover: highlightFeature,
    //mouseout: resetHighlight,
    mouseclick: zoomToFeature
  })
  //let popupContent = `<p> ${JSON.stringify(feature.properties)}</p>`
  let popupContent = buildSidebarTable(feature.properties.visueltcenter_x, feature.properties.visueltcenter_y, feature.properties)
}

// https://www.youtube.com/watch?v=xerlQ3tE8Ew <-- large geojson
// https://www.youtube.com/watch?v=1SGbqlo19HQ <-- other, the one you used
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
  let startTime = performance.now()
  fetch('/jordstykker')
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
  let endTime = performance.now()
  //console.log(`Call to fetchGeojson took ${endTime - startTime} milliseconds`)
}

function fetchSpeedTraps(){
  fetch('/speedtraps')
  .then(handleErrors)
  .then(response => response.json())
  .then(data => {
    data.forEach(elem => {
      let latlngs = [[elem.POINT_1_LAT, elem.POINT_1_LNG], [elem.POINT_2_LAT, elem.POINT_2_LNG]]
      L.polyline(latlngs, { color: 'red' })
      .on('click', () => {
        sidebar.setContent(buildSidebarTable(elem.POINT_1_LAT, elem.POINT_1_LNG, elem)).show()
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
let sources=  ['metno', 'dmi', 'sck', 'wifi', 'ausensor', 'open-meteo', 'smhi', 'opensensemap']
  Promise.all(sources.map(url =>
    fetch('/locations/' + url)
      .then(handleErrors)
      .then(response => response.json())
      .then((values) => {
        // console.log(values)
        addMarkersToMap(values)
      })
      .catch(error => console.error(error))
  ))

  function addMarkersToMap(data) {
    data.forEach(item => {
      let parsedObject = JSON.parse(item.geojson);
      let sensor = item;

      L.geoJSON(parsedObject, {
        coordsToLatLng: function (coords) { return new L.LatLng(coords[0], coords[1], coords[2]); },
        onEachFeature: function (feature, layer) {
          placeSensorDataMarker(parsedObject.coordinates[0], parsedObject.coordinates[1], sensor);
        }
      })
    })
  }
}

function fetchAll(){
  fetchDatabase()
  .catch((error) => console.error(error))
  fetchGeojson()
  fetchSpeedTraps()
}
fetchAll()
setInterval(fetchAll(), 30000)

function createErrorCircle(lat, lng, radius){
  let circle = L.circle([lat, lng], {
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

let buffer
// Inspired from: https://stackoverflow.com/questions/64702581/leaflet-js-draw-rectangle-and-filter-circle-markers-in-the-rectangle-and-updat
// capture drawn data event.
map.on('draw:created', (event) => {
  let layer = event.layer
  if(layer && layer instanceof L.Rectangle) { // GetBounds works like a square, so it doesn't work properly if you make polygons.
    console.debug("drawn Rectangle")
    getMarkers(layer.getBounds())
  } else if(layer && (layer instanceof L.Marker || layer instanceof L.Polyline)){
    buffer = L.geoJSON(layer.toGeoJSON(), 
      {coordsToLatLng: function (coords) { return new L.LatLng(coords[0], coords[1], coords[2]); }})
    console.log("new buffer is ", buffer)
  }
  drawnItems.clearLayers()
  drawnItems.addLayer(layer);
});

function getMarkers(bounds){
  console.debug("getmarkers")
  let layers = [];

  map.eachLayer((layer) => { 
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
  table.appendChild(buildQueryToolTable(sensorsToTable))

  return layers;
}

const _table_ = document.createElement('table'),
  _tr_ = document.createElement('tr'),
  _th_ = document.createElement('th'),
  _td_ = document.createElement('td');
_table_.className="queryTable"

// Format key and value for sensor into something readable. I think leaflet only accepts html strings as input?
function buildSidebarTable(lat, lng, sensor){
  let loc = `<table><thead><tr><th>(${lat},${lng})</tr></th></thead><tbody>`
  let tableListOutput;
  Object.entries(sensor).forEach(([key, value]) => {
      if(key == "json"){
        tableListOutput += "<tr><td>JSON CONTENT: </td></tr>"
        Object.entries(value).forEach((K) => {tableListOutput += `<tr><td>${K[0]}</td><td>${K[1]}</td></tr>`})
      } else {
        let unitRes = sensorOptions.getUnitMap(key)
        if(!unitRes){
          tableListOutput += `<tr><td>${key}</td><td>${value}</td></tr>`
        } else {
          tableListOutput += `<tr><td>${unitRes.name}</td><td>${value}</td><td>${unitRes.unit}</td></tr>`
        }
      }
  })

  if(sensorOptions.getPublisherMap(sensor.device_type) == "SMHI"){
    tableListOutput += "<tr><td>note: Sun and Radiation are measured at seperate locations from everything else.</td></tr>"
  } else if(sensorOptions.getPublisherMap(sensor.device_type) == "DMI"){
    tableListOutput += "<tr><td>Explaination of weather codes: </td><td><a href=https://confluence.govcloud.dk/pages/viewpage.action?pageId=26476621> link </a></td></tr>"
    tableListOutput += "<tr><td>Explaination of parameters: </td><td><a href=https://confluence.govcloud.dk/pages/viewpage.action?pageId=26476616> link </a></td></tr>"
  }

  const tableListEnd = "</tbody></table>"

  return loc+tableListOutput+tableListEnd
}

// Builds the HTML Table out of myList json data from Ivy restful service.
function buildQueryToolTable(arr) {
  let table = _table_.cloneNode(false),
  columns = addAllColumnHeaders(arr, table);
  for (let i = 0, maxi = arr.length; i < maxi; ++i) {
    if(arr[i] != undefined){
      // new sensor node.
      let tr = _tr_.cloneNode(false);
      for (let j = 0, maxj = columns.length; j < maxj; ++j) {
        // new measurement in the node. 
        let td = _td_.cloneNode(false);
        let cellValue = arr[i][columns[j]];
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
  let columnSet = [],
    tr = _tr_.cloneNode(false);
  for (let i = 0, l = arr.length; i < l; i++) {
    for (let key in arr[i]) {
      if (arr[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
        columnSet.push(key);
        let th = _th_.cloneNode(false);
        th.appendChild(document.createTextNode(key));
        tr.appendChild(th);
      }
    }
  }
  table.appendChild(tr);
  return columnSet;
}

/*
 * Quick'n'dirty way of getting values from select.
 */

function getSelect(selectId){
  return Array.from(document.getElementById(selectId).options).filter(option => option.selected).map(option => option.value);
}

/* 
 * Query database based on form input
 */

let queryLayer = L.layerGroup();
let isQlayerAdded = false;

function queryMap(){
  let fields = getSelect("fields")
  let source = getSelect("source")
  let clause_column = document.getElementById("clauseColumn").value
  let clause_param = getSelect("parameterSelect")[0]
  let clause_value = document.getElementById("clauseValue").value

  let geoClause = getSelect("clauseSelect")[0]
  let geoClauseComparedTo = getSelect("cls")[0]
  let targetGeom
  let searchDist = document.getElementById("searchdistance").value

  let isGeoClause = document.getElementById("gccheck").checked
  let bufferExists = buffer != undefined
  if (isGeoClause && bufferExists) {
    targetGeom = buffer.toGeoJSON().features[0]
    if(geoClauseComparedTo != undefined){
      console.log("compare with object of type", geoClauseComparedTo)
      console.log("buffer object", buffer)
    }
  }

  let orderSource = getSelect("orderSource")
  let orderType = getSelect("orderType")
  let limit = document.getElementById("inputLimit").value

  let QueryParams = {
    fields: fields,
    source: source,

    clause_column: clause_column,
    clause_param: clause_param,
    clause_value: clause_value,

    orderSource: orderSource,
    orderType: orderType,
    limit: limit,
    geoClause: geoClause,
    targetGeom: targetGeom,
    searchDist: searchDist
  }

  console.log(QueryParams)

  fetch('/locations', {
    method: 'PUT',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({"data": QueryParams })
  })
  .then(response => { 
    if(response.status != 400){
      response.json()
      .then(data => { 
        // show on table.
        let table = document.getElementById("queryTable")
        table.innerHTML = ""
        table.appendChild(buildQueryToolTable(data))

        // Clear query layer.
        queryLayer.clearLayers()

        let isGeometry = false
        // show on map if geometry is selected.
        if (data[0].geometry) {
          try {
          data.forEach((elem) => {
            let parsedObject = JSON.parse(elem.geometry)
            // console.log("element", elem)
            let newmarker = L.geoJSON(parsedObject, { 
              pointToLayer: function (feature, latlng) { 
                return L.circleMarker(latlng, { 
                  radius: 8, 
                  fillColor: "#ff7800", 
                  color: "#000"
                })
              }, 
              coordsToLatLng: function (coords) {
                return new L.LatLng(coords[0], coords[1], coords[2]); 
              }
            })
            .on('click', () => {
              sidebar.setContent(buildSidebarTable(parsedObject.coordinates[0], parsedObject.coordinates[1], elem)).show()
            })
            .addTo(queryLayer)
            isGeometry = true
          })
          } catch(e){console.warn("Error for selected layers.", e)}
        }

        if (isGeometry && !isQlayerAdded) { 
          control.addOverlay(queryLayer, "Query Results", "SQL")
          isQlayerAdded = true
       }
      })
    } else {
      console.error(response.statusText)
      alert("Error", response.body)
    }
  })
}
document.getElementById('updateBtn').onclick = queryMap