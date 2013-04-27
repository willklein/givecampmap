//var map = L.map('map').setView([51.505, -0.09], 13);
//
//L.tileLayer('http://{s}.tile.cloudmade.com/API-key/997/256/{z}/{x}/{y}.png', {
//    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
//    maxZoom: 18
//}).addTo(map);


var map = new L.Map('map', {center: new L.LatLng(42.357688, -71.073518), zoom: 14});
//var googleLayer = new L.Google('ROADMAP');
//map.addLayer(googleLayer);


//var baseMaps = {
//        "Stamen.Watercolor",
//        "OpenStreetMap.Mapnik": "OpenStreetMap.Mapnik",
//    };

var baseMaps = [
        "OpenStreetMap.Mapnik"
    ];

var overlayMaps = [
//        "OpenWeatherMap.Clouds"
    ];

var layerControl = L.control.layers.provided(baseMaps).addTo(map);
//you can still add your own after with 
//layerControl.addBaseLayer(layer,name);

//L.control.layers(baseMaps, overlayMaps).addTo(map);

var marker = L.marker([42.356324, -71.075578]).addTo(map);

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();