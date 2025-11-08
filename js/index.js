// **CONFIGURACIÓN**
const WISH_LIST_URL = './wishlist.html'; 
const targetDate = new Date("December 13, 2025 15:00:00").getTime(); 

// FUNCIÓN PARA EL FONDO DINÁMICO
function aplicarFondoPorHora() {
    const now = new Date();
    const hour = now.getHours();
    let backgroundStyle = '';
    
    if (hour >= 5 && hour < 19) { 
        backgroundStyle = `
            radial-gradient(1200px 600px at 10% 10%, rgba(94,200,248,0.35), transparent),
            radial-gradient(900px 500px at 90% 20%, rgba(0,183,211,0.18), transparent),
            linear-gradient(to bottom, #BDEAFF, #FFFFFF)
        `;
    } 
    else {
        backgroundStyle = `
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08), transparent),
            radial-gradient(circle at 20% 80%, rgba(50, 50, 100, 0.15), transparent),
            linear-gradient(to bottom, #00000A, #000033)
        `;
    }

    const body = document.body;
    body.style.background = backgroundStyle;
    body.style.backgroundAttachment = 'fixed';
    body.style.margin = '0'; 
    body.style.minHeight = '100vh'; 
    body.style.color = (hour >= 5 && hour < 19) ? '#333' : '#FFF'; 

    const headerTitle = document.getElementById('title-anim');
    const headerSubtitle = document.getElementById('subtitle-anim');
    if (headerTitle && headerSubtitle) {
        headerSubtitle.style.color = '#4B5563'; 
    }
}

// FUNCIÓN PARA LA CUENTA REGRESIVA
const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById("countdown-anim").innerHTML = "<p class='font-gato text-3xl text-red-600'>¡EL BABY SHOWER ES HOY! 🥳</p>";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").innerHTML = String(days).padStart(2, '0');
    document.getElementById("hours").innerHTML = String(hours).padStart(2, '0');
    document.getElementById("minutes").innerHTML = String(minutes).padStart(2, '0');
    document.getElementById("seconds").innerHTML = String(seconds).padStart(2, '0');
}

// FUNCIÓN PARA EL BOTÓN MÁGICO
function verListaDeseos() {
    window.location.href = WISH_LIST_URL;
}

// CONTROL DE INICIO
document.addEventListener('DOMContentLoaded', () => {
    aplicarFondoPorHora();
    setInterval(aplicarFondoPorHora, 10000); 

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);



    document.getElementById('cat-icon-container').classList.remove('opacity-0', 'translate-y-[-50px]');
        document.getElementById('title-anim').classList.remove('scale-0');
    document.getElementById('subtitle-anim').classList.remove('opacity-0');
    document.getElementById('details-anim').classList.remove('opacity-0');
    document.getElementById('countdown-anim').classList.remove('opacity-0');
    document.getElementById('wishlist-title-anim').classList.remove('opacity-0');
    document.getElementById('magic-button-container').classList.remove('opacity-0');
});

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
    }
}
// --- FIN FUNCIONES MODULARES PARA EL LOADER ---

    window.addEventListener('load', function() {
    window.hideLoader();
});