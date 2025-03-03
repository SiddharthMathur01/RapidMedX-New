let currentUser = null;
let map;
let ambulanceMarkers = {};
let users = { "admin@a": "12345" }; // Default Admin User

const loginSignupContainer = document.getElementById('loginSignup');
const dashboardContainer = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');

// Show/Hide Elements
function show(id) { document.getElementById(id).style.display = 'block'; }
function hide(id) { document.getElementById(id).style.display = 'none'; }

// Toggle Forms
showSignupLink.addEventListener('click', (e) => { e.preventDefault(); hide('loginForm'); show('signupForm'); loginError.textContent = ''; });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); hide('signupForm'); show('loginForm'); signupError.textContent = ''; });

// Login Function
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    loginError.textContent = '';

    if (users[email] && users[email] === password) {
        currentUser = { email };
        updateUI(currentUser);
    } else {
        loginError.textContent = "Invalid email or password.";
    }
});

// Signup Function
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    signupError.textContent = '';

    if (!email || !password) {
        signupError.textContent = "Email and password are required.";
        return;
    }

    if (users[email]) {
        signupError.textContent = "Email already registered.";
        return;
    }

    users[email] = password; 
    alert("Signup successful! Please login.");
    hide('signupForm');
    show('loginForm');
});

// Logout Function
document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    updateUI(null);
});

// Update UI based on login state
function updateUI(user) {
    if (user) {
        hide('loginSignup');
        show('dashboard');
        initializeMap();
        loadAmbulanceData();
    } else {
        show('loginSignup');
        hide('dashboard');
        if (map) { map.remove(); map = null; }
    }
}

// --- Ambulance Data ---
const totalAmbulancesEl = document.getElementById('totalAmbulances');
const activeAmbulancesEl = document.getElementById('activeAmbulances');
const inactiveAmbulancesEl = document.getElementById('inactiveAmbulances');
const ambulanceTableBody = document.getElementById('ambulanceTableBody');

let ambulanceData = [
    { id: '1', ambulanceId: 'A001', status: 'active', location: { lat: 27.5942, lng: 77.2428 }, driver: 'John Doe', patient: 'Alice Smith', pickup: 'Hospital A', dropoff: 'Home' },
    { id: '2', ambulanceId: 'A002', status: 'inactive', location: { lat: 29.5942, lng: 76.2428 }, driver: 'Jane Smith', patient: null, pickup: null, dropoff: null },
    { id: '3', ambulanceId: 'A003', status: 'active', location: { lat: 30.6139, lng: 75.2828 }, driver: 'Mike Brown', patient: 'Bob Johnson', pickup: 'Accident Site', dropoff: 'Hospital B' },
    { id: '4', ambulanceId: 'A004', status: 'inactive', location: { lat: 31.570, lng: 75.1346 }, driver: 'Emily Davis', patient: null, pickup: null, dropoff: null },
];

// Load Ambulance Data into Table
function loadAmbulanceData() {
    totalAmbulancesEl.textContent = ambulanceData.length;
    activeAmbulancesEl.textContent = ambulanceData.filter(a => a.status === 'active').length;
    inactiveAmbulancesEl.textContent = ambulanceData.filter(a => a.status === 'inactive').length;

    ambulanceTableBody.innerHTML = "";
    ambulanceData.forEach(ambulance => {
        let row = `<tr>
            <td>${ambulance.ambulanceId}</td>
            <td>${ambulance.status}</td>
            <td>${ambulance.location ? `${ambulance.location.lat}, ${ambulance.location.lng}` : "N/A"}</td>
            <td><button class="show-details-btn" data-ambulance-id="${ambulance.ambulanceId}">Details</button></td>
        </tr>`;
        ambulanceTableBody.innerHTML += row;
    });

    addClickHandlers();
}

// --- Map Initialization ---
function initializeMap() {
    if (!document.getElementById('map')) return console.error("Map container not found.");

    map = L.map('map').setView([0, 0], 2); 
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    updateAmbulanceMarkers();
}

// --- Update Markers on Map ---
function updateAmbulanceMarkers() {
    if (!map) return;
    ambulanceData.forEach(ambulance => {
        if (!ambulance.location) return;
        const { ambulanceId, location, status } = ambulance;

        if (ambulanceMarkers[ambulanceId]) {
            ambulanceMarkers[ambulanceId].setLatLng([location.lat, location.lng]);
        } else {
            let marker = L.marker([location.lat, location.lng]).addTo(map);
            marker.bindPopup(`<b>${ambulanceId}</b><br>Status: ${status}<br>
                <button class="show-details-btn" data-ambulance-id="${ambulanceId}">Show Details</button>`);
            ambulanceMarkers[ambulanceId] = marker;
        }
    });

    addClickHandlers();
}

// --- Handle Show Details ---
function addClickHandlers() {
    document.querySelectorAll('.show-details-btn').forEach(button => {
        button.addEventListener('click', function() {
            const ambulanceId = this.dataset.ambulanceId;
            showAmbulanceDetails(ambulanceId);
        });
    });
}

// --- Ambulance Details Modal ---
const ambulanceIdEl = document.getElementById('ambulanceId');
const ambulanceStatusEl = document.getElementById('ambulanceStatus');
const ambulanceLocationEl = document.getElementById('ambulanceLocation');
const ambulancePatientEl = document.getElementById('ambulancePatient');
const ambulanceRouteEl = document.getElementById('ambulanceRoute');
const stopRouteButton = document.getElementById('stopRouteButton');
const modal = document.getElementById('ambulanceDetailsModal');

function showAmbulanceDetails(ambulanceId) {
    const ambulance = ambulanceData.find(a => a.ambulanceId === ambulanceId);
    if (!ambulance) return;

    ambulanceIdEl.textContent = ambulance.ambulanceId;
    ambulanceStatusEl.textContent = ambulance.status;
    ambulanceLocationEl.textContent = `${ambulance.location.lat}, ${ambulance.location.lng}`;
    ambulancePatientEl.textContent = ambulance.patient || "N/A";
    ambulanceRouteEl.textContent = `${ambulance.pickup || "N/A"} → ${ambulance.dropoff || "N/A"}`;

    show('ambulanceDetailsModal');
    if (ambulance.location && map) map.setView([ambulance.location.lat, ambulance.location.lng], 13);
}

stopRouteButton.addEventListener('click', () => alert('Route stopped!'));
document.querySelector('.close').addEventListener('click', () => hide('ambulanceDetailsModal'));
