var map;
function initMap() { 
  loadMarkers();
  setInterval("loadMarkers()", 300000);
}

function downloadUrl(url,callback) {
    var request = window.ActiveXObject ?
         new ActiveXObject('Microsoft.XMLHTTP') :
         new XMLHttpRequest;
     
    request.onreadystatechange = function() {
        if (request.readyState == 4) {
            //request.onreadystatechange = doNothing;
            callback(request, request.status);

            //loading screen
            var map_dom = document.getElementById("load");
            console.log(map_dom);
            map_dom.style.display = "none";
        }
    };
     
    request.open('GET', url, true);
    request.send(null);
}

function loadMarkers() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: {lat: 53.469369, lng: -2.233706}
  });

  var infoWindow = new google.maps.InfoWindow;

  xmlUrl = "http://www.itservices.manchester.ac.uk/clusteravailability/avail.php";

    map.markers = map.markers || []

    downloadUrl(xmlUrl, function(data) {
        var xml = data.responseXML;
        markers = xml.documentElement.getElementsByTagName("PLPlace");

        // reset position counters
        var counter = 0;
        var counter2 = 1;

        // for each marker
        for (var i = 0; i < markers.length; i++) {
          try{
            // store <tag> data
            var name = markers[i].getElementsByTagName("name")[0].innerHTML;
            var open = markers[i].getElementsByTagName("open")[0].innerHTML;
            var availability = markers[i].getElementsByTagName('availability')[0].innerHTML;
            var free = availability.split(" ")[3].toString();
            var address = markers[i].getElementsByTagName("locationName")[0].innerHTML;
            
            /*var image = {
              url: 'cluster_map/marker.png',
              size: new google.maps.Size(30, 30),
              origin: new google.maps.Point(0, 0),
              scaledSize: new google.maps.Size(30, 30)
            };*/

            // markers get more 'red' once availability falls below threshold
            var dangerZone = 50;
            if (free < (dangerZone/2)) {
                rCol = 255;
                gCol = Math.round(200 * (2 * free/dangerZone));
            } else if (free < dangerZone) {
                rCol = Math.round(255 * (1 - (free - dangerZone/2)/(dangerZone/2)));
                gCol = 200;
            } else {
              rCol = 0;
              gCol = 200;
            }
            var markerColor = rgbToHex(rCol, gCol, 0);

            // marker parameters
            var circle = {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: markerColor,
              fillOpacity: .8,
              scale: 10 + 30*(free/182),
              strokeColor: 'white',
              strokeWeight: 1.5
            };

            // mix up the coordinates to prevent overlap at locations with multiple clusters
            deltax = (counter - 1) * 0.0001;
            deltay = Math.floor(counter2 / 3) * 0.0001;

            // store coordinates
            var point = new google.maps.LatLng(
                parseFloat(markers[i].getElementsByTagName("latitude")[0].innerHTML) + deltax,
                parseFloat(markers[i].getElementsByTagName("longitude")[0].innerHTML) + deltay);

            // increment counters used to 'randomise' coordinates
            counter++
            if (counter > 2) {
              counter = 0;
            }
            counter2++
            if (counter2 > 12) {
              counter2 = 1
            }

            // placing marker and html box
            var html = "<div class='infowindow'><b>" + name + "</b><br/>" + address  + "</b><br/>" + availability + '<br/></div>';
            var marker = new google.maps.Marker({
              map: map,
              position: point,
              icon: circle,
              title: name,
              label: {
                text: free,
                color: 'white',
              },
              zIndex: parseInt(free),
            });
            
            map.markers.push(marker);
            bindInfoWindow(marker, map, infoWindow, html);
            /*console.log(freeColor);*/
        }
        catch(e)
        {console.log(name + " failed")}
      }
    });
}

function bindInfoWindow(marker, map, infoWindow, html) {
  google.maps.event.addListener(marker, 'click', function() {
    infoWindow.setContent(html);
    infoWindow.open(map, marker);
  });
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
