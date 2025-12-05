let userLocation = null;
let directionsService;
let directionsRenderer;

function initMap() {
  const knustCenter = { lat: 6.6744, lng: -1.5716 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 17,
    center: knustCenter,
    mapTypeId: "satellite",
    tilt: 45
  });


  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "Your Location",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          }
        });
      },
      () => {
        alert("Could not get your location.");
      }
    );
  }

  const locations = [
    { name: "Unity Hall", lat: 6.6739, lng: -1.5703 },
    { name: "Republic Hall", lat: 6.6730, lng: -1.5720 },
    { name: "Independence Hall", lat: 6.6740, lng: -1.5705 },
    { name: "Africa Hall", lat: 6.6752, lng: -1.5710 },
    { name: "University Hall (Katanga)", lat: 6.6755, lng: -1.5732 },
    { name: "Queen Elizabeth II Hall", lat: 6.6761, lng: -1.5708 },
    { name: "College of Engineering", lat: 6.6760, lng: -1.5730 },
    { name: "College of Science", lat: 6.6770, lng: -1.5700 },
    { name: "College of Art & Built Environment", lat: 6.6758, lng: -1.5740 },
    { name: "College of Health Sciences", lat: 6.6782, lng: -1.5695 },
    { name: "College of Humanities & Social Sciences", lat: 6.6765, lng: -1.5715 },
    { name: "College of Agriculture & Natural Resources", lat: 6.6780, lng: -1.5725 },
    { name: "KNUST Library", lat: 6.6750, lng: -1.5718 },
    { name: "Great Hall", lat: 6.6745, lng: -1.5722 },
    { name: "Faculty of Law", lat: 6.6768, lng: -1.5702 },
    { name: "ICT Centre", lat: 6.6757, lng: -1.5713 },
    { name: "Commercial Area", lat: 6.6748, lng: -1.5700 }
  ];

  locations.forEach(loc => {
    const marker = new google.maps.Marker({
      position: { lat: loc.lat, lng: loc.lng },
      map: map,
      title: loc.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${loc.name}</strong><br/><button onclick="getDirections(${loc.lat}, ${loc.lng})">Get Directions</button>`
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}

function getDirections(destLat, destLng) {
  if (!userLocation) {
    alert("User location not available.");
    return;
  }

  const request = {
    origin: userLocation,
    destination: { lat: destLat, lng: destLng },
    travelMode: google.maps.TravelMode.WALKING
  };

  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
    } else {
      alert("Directions request failed: " + status);
    }
  });
}