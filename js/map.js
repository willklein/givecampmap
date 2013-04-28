(function($, global) {

	var icons = {},
		categories = [],
		places = [],
		mapLayers = {},
        layerMarkers = {},
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

    var map;
    var $popupDetails;
    var renderPopup;
    var renderLegendLabel;
    function initMapBase() {
        map = new L.Map('teamap-map', options);

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

        renderPopup = renderFor('#teamap-mapPopup');
        renderLegendLabel = renderFor('#teamap-legendLabel');

        $popupDetails = $('#teamap-popupDetails');
    }

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
        var $container = $('#teamap-container'),
		    $map = $('#teamap-map'),
			$legend = $('<div id="teamap-legend">'),
            labels = [],
			layerGroups = {};

		$(categories).each(function(i, category) {
            labels.push(renderLegendLabel(category));
			layerMarkers[category.id] = [];
		});

        $legend.append('<ul>' + labels.join('') + '</ul>');
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

    			layerMarkers[category].push(marker);
            });
		});

		$(categories).each(function(i, category) {
			mapLayers[category.id] = L.layerGroup(layerMarkers[category.id]);
			map.addLayer(mapLayers[category.id]);
		});

        map.on('mousedown', hideDetails);

        $container.on('click', '#teamap-popupClose', function(e) {
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

            if (!map.hasLayer(mapLayers[id])) {
				map.addLayer(mapLayers[id]);
            }

            var regionBounds = {
                southWest: {
                    lat: Infinity,
                    lng: Infinity
                },
                northEast: {
                    lat: -Infinity,
                    lng: -Infinity
                }
            };

            var markerLatLng;
            $(layerMarkers[id]).each(function(i, marker) {
                markerLatLng = marker.getLatLng();
                regionBounds.southWest.lat = Math.min(regionBounds.southWest.lat, markerLatLng.lat);
                regionBounds.southWest.lng = Math.min(regionBounds.southWest.lng, markerLatLng.lng);
                regionBounds.northEast.lat = Math.max(regionBounds.northEast.lat, markerLatLng.lat);
                regionBounds.northEast.lng = Math.max(regionBounds.northEast.lng, markerLatLng.lng);
            });

            regionBounds = new L.LatLngBounds(
                    new L.LatLng(regionBounds.southWest.lat, regionBounds.southWest.lng),
                    new L.LatLng(regionBounds.northEast.lat, regionBounds.northEast.lng)
            );

            map.fitBounds(regionBounds);

            $el.parent().siblings('li').find('label').each(function() {
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
        initMapBase();
        getHash();
		init();
	});

})(jQuery, this);
