function initialize() {
    if(teastart.lat == '') {
        teastart.lat = 42.35669304646782;
    }
    if(teastart.lng == '') {
        teastart.lng = -71.08649614868159;
    }
    var myLatlng = new google.maps.LatLng(teastart.lat, teastart.lng);

    var mapOptions = {
        center: myLatlng,
        zoom: 15,
        minZoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("tea-map-helper"), mapOptions);

    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        draggable: true,
        title: 'Move Me'
    });
    google.maps.event.addListener(marker, 'dragend', function() {
        var point = marker.getPosition();
        var lat = point.lat();
        var lng = point.lng();
        document.getElementById('tea-map-location-lat').value = lat;
        document.getElementById('tea-map-location-lng').value = lng;
    });
}

google.maps.event.addDomListener(window, 'load', initialize);
