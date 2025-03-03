const loginForm = document.getElementById('login-form');
const bookingSection = document.getElementById('booking-section');
const mapSection = document.getElementById('map-section');
const locationSection = document.getElementById('location-section');
const bookingList = document.getElementById('booking-list');

let driverLat = 28.917833;
let driverLng = 77.063639;

const bookings = [
  {
    patientName: "Mohan",
    pickupLocation: {
      latitude: 28.918,
      longitude: 77.129,
      address: "Srm University, Rajiv Gandhi Education City, Sonipat"
    },
    dropoffLocation: {
      latitude: 28.9132,
      longitude: 77.1079,
      address: "Noble Multispeciality Hospital"
    },
    urgency: "Medium",
    bookingId: "BOOK54321"
  },
  {
    patientName: "Manav",
    pickupLocation: {
      latitude: 28.918,
      longitude: 77.129,
      address: "Delhi Golf Club, India Gate, New Delhi"
    },
    dropoffLocation: {
      latitude: 28.5933,
      longitude: 77.2573,
      address: "Park Hospital, Meera Enclave, New Delhi, Delhi 110018"
    },
    urgency: "High",
    bookingId: "BOOK98765"
  }
];

function showMessageBox(message) {
  document.getElementById('messageText').textContent = message;
  document.getElementById('overlay').style.display = 'block';
  document.getElementById('messageBox').style.display = 'block';
}

function closeMessage() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('messageBox').style.display = 'none';
}

function populateBookings() {
  bookingList.innerHTML = '';

  bookings.forEach(booking => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${booking.patientName} - ${booking.pickupLocation.address} (${booking.urgency})</span>
      <button onclick="acceptBooking('${booking.bookingId}')">Accept</button>
    `;
    bookingList.appendChild(li);
  });
}

function acceptBooking(bookingId) {
  const booking = bookings.find(booking => booking.bookingId === bookingId);

  if (!booking) {
    showMessageBox("Booking not found!");
    return;
  }

  

  // Hide bookings section when map is live
  bookingSection.classList.add('hidden');
  mapSection.classList.remove('hidden');
  locationSection.classList.remove('hidden');

  initializeMap(
    driverLat, driverLng,
    booking.pickupLocation.latitude, booking.pickupLocation.longitude,
    booking.dropoffLocation.latitude, booking.dropoffLocation.longitude
  );
}

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  showMessageBox("Login Successful!");
  document.getElementById('login-section').classList.add('hidden');
  bookingSection.classList.remove('hidden');
  populateBookings();

  document.getElementById('latitude').textContent = driverLat.toFixed(4);
  document.getElementById('longitude').textContent = driverLng.toFixed(4);

  locationSection.classList.remove('hidden');
});

let map;
let routingControl;

function initializeMap(driverLat, driverLng, pickupLat, pickupLng, dropoffLat, dropoffLng) {
  if (map) {
    map.remove();
  }

  map = L.map('map-container').setView([driverLat, driverLng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const driverMarker = L.marker([driverLat, driverLng]).addTo(map).bindPopup('Your Location (Ambulance)');
  const pickupMarker = L.marker([pickupLat, pickupLng]).addTo(map).bindPopup('Pickup Location');
  const dropoffMarker = L.marker([dropoffLat, dropoffLng]).addTo(map).bindPopup('Dropoff Location');

  // Remove previous route if any
  if (routingControl) {
    map.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(driverLat, driverLng),
      L.latLng(pickupLat, pickupLng),
      L.latLng(dropoffLat, dropoffLng)
    ],
    routeWhileDragging: false,
    showAlternatives: false,
    createMarker: function (i, waypoint) {
      if (i === 0) return driverMarker;
      if (i === 1) return pickupMarker;
      return dropoffMarker;
    }
  }).addTo(map);

  routingControl.on('routesfound', function (e) {
    const routes = e.routes;
    const summary = routes[0].summary;
    console.log('Total distance: ' + (summary.totalDistance / 1000).toFixed(2) + ' km');
    console.log('Total time: ' + Math.round(summary.totalTime / 60) + ' minutes');

    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = '';

    routes[0].instructions.forEach(instruction => {
      const li = document.createElement('li');
      li.textContent = instruction.text;
      instructionsList.appendChild(li);
    });
  });

  routingControl.on('routingerror', function (e) {
    console.error("Routing error:", e);
    showMessageBox("Could not find a route. Please check the locations.");
  });
}
