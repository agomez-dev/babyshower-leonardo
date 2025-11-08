// let giftList = [
//     { id: 1, title: 'Pañales Etapa 1', detail: 'Pañales para recién nacido, cualquier marca es bienvenida.', required: 10, img: 'https://i.ibb.co/L5k6Y1b/paales.jpg', sites: [{name: 'Amazon', url: '#'}, {name: 'Walmart', url: '#'}] },
//     { id: 2, title: 'Cuna de Viaje', detail: 'Una cuna plegable para viajes, ligera y fácil de montar.', required: 1, img: 'https://i.ibb.co/31zP863/cuna.jpg', sites: [{name: 'Liverpool', url: '#'}, {name: 'Babies R Us', url: '#'}] },
//     { id: 3, title: 'Set de Biberones', detail: 'Set completo de biberones anti-cólicos de diferentes tamaños.', required: 3, img: 'https://i.ibb.co/Q8Q49rG/biberones.jpg', sites: [{name: 'Farmacia', url: '#'}] },
//     { id: 4, title: 'Ropa 6-9 meses', detail: 'Ropa de invierno para bebé de 6 a 9 meses, abrigos o mamelucos.', required: 5, img: 'https://i.ibb.co/F8j26H0/ropa.jpg', sites: [{name: 'Zara Kids', url: '#'}, {name: 'Tienda Local', url: '#'}] },
//     { id: 5, title: 'Monitor de Bebé', detail: 'Monitor de video con visión nocturna y sensor de movimiento.', required: 1, img: 'https://i.ibb.co/Tmg2k77/monitor.jpg', sites: [{name: 'Best Buy', url: '#'}] },
//     { id: 6, title: 'Juguetes Educativos', detail: 'Juguetes de estimulación temprana (0-6 meses).', required: 4, img: 'https://i.ibb.co/3s68K1c/juguetes.jpg', sites: [{name: 'Juguetería', url: '#'}] },
// ];
let giftList = [];
(async () => {
  giftList = await getWishlistFull();
  initializeInventory();
  renderGiftCards();
})();

const currentUserId = 123; 
const isUserLoggedIn = currentUserId !== 0;
let userSelections = JSON.parse(localStorage.getItem('giftUserSelections')) || {};
let giftInventory = [];

function initializeInventory() {
    console.log(giftList);
    giftInventory = giftList.map(gift => {
        let selectedCount = gift.selected;
        let selectedBy = 0;
        Object.entries(userSelections).forEach(([userId, selections]) => {
            const selection = selections.find(s => s.giftId === gift.id);
            if (selection) { selectedCount += selection.quantity;
                if (parseInt(userId) === currentUserId) { selectedBy = selection.quantity; } }
        });
        return {
            ...gift,
            currentSelected: selectedCount,
            available: gift.required - selectedCount,
            userSelected: selectedBy,
            isFullyClaimed: (gift.required - selectedCount) <= 0
        };
    });
}

let currentGiftId = null;
let currentGift = null;
let originalUserSelection = 0;

function openGiftModal(id) {
    currentGiftId = id;
    currentGift = giftInventory.find(g => g.id === id);
    if (!currentGift) return;

    const modal = document.getElementById('giftDetailModal');
    const availableCountEl = document.getElementById('availableCount');
    const selectedCountEl = document.getElementById('selectedCount');
    const interactionArea = document.getElementById('userInteractionArea');
    const noInteractionMessage = document.getElementById('noInteractionMessage');
    const saveMessage = document.getElementById('saveMessage');

    document.getElementById('modalTitle').textContent = currentGift.title;
    document.getElementById('modalImage').src = currentGift.img;
    document.getElementById('modalDetail').textContent = currentGift.detail;
    document.getElementById('requiredCount').textContent = currentGift.required; 
    
    const sitesList = document.getElementById('modalSites');
    sitesList.innerHTML = currentGift.sites.map(site => 
        `<li><a href="${site.url}" target="_blank" class="text-blue-600 hover:underline">${site.name}</a></li>`
    ).join('');

    availableCountEl.textContent = currentGift.available;
    originalUserSelection = currentGift.userSelected;
    selectedCountEl.textContent = originalUserSelection;
    saveMessage.classList.add('hidden'); 

    if (isUserLoggedIn) {
        interactionArea.classList.remove('hidden');
        noInteractionMessage.classList.add('hidden');
        updateButtonStates(originalUserSelection, currentGift.available);
    } else {
        interactionArea.classList.add('hidden');
        noInteractionMessage.classList.remove('hidden');
        noInteractionMessage.querySelector('p').textContent = 
            currentGift.isFullyClaimed ? "¡Este regalo ya fue seleccionado! Gracias." : 
            "Debes iniciar sesión para seleccionar regalos.";
    }

    modal.classList.remove('hidden');
}

function updateButtonStates(currentSelection, availableRemaining) {
    const decrementBtn = document.getElementById('decrementBtn');
    const incrementBtn = document.getElementById('incrementBtn');
    
    decrementBtn.disabled = currentSelection <= 0;
    const maxIncrease = availableRemaining + currentGift.userSelected;
    incrementBtn.disabled = currentSelection >= maxIncrease; 
}

function updateSelection(change) {
    const selectedCountEl = document.getElementById('selectedCount');
    let currentSelection = parseInt(selectedCountEl.textContent);
    const availableCountEl = document.getElementById('availableCount');
    
    let newSelection = currentSelection + change;
    if (newSelection < 0) { newSelection = 0; }
    const maxAllowed = currentGift.available + currentGift.userSelected;
    if (newSelection > maxAllowed) { newSelection = maxAllowed; }

    if (newSelection !== currentSelection) {
        selectedCountEl.textContent = newSelection;
        const newAvailable = currentGift.available - (newSelection - currentGift.userSelected);
        availableCountEl.textContent = newAvailable;
        updateButtonStates(newSelection, newAvailable);
        saveUserSelection(currentGift.id, newSelection);
        const saveMessage = document.getElementById('saveMessage');
        saveMessage.classList.remove('hidden');
        setTimeout(() => saveMessage.classList.add('hidden'), 2000);
    }
}

// function saveUserSelection(giftId, quantity) {
//     if (!isUserLoggedIn) return; 
//     let selections = userSelections[currentUserId] || [];
//     const index = selections.findIndex(s => s.giftId === giftId);

//     if (quantity > 0) {
//         if (index > -1) { selections[index].quantity = quantity; } 
//         else { selections.push({ giftId, quantity }); }
//     } else if (index > -1) {
//         selections.splice(index, 1);
//     }

//     userSelections[currentUserId] = selections;
//     localStorage.setItem('giftUserSelections', JSON.stringify(userSelections));

    
//     initializeInventory();
//     renderGiftCards();
// }

// ---------------------------
// wishlist.js
// ---------------------------

async function saveUserSelection(giftId, quantity) {
  if (!isUserLoggedIn) return;

  // === 1️⃣ Guardar en localStorage ===
  let selections = userSelections[currentUserId] || [];
  const index = selections.findIndex(s => s.giftId === giftId);

  if (quantity > 0) {
    if (index > -1) {
      selections[index].quantity = quantity;
    } else {
      selections.push({ giftId, quantity });
    }
  } else if (index > -1) {
    selections.splice(index, 1);
  }

  userSelections[currentUserId] = selections;
  localStorage.setItem('giftUserSelections', JSON.stringify(userSelections));

  // === 2️⃣ Validar y actualizar en Supabase ===
  const gift = await getGiftById(giftId);
  if (!gift) return;

  const { required, selected } = gift;

  if (quantity > required) {
    console.warn(`⚠️ Límite alcanzado: ${quantity}/${required}. Se ajusta al máximo.`);
    quantity = required;

    if (index > -1) selections[index].quantity = required;
    else selections.push({ giftId, quantity: required });

    userSelections[currentUserId] = selections;
    localStorage.setItem('giftUserSelections', JSON.stringify(userSelections));
  }

  if (quantity === selected) {
    console.log(`🔸 Regalo ${giftId} ya está sincronizado (${quantity}/${required}).`);
    return;
  }

  // ✅ Actualizar en Supabase
  const ok = await updateGiftSelected(giftId, quantity);
  if (!ok) return;

  console.log(`✅ Regalo ${giftId} actualizado correctamente (${quantity}/${required})`);

  // === 3️⃣ Refrescar vista ===
  initializeInventory();
  renderGiftCards();
}



function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
}

function renderGiftCards() {
    const container = document.getElementById('giftCardsContainer');
    container.innerHTML = giftInventory.map(gift => {
        const claimedText = gift.isFullyClaimed ? 
            `<span class="text-sm font-bold text-red-600">¡Agotado!</span>` : 
            `<span class="text-sm font-bold text-gray-700">${gift.available}</span> disponibles`;

        const disabledClass = gift.isFullyClaimed ? 'card-disabled' : 'hover:shadow-lg hover-bounce';
        const userSelectionText = gift.userSelected > 0 ? 
            `<p class="text-xs font-bold text-blue-600 mt-1">Tú elegiste: ${gift.userSelected}</p>` : '';
        
        return `
        <div class="bg-white rounded-xl shadow-md p-3 text-center transition ${disabledClass}">
            <img src="${gift.img}" alt="${gift.title}" onerror="this.onerror=null; this.src='../img/assets/imagen-no-disponible.jpg';" alt="Descripción de la imagen" class="w-full h-24 object-cover rounded-md mb-2 mx-auto" />
            <h3 class="font-bold text-sm text-gray-900 truncate" title="${gift.title}">${gift.title}</h3>
            <p class="text-xs text-gray-500 mb-2">Deseamos: ${gift.required}</p>
            ${claimedText}
            ${userSelectionText}
            <button 
                onclick="openGiftModal('${gift.id}')" 
                class="mt-3 w-full bg-[#E21B23] text-white text-xs font-semibold py-2 rounded-full transition hover:bg-red-700">
                Ver Detalle
            </button>
        </div>
        `;
    }).join('');
}

// --- FUNCIÓN DE SCROLL y MAPA (Mantenida) ---
let mapInitialized = false;
let geolocated = false;

function scrollToMapAndInitialize() {
    // 2. Si la geolocalización no se ha iniciado, iniciarla
    if (!geolocated) {
        getLocationAndNavigate();
        geolocated = true; // Previene múltiples intentos de geolocalización
        
    } else {
        // Si ya se inicializó, simplemente forzar el redibujado del mapa
        if(mapInstance){
        mapInstance.invalidateSize(true);
        showError(0)
        }
    }
}

// --- CÓDIGO COUNTDOWN ---
const countdownDate = new Date("December 13, 2025 15:00:00").getTime();

const updateCountdown = setInterval(function() {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("countdown-days").innerText = String(days).padStart(2, '0');
    document.getElementById("countdown-hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("countdown-minutes").innerText = String(minutes).padStart(2, '0');
    document.getElementById("countdown-seconds").innerText = String(seconds).padStart(2, '0');

    if (distance < 0) {
        clearInterval(updateCountdown);
        document.getElementById("countdownTimer").innerHTML = "<div class='text-2xl font-bold text-red-600'>¡Es hoy! ¡Felicidades!</div>";
    }
}, 1000);


// --- CÓDIGO LEAFLET Y MAPA ---

const DESTINO_COORDENADAS = [19.710088, -101.225562];
const GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${DESTINO_COORDENADAS[0]},${DESTINO_COORDENADAS[1]}`;
const salon = { lat: DESTINO_COORDENADAS[0], lng: DESTINO_COORDENADAS[1] };
// Se mantiene tu URL local para el pin
const BABY_ICON_URL = './img/assets/pin-baby.png'; 

let mapInstance = null; 
let routingControl = null;
const geocoder = L.Control.Geocoder.nominatim();

const distanceEl = document.getElementById('distance');
const userAddressSpan = document.getElementById('user-address');
const statusMessage = document.getElementById('status-message');

// Definición del ícono de bebé
const babyIcon = L.icon({
    iconUrl: BABY_ICON_URL, 
    iconSize: [45, 45], 
    iconAnchor: [22, 45], 
    popupAnchor: [0, -45] 
});


function getLocationAndNavigate() {
    if (navigator.geolocation) {
        // *** TEXTO ORIGINAL RESTAURADO ***
        statusMessage.innerText = "Buscando tu ubicación... Por favor, acepta el permiso si es solicitado."; 
        userAddressSpan.innerText = "Detectando...";
        
        navigator.geolocation.getCurrentPosition(
            showPosition, 
            showError,    
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        statusMessage.innerText = "Tu navegador no soporta la geolocalización.";
        showError({ code: 99, message: "Geolocation not supported" });
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const ORIGEN_COORDENADAS = [lat, lon];
    const user = { lat: lat, lng: lon };

    const R = 6371;
    const dLat = (salon.lat - user.lat) * Math.PI / 180;
    const dLon = (salon.lng - user.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(user.lat*Math.PI/180) * Math.cos(salon.lat*Math.PI/180) * Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    let km = d * 1.2; 
    let time = (km / 25 * 60).toFixed(0);

    // *** TEXTO DE DISTANCIA ORIGINAL RESTAURADO ***
    if (km < 1) {
        distanceEl.innerHTML = `<span class="font-semibold">Distancia aprox. de ruta:</span> ${(km * 1000).toFixed(0)} m (~${time} min en coche).`;
    } else {
        distanceEl.innerHTML = `<span class="font-semibold">Distancia aprox. de ruta:</span> ${km.toFixed(1)} km (~${time} min en coche).`;
    }
    
    // *** TEXTO ORIGINAL RESTAURADO ***
    statusMessage.innerText = "Ubicación detectada. Obteniendo tu dirección legible y calculando ruta..."; 
    const NOMINATIM_URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`; 

    fetch(NOMINATIM_URL)
        .then(response => {
            if (!response.ok) { throw new Error(`Error HTTP: ${response.status}`); }
            return response.json();
        })
        .then(data => {
            let userAddress = data.display_name || "Dirección no disponible.";
            userAddressSpan.innerText = userAddress;
            initializeMapAndRoute(ORIGEN_COORDENADAS);

            // Nota: El listener de 'routeselected' se mantiene dentro de initializeMapAndRoute
        })
        .catch(error => {
            statusMessage.innerText = `⚠️ Error en geocodificación. Se mostrarán coordenadas.`;
            userAddressSpan.innerText = `(Coordenadas: ${lat}, ${lon})`;
            initializeMapAndRoute(ORIGEN_COORDENADAS);
        });
}

// === FUNCIONES DE MAPA MODIFICADAS para inyectar botón en lugar de modal ===

function showError(error) {
    const statusMessage = document.getElementById('status-message');
    const userAddressSpan = document.getElementById('user-address');
    
    userAddressSpan.style.color = 'red';
    distanceEl.innerHTML = `<span class="font-semibold">Distancia aprox. de ruta:</span> Desconocida.`;

    // Contenido del mensaje de error, que ahora incluye el botón de Google Maps
    let errorMessage = "❌ No se pudo obtener tu ubicación. Se muestra el lugar de la fiesta.";
    
    if (error.code === error.PERMISSION_DENIED) {
        errorMessage = "❌ Permiso de ubicación denegado. Se muestra el lugar de la fiesta.";
    } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = "❌ Ubicación no disponible. Se muestra el lugar de la fiesta.";
    } else if (error.code === 99) {
        // Navegador no soporta Geolocalización
        errorMessage = "❌ Tu navegador no soporta la geolocalización. Se muestra el lugar de la fiesta.";
    }


    // INSERCIÓN DEL BOTÓN EN EL DIV DE MENSAJE DE ESTADO (Solución al modal)
    statusMessage.innerHTML = `
        <div class="p-3 border border-red-300 bg-red-50 rounded-lg text-red-800 text-center">
            ${errorMessage}
            <a href="${GOOGLE_MAPS_URL}" target="_blank" class="block mt-3 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg transition hover:bg-blue-700">
                Ir a Google Maps y ver como llegar
            </a>
        </div>
    `;
    userAddressSpan.innerText = "Ruta no disponible.";
    
    // En todos los casos de error, inicializar el mapa solo al punto de destino
    initializeMapOnly(DESTINO_COORDENADAS);
}

// Función para inicializar el mapa solo con el marcador de destino (para casos de error e inicio)
function initializeMapOnly(coords) {
    if (mapInstance === null) {
        mapInstance = L.map('map').setView(coords, 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 19,
        }).addTo(mapInstance);
    } else {
        mapInstance.setView(coords, 13);
        // Limpiar cualquier control de ruta anterior
        if (routingControl) {
            mapInstance.removeControl(routingControl);
            routingControl = null;
        }
        // Limpiar todos los marcadores y polilíneas
        mapInstance.eachLayer(function (layer) {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                mapInstance.removeLayer(layer);
            }
        });
    }

    L.marker(coords, { icon: babyIcon }).addTo(mapInstance)
        .bindPopup("<b>¡Baby Shower de Leonardo! 🎩🥳</b>")
        .openPopup();
    
    mapInstance.invalidateSize(true);
}

// Función para inicializar el mapa con la ruta (para casos de éxito)
function initializeMapAndRoute(originCoords) {
    if (mapInstance === null) {
        mapInstance = L.map('map').setView(originCoords, 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            maxZoom: 19,
        }).addTo(mapInstance);
    } else {
        mapInstance.setView(originCoords, 13);
        // Limpiar cualquier control de ruta anterior
        if (routingControl) mapInstance.removeControl(routingControl);
        // Limpiar marcadores que no sean de la ruta (como el marcador individual de la fiesta)
        mapInstance.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                mapInstance.removeLayer(layer);
            }
            if (layer instanceof L.Polyline) { // Limpia rutas anteriores
                mapInstance.removeLayer(layer);
            }
        });
    }


    // Configuración del control de ruta
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(originCoords[0], originCoords[1]), 
            L.latLng(DESTINO_COORDENADAS[0], DESTINO_COORDENADAS[1])
        ],
        geocoder: geocoder, 
        language: 'es',
        showAlternatives: false, // Quitar rutas alternativas
        collapsible: true, // Hacer el panel colapsable
        collapsed: true, // Iniciar el panel en estado colapsado (Minimizado)
        // CREACIÓN DE MARCADORES PERSONALIZADA
        createMarker: function(i, waypoint, n) {
            // i=0 es el punto de inicio, i=n-1 es el punto final
            if (i === 0) { // Punto de inicio (Usuario)
                return L.marker(waypoint.latLng, { icon: babyIcon, draggable: true })
                    .bindPopup("<b>¡Tú estás aquí!</b>");
            } else if (i === n - 1) { // Punto de destino (Fiesta)
                return L.marker(waypoint.latLng, { icon: babyIcon })
                    .bindPopup("<b>¡Baby Shower de Leonardo! 🎩🥳</b>").openPopup();
            }
            return L.marker(waypoint.latLng); // Marcador por defecto para puntos intermedios
        },
        lineOptions: { styles: [{ color: '#E21B23', weight: 6 }] } 
    }).addTo(mapInstance);
    
    // Asegurar que el mapa se ajuste a la ruta y que el mensaje se actualice.
    routingControl.on('routeselected', function(e) {
        const bounds = L.latLngBounds(e.route.coordinates);
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
        // *** TEXTO ORIGINAL RESTAURADO EN EVENTO DE RUTA ***
        statusMessage.innerText = "Ruta para llegar al evento. ¡Tú estás aquí!";
    });

    mapInstance.invalidateSize(true);
}

// --- CÓDIGO DE ESTILO Y EFECTOS ---

const snow = document.getElementById('snow');
const ctx = snow.getContext('2d');
let W, H, flakes = [];
const FLAKES = 140;
function resizeSnow(){ W = snow.width = window.innerWidth; H = snow.height = window.innerHeight; }
window.addEventListener('resize', resizeSnow); resizeSnow();
function makeFlakes(){ flakes = Array.from({length: FLAKES}, () => ({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*2+0.5, s: Math.random()*0.8+0.2, drift: (Math.random()-.5)*0.8 })); }
makeFlakes();
(function loop(){ ctx.clearRect(0,0,W,H); for(const f of flakes){ ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill(); f.y += f.s; f.x += f.drift; if(f.y>H){ f.y = -5; f.x = Math.random()*W; } } requestAnimationFrame(loop); })();

const hatContainer = document.getElementById('hatContainer');
const svgHat = hatContainer.querySelector('svg');

function shakeHat() {
svgHat.classList.add('animate-[wiggle_1.8s_ease-in-out]');
setTimeout(() => svgHat.classList.remove('animate-[wiggle_1.8s_ease-in-out]'), 1800);
}
setInterval(shakeHat, 2000); 

// LÓGICA DE CARGA AUTOMÁTICA FINAL
document.addEventListener('DOMContentLoaded', () => {
initializeInventory();
renderGiftCards();
// Inicializa el mapa solo para mostrar el salón con los mensajes originales
distanceEl.innerText = "";
userAddressSpan.innerText = "";

// *** TEXTO ORIGINAL RESTAURADO AL INICIO ***
statusMessage.innerText = "El mapa muestra el lugar de la fiesta. Haz clic en el botón para calcular tu ruta.";

initializeMapOnly(DESTINO_COORDENADAS); 
});


      /**
     * Aplica un fondo al body de la página basado en la hora local: Día, Tarde o Noche.
     */
    
        
        /**
         * Detecta la hora actual y aplica un fondo de degradado al body 
         * para simular Día, Tarde o Noche.
         */
function aplicarFondoPorHora() {
    const now = new Date();
    const hour = now.getHours();
    let backgroundStyle = '';

    // --- 1. Definición de Rangos y Estilos ---
    
    // Mañana/Día: 5:00 a 11:59 (Tu estilo de cielo azul)
    if (hour >= 5 && hour < 12) {
        backgroundStyle = `
            radial-gradient(1200px 600px at 10% 10%, rgba(94,200,248,0.35), transparent),
            radial-gradient(900px 500px at 90% 20%, rgba(0,183,211,0.18), transparent),
            linear-gradient(to bottom, #5EC8F8, #BDEAFF)
        `;
    } 
    
    // Tarde: 12:00 a 18:59 (Atardecer Suave: Rojizo fundiéndose en tu azul)
    else if (hour >= 12 && hour < 19) {
        backgroundStyle = `
            radial-gradient(1000px 500px at 50% 15%, rgba(255,100,50,0.7), transparent), 
            radial-gradient(1200px 600px at 10% 90%, rgba(100,0,150,0.15), transparent),
            linear-gradient(to bottom, #8B0000 0%, #FF4500 30%, #5EC8F8 60%, #BDEAFF 100%)
        `;
    } 
    
    // Noche: 19:00 a 4:59 (Negro sutil y profundo, evitando el negro total)
    else {
        backgroundStyle = `
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08), transparent),
            radial-gradient(circle at 20% 80%, rgba(50, 50, 100, 0.15), transparent),
            linear-gradient(to bottom, #00000A, #191970) /* Negro muy oscuro a azul medianoche */
        `;
    }

    // --- 2. Aplicar los estilos al body ---
    const body = document.body;
    body.style.background = backgroundStyle;
    body.style.backgroundAttachment = 'fixed';
    body.style.margin = '0'; 
    body.style.minHeight = '100vh'; 
    body.style.color = (hour >= 5 && hour < 19) ? '#333' : '#FFF'; // Texto blanco para la noche
}

// --- 3. Ejecución Automática ---

// 1. Llama a la función inmediatamente al cargar la página para aplicar el color inicial.
document.addEventListener('DOMContentLoaded', aplicarFondoPorHora);


function aplicarEstilosContenedorLeaflet() {
    const controlContainer = document.querySelector('.leaflet-top.leaflet-right');
    const controlContainer2 = document.querySelector('.leaflet-top.leaflet-right');
    
    if (controlContainer) {
        
        controlContainer.style.display = 'none';
        
    } else {
        console.warn("El contenedor '.leaflet-top.leaflet-right' no fue encontrado.");
    }

        if (controlContainer2) {
        
        controlContainer2.style.display = 'none';
        
    } else {
        console.warn("El contenedor '.leaflet-top.leaflet-right' no fue encontrado.");
    }
}

setInterval(aplicarFondoPorHora, 60000);
scrollToMapAndInitialize()

let miIntervalo;
const DURACION_INTERVALO_MS = 500;
const DURACION_TOTAL_MS = 1500; 

function tareaDelIntervalo() {
    // Coloca aquí el código que quieres que se ejecute repetidamente.
    // Por ejemplo, puedes cambiar un color o verificar una condición.
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtén el botón usando su ID
    const mapsButton = document.getElementById('btn-maps');
    const mapsButton2 = document.getElementById('btn-maps2');

    // La dirección del destino, codificada para URL (espacios por +)
    const destinoCodificado = "Salón+De+Fiestas+Cantoya+en+Joaquín+de+La+Cantoya+y+Rico+100,+Jardines+de+Guadalupe,+58140+Morelia,+Mich.";

    // 2. Construye el URL de Indicaciones (Directions)
    // El formato 'daddr=' indica el destino. Si 'saddr=' (origen) se omite, Maps
    // asume que el origen es la ubicación actual del usuario.
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinoCodificado}`;

    // 3. Agrega el escuchador de eventos
    if (mapsButton) {
        mapsButton.addEventListener('click', () => {
            // Abre el URL de indicaciones en una nueva pestaña
            window.open(directionsUrl, '_blank');
        });
    }

      if (mapsButton2) {
        mapsButton2.addEventListener('click', () => {
            // Abre el URL de indicaciones en una nueva pestaña
            window.open(directionsUrl, '_blank');
        });
    }
});

window.onload = () => {
    miIntervalo = setInterval(tareaDelIntervalo, DURACION_INTERVALO_MS);
    setTimeout(() => {
        if (miIntervalo) {
            clearInterval(miIntervalo);
            aplicarEstilosContenedorLeaflet();
            miIntervalo = null; 
        }
    }, DURACION_TOTAL_MS); 
};



// --- FUNCIONES MODULARES PARA EL LOADER ---
const loaderElement = document.getElementById('loader');

/**
 * Muestra el loader fullscreen.
 * Útil si necesitas mostrarlo en algún evento específico.
 */
window.showLoader = function() {
    if (loaderElement) {
        loaderElement.classList.remove('loader-hidden');
    }
}

/**
 * Oculta el loader fullscreen mediante una transición suave.
 * Esta es la función principal que se llama al terminar de cargar la página.
 */
window.hideLoader = function() {
    if (loaderElement) {
        loaderElement.classList.add('loader-hidden');
        // Opcional: Eliminar el elemento del DOM después de la transición 
        // para que no interfiera (aunque con visibility: hidden ya es suficiente).
        // setTimeout(() => {
        //      loaderElement.style.display = 'none'; 
        // }, 600); 
    }
}
// --- FIN FUNCIONES MODULARES PARA EL LOADER ---


window.addEventListener('load', function() {
    window.hideLoader();
});