(function($, global) {

	var icons = {},
		categories = [],
		places = [],
		mapLayers = {},
        hashMarker = null,
        hash = null;

    // Setup the map
    var options = {
        center: new L.LatLng(42.354770, -71.093431),
        zoom: 14,
        minZoom: 14,
        maxBounds: new L.LatLngBounds(
                new L.LatLng(43.3, -71.19),
                new L.LatLng(41.85, -70.98)
        )
    };

    var map = new L.Map('map', options);

    var baseMaps = [
        'MapQuestOpen.OSM',
        'Thunderforest.Transport',
        'OpenStreetMap.Mapnik',
        'Stamen.Watercolor'
    ];

    var layerControl = L.control.layers.provided(baseMaps).addTo(map);

    layerControl.removeFrom(map);

    Handlebars.registerHelper('validUrl', function(text) {
        return $.trim(text).length;
    });

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

    function setHash(id) {
        global.location.hash = "#id=" + id;
    }

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
            $(place.categories).each(function(i, category) {

                var marker = L.marker([
                    parseFloat(place.lat),
                    parseFloat(place.lng)
                ], {
                    icon: icons[category],
                    title: place.name
                });

                if (place.imageUrl && !place.imageUrl.length) {
                    delete place.imageUrl;
                }

                var popupHtml = renderPopup(place);

                marker.on('click', function(e) {
                    markerClick.call(this, e);
                    showDetails(popupHtml);
                    setHash(place.id);
                });

                //set the hashMarker for the current location hash
                if (hash && place && place.id === hash.replace("#id=", "")) {
                    hashMarker = marker;
                }

    			layerGroups[category].push(marker);
            });
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
            url: 'https://rawgithub.com/willklein/givecampmap/master/data/map.json',
            dataType: 'json',
            success: function(data) {
                processData(data);
                createUI();
                if (hashMarker) {
                    hashMarker._icon.click();
                }
            }
        });

		// legend click
		$(document).on('click', 'label', function(e) {
			var $el = $(this),
				id = $el.data('id');

//			if ($el.hasClass('disabled')) {
//				// toggle map markers on
//				map.addLayer(mapLayers[id]);
//			} else {
//				// toggle map markers off
//				map.removeLayer(mapLayers[id]);
//			}
//			$el.toggleClass('disabled');
            
            if (!map.hasLayer(mapLayers[id])) {
				map.addLayer(mapLayers[id]);
            }
            
            
            $el.siblings('label').each(function() {
                var $el = $(this),
                    id = $el.data('id');

				map.removeLayer(mapLayers[id]);
            });
		});
	}

    function getHash() {
        hash = global.location.hash;
    }

	$(document).ready(function() {
        getHash();
		init();
	});

})(jQuery, this);
