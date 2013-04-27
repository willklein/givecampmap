
(function() {
    var options = {
        center: new L.LatLng(42.357688, -71.073518), zoom: 14
    };
    
    var map = new L.Map('map', options);
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
})();


(function($) {

	var icons = {},
		categories = [],
		places = [];

	function processData(data) {
		$(data.categories).each(function(i, category) {
			categories.push(category);

			icons[category.id] = L.icon({
				iconUrl: category.icon,
//				iconRetinaUrl: 'my-icon@2x.png',
				iconSize: [32, 32],
				iconAnchor: [16, 16]
//				popupAnchor: [0, 0],
//				shadowUrl: 'my-icon-shadow.png',
//				shadowRetinaUrl: 'my-icon-shadow@2x.png',
//				shadowSize: [68, 95],
//				shadowAnchor: [22, 94]
			});
		});
		$(data.places).each(function(i, place) {
			places.push(place);
		});
	}

	function createUI() {
		var $map = $('#map'),
			$legend = $('<div id="legend">'),
			latlong;

		$(categories).each(function(i, category) {
			$legend.append($('<label data-id="' + category.id + '"><img src="' + category.icon + '" />' + category.title + '</label>'));
		});
		$map.after($legend);

		$(places).each(function(i, place) {
			latlong = place.coordinates.split(',');
			L.marker([
				parseInt(latlong[1], 10),
				parseInt(latlong[0], 10)
			], {
				icon: icons[place.category],
				title: place.name
			}).addTo(map);
		});

	}

	function init() {
		$.ajax({
			url: 'data/places.json',
			success: function(data) {
				processData(data);
				createUI();
			}
		});

		$('document').on('click', '.label', function(e) {
			var $el = $(this);
			if (el.hasClass('disabled')) {
				// toggle map markers on
			} else {
				// toggle map markers off
			}
			el.toggleClass('disabled');
		});
	}

	$(document).ready(function() {
		init();
	});

})(jQuery);

