'use strict';
console.log("leafletmap script up")

// Initialize map, set its view on top of IT-byen, and xoom in.
var map = L.map('map')
map.setView([56.172196954673105, 10.188960985472951], 15); // NOTE: This will normally just give a grey box.

// Specify map data source. Use openstreetmap! The tiles are the "map fragments" you see. 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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
  userPosMarker = L.marker([lat,lng]).addTo(map);
  userPosCircle = L.circle([lat,lng], {radius:acc}).addTo(map);

  // Update view once user information has changed. (Only once.)
  if(!foundUser){
    map.fitBounds(userPosCircle.getBounds());
    foundUser = true;
  } 
  //map.setView([lat, lng]);
}

// Error handling of not retrieving user position. 
function err(pos){
  if(err.code === 1) { // Geolocation request denied.
    alert("please allow geolocation access thanks")
  } else {
    alert("failed to retrieve location. Code: " + err.code)
  }
}

// Format key and value for sensor into something readable. 
function tableHTML(lat, lng, sensor){
  const loc = "<table><thead><tr><th>Location</th><th>(" + lat + ", " + lng + ")</th></tr></thead><tbody>"

  var tableListOutput = "<tr><td>Most recent data<br></td></tr> "
  Object.entries(sensor).forEach(([key, value]) => {
    tableListOutput += "<tr><td>" + `${key}` + "</td><td>" + `${value}` + "</td></tr>"
  })
  var tableListEnd = "</tbody></table>"

  return loc+tableListOutput+tableListEnd
}

/*
 * MARKER PLACEMENT.
 */

// Place a marker, and add a pop-up to it. 
var locationMarker
function placeSensorDataMarker(lat, lng, sensor, iconUrl){
  var sensorIcon = L.icon({
    iconUrl: iconUrl,
    iconSize: [16, 16], // Not sure about image sizes, but this should be fine for now. 
    iconAnchor: [16, 16], // IMAGE POSITIONING PIXEL. PLACED IN CENTER
  })
  locationMarker = L.marker([lat, lng], {icon: sensorIcon}).addTo(map);
  
  // Pop-ups for data. 
  locationMarker.bindPopup(tableHTML(lat, lng, sensor))
}

// Test code for sensor factory. 
import {SensorFactory} from './sensorNodeFactory.js'
const sensorFactory = new SensorFactory();
const testsensor = sensorFactory.create({id: "This is a test", sensorType: "CityProbe2"})
placeSensorDataMarker(56.172689, 10.042084, testsensor, testsensor.iconUrl)
const testsensor2 = sensorFactory.create({device_id: "This is a test", sensorType: "CityLab"})
placeSensorDataMarker(56.1720735,10.0418602, testsensor2, testsensor2.iconUrl)

// Fetch data for the CityProbe2 devices.
async function fetchCityProbe2(){
  const response = await fetch('/cityprobe2list')
  const locationdata = await response.json()

  const response2 = await fetch('/cityprobe2latest') // TODO: FIX
  const data2 = await response2.json()

  locationdata.forEach((item, index) => {
    //console.log("ELEM" + Object.entries(item)) 
    console.log("YEET" + JSON.stringify(data2))
    const newSensor = sensorFactory.createCityProbe2Sensor(item, data2[index])
    placeSensorDataMarker(item.latitude, item.longitude, newSensor, newSensor.iconUrl)
  })
}
fetchCityProbe2();

async function fetchCityLab(){
  const response = await fetch('/citylab')
  const locationda
}