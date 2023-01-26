'use strict';
console.log("leafletmap script up")

// Initialize map, set its view on top of IT-byen, and xoom in.
var map = L.map('map')
map.setView([56.172196954673105, 10.188960985472951], 15); // NOTE: This will normally just give a grey box.

// Specify map data source. Use openstreetmap!
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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
  map.setView([lat, lng]);
}

// Error handling of not retrieving user position. 
function err(pos){
  if(err.code === 1) { // Geolocation request denied.
    alert("please allow geolocation access thanks")
  } else {
    alert("failed to retrieve location. Code: " + err.code)
  }
}