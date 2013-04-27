//var map = L.map('map').setView([51.505, -0.09], 13);
//
//L.tileLayer('http://{s}.tile.cloudmade.com/API-key/997/256/{z}/{x}/{y}.png', {
//    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
//    maxZoom: 18
//}).addTo(map);


var map = new L.Map('map', {center: new L.LatLng(51.51, -0.11), zoom: 9});
var googleLayer = new L.Google('ROADMAP');
map.addLayer(googleLayer);