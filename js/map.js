var map;

(function() {
    var options = {
        center: new L.LatLng(42.354770, -71.093431),
        zoom: 14,
        minZoom: 14
    };

    map = new L.Map('map', options);

    var baseMaps = [
        'OpenStreetMap.Mapnik'
    ];

    var overlayMaps = [
//        'OpenWeatherMap.Clouds'
    ];

//    L.TileLayer(baseMaps).addTo(map);

    var layerControl = L.control.layers.provided(baseMaps).addTo(map);

    layerControl.removeFrom(map);

    //you can still add your own after with
    //layerControl.addBaseLayer(layer,name);

    //L.control.layers(baseMaps, overlayMaps).addTo(map);

//    var marker = L.marker([42.356324, -71.075578]).addTo(map);

//    marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
})();

(function($) {

	var icons = {},
		layers = {},
		categories = [],
		places = [],
		mapLayers = {};
    
    var renderFor = function(selector) {
        var templateSrc = $(selector).text();
        var template = Handlebars.compile(templateSrc);

        return function(data) {
            return template(data);
        };
    };

    var renderPopup = renderFor('#mapPopup');
    var renderLegendLabel = renderFor('#legendLabel');

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
            labels = [],
			latlong,
			layerGroups = {};

		$(categories).each(function(i, category) {
//			$legend.append($('<label data-id="' + category.id + '"><img src="' + category.icon + '" />' + category.title + '</label>'));
            labels.push(renderLegendLabel(category));
			layerGroups[category.id] = [];
		});
        
        $legend.append(labels.join());
		$map.after($legend);

		$(places).each(function(i, place) {
            var marker = L.marker([
                place.lat,
                place.lng
            ], {
                icon: icons[place.category],
                title: place.name
            });
            var popupHtml = renderPopup(place); 
            
            marker.bindPopup(popupHtml);
			layerGroups[place.category].push(marker);
		});

		$(categories).each(function(i, category) {
			mapLayers[category.id] = L.layerGroup(layerGroups[category.id]);
			map.addLayer(mapLayers[category.id]);
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

		$(document).on('click', 'label', function(e) {
			var $el = $(this);
			var id = $el.data('id');

			if ($el.hasClass('disabled')) {
				// toggle map markers on
				map.addLayer(mapLayers[id]);
			} else {
				// toggle map markers off
				map.removeLayer(mapLayers[id]);
			}
			$el.toggleClass('disabled');
		});
	}

	$(document).ready(function() {
		init();
	});

})(jQuery);

