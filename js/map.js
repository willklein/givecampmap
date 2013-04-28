var map;

(function() {
    var options = {
        center: new L.LatLng(42.354770, -71.093431),
        zoom: 14,
        minZoom: 14,
        maxBounds: new L.LatLngBounds(
                new L.LatLng(43.3, -71.19),
                new L.LatLng(41.85, -70.98)
        )
    };

    map = new L.Map('map', options);

    var baseMaps = [
        'MapQuestOpen.OSM',
        'Thunderforest.Transport',
        'OpenStreetMap.Mapnik',
        'Stamen.Watercolor'
    ];

    var overlayMaps = [
//        'OpenWeatherMap.Clouds'
    ];

//    L.TileLayer(baseMaps).addTo(map);

    var layerControl = L.control.layers.provided(baseMaps).addTo(map);

//    layerControl.removeFrom(map);

    //you can still add your own after with
    //layerControl.addBaseLayer(layer,name);

    //L.control.layers(baseMaps, overlayMaps).addTo(map);

//    var marker = L.marker([42.356324, -71.075578]).addTo(map);

//    marker.bindPopup('<b>Hello world!</b><br>I am a popup.').openPopup();
})();

(function($) {

	var icons = {},
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

    var $popupDetails = $('#popupDetails');

	function processData(data) {
		$(data.categories).each(function(i, category) {
			categories.push(category);

			icons[category.id] = L.icon({
				iconUrl: category.icon,
				iconSize: [31, 36],
				iconAnchor: [16, 16],
                shadowUrl: 'img/drops.png',
				shadowSize: [55, 36], /*62x36 would be proportional*/
				shadowAnchor: [13, 15]
			});
		});
		$(data.places).each(function(i, place) {
			places.push(place);
		});
	}

	function createUI() {
        var $container = $('#container'),
		    $map = $('#map'),
			$legend = $('<div id="legend">'),
            labels = [],
			layerGroups = {};

		$(categories).each(function(i, category) {
            labels.push(renderLegendLabel(category));
			layerGroups[category.id] = [];
		});

        $legend.append(labels.join(''));
		$map.after($legend);

		$(places).each(function(i, place) {
            var marker = L.marker([
                parseFloat(place.lat),
                parseFloat(place.lng)
            ], {
                icon: icons[place.categories && place.categories[0]],
                title: place.name
            });
            var popupHtml = renderPopup(place);

            marker.on('click', function(e) {
                markerClick.call(this, e);
                showDetails(popupHtml);
            });

			layerGroups[place.categories[0]].push(marker);
		});

		$(categories).each(function(i, category) {
			mapLayers[category.id] = L.layerGroup(layerGroups[category.id]);
			map.addLayer(mapLayers[category.id]);
		});
        
        map.on('mousedown', hideDetails);
        
        $container.on('click', '#popupClose', function(e) {
            hideDetails();
        });
	}

    function showDetails(html) {
        $popupDetails.show();
        $popupDetails.html(html);
    }

    function hideDetails() {
        $popupDetails.hide();
    }

	function markerClick(e) {
		var latLngMap = map.getBounds(),
			sw = latLngMap.getSouthWest(),
			ne = latLngMap.getNorthEast(),
			latExtent = sw.lat - ne.lat,
			lngExtent = sw.lng - ne.lng,
			eventLatLng = this.getLatLng(),
			lat = eventLatLng.lat,
			lng = eventLatLng.lng;

		map.panTo([lat - latExtent * 0, lng + lngExtent * 0.18]);
        
        showDetails(e);
	}

	function init() {
        $.ajax({
            url: 'data/map.json',
            success: function(data) {
                processData(data);
                createUI();
            },
            complete: function(jqXHR, textStatus) {
                //
            }
        });

		// legend click
		$(document).on('click', 'label', function(e) {
			var $el = $(this),
				id = $el.data('id');

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

