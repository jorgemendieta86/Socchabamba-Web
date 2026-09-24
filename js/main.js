/* ============================================
   CARRUSEL HERO
   ============================================ */
const carouselSlides = document.querySelectorAll('.carousel-slide');
const carouselDots = document.querySelectorAll('.carousel-indicators .dot');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let currentSlide = 0;
let carouselInterval;

function showSlide(index) {
    carouselSlides.forEach(slide => slide.classList.remove('active'));
    carouselDots.forEach(dot => dot.classList.remove('active'));

    currentSlide = (index + carouselSlides.length) % carouselSlides.length;
    carouselSlides[currentSlide].classList.add('active');
    carouselDots[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function startCarousel() {
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarousel() {
    clearInterval(carouselInterval);
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        stopCarousel();
        prevSlide();
        startCarousel();
    });

    nextBtn.addEventListener('click', () => {
        stopCarousel();
        nextSlide();
        startCarousel();
    });
}

carouselDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        stopCarousel();
        showSlide(index);
        startCarousel();
    });
});

startCarousel();

/* ============================================
   MENÚ HAMBURGUESA
   ============================================ */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/* ============================================
   HEADER SCROLL EFFECT
   ============================================ */
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

/* ============================================
   NAVEGACIÓN ACTIVA SEGÚN SCROLL
   ============================================ */
const sections = document.querySelectorAll('.section, .hero-carousel');
const navItems = document.querySelectorAll('.nav-menu a:not(.btn-contacto)');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === '#' + current) {
            item.classList.add('active');
        }
    });
});

/* ============================================
    ACTIVIDADES - MOSTRAR/OCULTAR GALERÍAS
    ============================================ */
function showActivity(id) {
    const grid = document.getElementById('activities-grid');
    const detail = document.getElementById('activity-' + id);
    if (grid) grid.style.display = 'none';
    if (detail) {
        detail.classList.add('active');
        detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function hideActivity(id) {
    const grid = document.getElementById('activities-grid');
    const detail = document.getElementById('activity-' + id);
    if (detail) detail.classList.remove('active');
    if (grid) grid.style.display = 'grid';
}

function openGallery(activityId) {
    openLightboxAt(activityId, 0);
}

function sortActivityCardsByDate() {
    const grid = document.getElementById('activities-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.activity-card'));
    if (!cards.length) return;

    cards.sort((a, b) => {
        const dateA = Date.parse(a.dataset.date || '1970-01-01');
        const dateB = Date.parse(b.dataset.date || '1970-01-01');
        return dateB - dateA;
    });

    cards.forEach(card => grid.appendChild(card));
}

document.addEventListener('DOMContentLoaded', () => {
    sortActivityCardsByDate();
});

/* ============================================
    LIGHTBOX GALERÍA POR ACTIVIDAD
    ============================================ */
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-nav.prev');
const lightboxNext = document.querySelector('.lightbox-nav.next');
let lightboxIndex = 0;
let lightboxImages = [];

const reinadoImages = [
    'img/REYNADO/20260917_140200.webp',
    'img/REYNADO/20260917_132333.webp',
    'img/REYNADO/20260917_132428.webp',
    'img/REYNADO/20260917_132441.webp',
    'img/REYNADO/20260917_134746.webp',
    'img/REYNADO/20260917_134809.webp',
    'img/REYNADO/20260917_135122.webp',
    'img/REYNADO/20260917_135131.webp',
    'img/REYNADO/20260917_135345.webp',
    'img/REYNADO/20260917_135346.webp',
    'img/REYNADO/20260917_135719.webp',
    'img/REYNADO/20260917_135723.webp',
    'img/REYNADO/20260917_135728(0).webp',
    'img/REYNADO/20260917_135728.webp',
    'img/REYNADO/20260917_135822.webp',
    'img/REYNADO/20260917_135829.webp',
    'img/REYNADO/20260917_135836.webp',
    'img/REYNADO/20260917_135941.webp',
    'img/REYNADO/20260917_135951.webp',
    'img/REYNADO/20260917_135955.webp',
    'img/REYNADO/20260917_140000.webp',
    'img/REYNADO/20260917_140044.webp',
    'img/REYNADO/20260917_140133.webp',
    'img/REYNADO/20260917_140238.webp',
    'img/REYNADO/20260917_140317.webp',
    'img/REYNADO/20260917_140321.webp',
    'img/REYNADO/20260917_140423.webp',
    'img/REYNADO/20260917_140431.webp',
    'img/REYNADO/20260917_140919.webp',
    'img/REYNADO/20260917_142033.webp',
    'img/REYNADO/20260917_142039.webp',
    'img/REYNADO/20260917_142044.webp',
    'img/REYNADO/20260917_142348.webp',
    'img/REYNADO/20260917_142353.webp',
    'img/REYNADO/20260917_142401.webp',
    'img/REYNADO/20260917_142403.webp',
    'img/REYNADO/20260917_142830.webp',
    'img/REYNADO/20260917_142834.webp',
    'img/REYNADO/20260917_142839.webp',
    'img/REYNADO/20260917_143520.webp',
    'img/REYNADO/20260917_143521.webp',
    'img/REYNADO/20260917_143536.webp',
    'img/REYNADO/20260917_144024.webp',
    'img/REYNADO/20260917_144942.webp',
    'img/REYNADO/20260917_145005.webp',
    'img/REYNADO/20260917_145036.webp',
    'img/REYNADO/20260917_145834.webp',
    'img/REYNADO/20260917_145835.webp',
    'img/REYNADO/20260917_150833(0).webp',
    'img/REYNADO/20260917_150833.webp',
    'img/REYNADO/20260917_151258.webp',
    'img/REYNADO/20260917_152623.webp',
    'img/REYNADO/20260917_152651.webp',
    'img/REYNADO/20260917_152912.webp',
    'img/REYNADO/20260917_153355.webp',
    'img/REYNADO/20260917_153401(0).webp',
    'img/REYNADO/20260917_153401.webp',
    'img/REYNADO/20260917_153405.webp',
    'img/REYNADO/20260917_153406.webp',
    'img/REYNADO/20260917_153419.webp',
    'img/REYNADO/20260917_153424.webp',
    'img/REYNADO/20260917_153425.webp',
    'img/REYNADO/20260917_153432.webp',
    'img/REYNADO/20260917_153446.webp',
    'img/REYNADO/20260917_153447.webp'
];

const primaveraImages = [
    'img/primavera/20260923_091205.webp', 'img/primavera/20260923_091230.webp', 'img/primavera/20260923_091300.webp',
    'img/primavera/20260923_100505.webp', 'img/primavera/20260923_100549.webp', 'img/primavera/20260923_100925.webp',
    'img/primavera/20260923_101457.webp', 'img/primavera/20260923_101544.webp', 'img/primavera/20260923_102242.webp',
    'img/primavera/20260923_102419.webp', 'img/primavera/20260923_102508.webp', 'img/primavera/20260923_102534.webp',
    'img/primavera/20260923_103009.webp', 'img/primavera/20260923_103425.webp', 'img/primavera/20260923_104654.webp',
    'img/primavera/20260923_104736.webp', 'img/primavera/20260923_105557.webp', 'img/primavera/20260923_105630.webp',
    'img/primavera/20260923_105646.webp', 'img/primavera/20260923_105742.webp', 'img/primavera/20260923_110555.webp',
    'img/primavera/20260923_110656.webp', 'img/primavera/20260923_111549.webp', 'img/primavera/20260923_111701.webp',
    'img/primavera/20260923_111817.webp', 'img/primavera/20260923_113122.webp', 'img/primavera/20260923_113615.webp',
    'img/primavera/20260923_113618.webp', 'img/primavera/20260923_114025.webp', 'img/primavera/20260923_114054.webp',
    'img/primavera/20260923_114525.webp', 'img/primavera/20260923_114715.webp', 'img/primavera/20260923_115034.webp',
    'img/primavera/20260923_115445.webp', 'img/primavera/20260923_120615.webp', 'img/primavera/20260923_121617.webp',
    'img/primavera/20260923_122143.webp', 'img/primavera/20260923_122157.webp', 'img/primavera/20260923_122226.webp',
    'img/primavera/20260923_122248.webp', 'img/primavera/20260923_122524.webp', 'img/primavera/20260923_122603.webp',
    'img/primavera/20260923_123505.webp', 'img/primavera/20260923_123922.webp', 'img/primavera/20260923_130218.webp',
    'img/primavera/20260923_130238.webp', 'img/primavera/20260923_131924.webp', 'img/primavera/20260923_142225.webp',
    'img/primavera/20260923_142330.webp', 'img/primavera/20260923_142423.webp', 'img/primavera/20260923_144233.webp',
    'img/primavera/20260923_144428.webp', 'img/primavera/20260923_144741.webp', 'img/primavera/20260923_150646.webp',
    'img/primavera/20260923_151750.webp', 'img/primavera/20260923_151800.webp', 'img/primavera/20260923_151814.webp',
    'img/primavera/20260923_152223.webp', 'img/primavera/20260923_153246.webp', 'img/primavera/20260923_153401.webp',
    'img/primavera/20260923_153507.webp', 'img/primavera/20260923_153601.webp', 'img/primavera/20260923_153612.webp',
    'img/primavera/20260923_153735.webp', 'img/primavera/20260923_153742.webp', 'img/primavera/20260923_153743.webp',
    'img/primavera/20260923_153815.webp', 'img/primavera/20260923_153826.webp', 'img/primavera/20260923_153834.webp',
    'img/primavera/20260923_153905.webp', 'img/primavera/20260923_153925.webp', 'img/primavera/20260923_153937.webp',
    'img/primavera/20260923_153944.webp', 'img/primavera/20260923_153950.webp', 'img/primavera/20260923_153959.webp',
    'img/primavera/20260923_154009.webp', 'img/primavera/20260923_154443.webp'
];

// Definir las imágenes de cada actividad
const activityGalleries = {
    'juegos-escolares': (function() {
        const imgs = [];
        const featured = 'img/actividades/20260424_085156.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-juegos-escolares .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'dia-madre-2026': (function() {
        const imgs = [];
        const featured = 'img/madre/WhatsApp Image 2026-05-08 at 11.14.20 AM.jpeg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-dia-madre-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'inicio-semana-academica-2026': (function() {
        const imgs = [];
        const featured = 'img/11 DE MAYO/photo_2026-05-11_08-39-19.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-inicio-semana-academica-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'semana-academica-dia-familia-2026': (function() {
        const imgs = [];
        const featured = 'img/mayo 18/photo_1_2026-05-18_09-24-12.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-semana-academica-dia-familia-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'mes-mariano-2026': (function() {
        const imgs = [];
        const featured = 'img/Mes Mariano/20 mayo/photo_2026-05-20_17-08-03.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-mes-mariano-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'taller-escuela-familia-2026': (function() {
        const imgs = [];
        const featured = 'img/Escuela familia/20260521_094332.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-taller-escuela-familia-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'manana-deportiva-2026': (function() {
        const imgs = [];
        const featured = 'img/manana-deportiva/photo_2026-05-26_09-49-39.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-manana-deportiva-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'simulacro-nacional-2026': (function() {
        const imgs = [];
        const featured = 'img/simulacro/20260529_093044.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-simulacro-nacional-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'dia-padre-2026': (function() {
        const imgs = [];
        const featured = 'img/Padre/photo_1_2026-07-07_18-14-08.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-dia-padre-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'dia-maestro-2026': (function() {
        const imgs = [];
        const featured = 'img/Maestros/photo_2_2026-07-07_18-15-15.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-dia-maestro-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'onem-2026': (function() {
        const imgs = [];
        const featured = 'img/Onem/photo_1_2026-07-08_17-05-15.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-onem-2026 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'aniversario-42': (function() {
        const imgs = [];
        const featured = 'img/Aniversario/photo_16_2026-07-09_18-00-34.jpg';
        imgs.push(featured);
        const galleryImgs = document.querySelectorAll('#activity-aniversario-42 .gallery-item img');
        galleryImgs.forEach(img => imgs.push(img.src));
        return imgs;
    })(),
    'semana-patriotica-205': (function() {
        return [
            'img/Independencia/20260723_090722.webp',
            'img/Independencia/20260723_095557.webp',
            'img/Independencia/20260723_121534.webp',
            'img/Independencia/20260723_123354.webp',
            'img/Independencia/20260723_123458.webp',
            'img/Independencia/20260723_134724.webp'
        ];
    })(),
    'berbena-virgen-fatima-2026': (function() {
        return [
            'img/berbena/berbena-18.webp',
            'img/berbena/berbena-17.webp',
            'img/berbena/berbena-16.webp',
            'img/berbena/berbena-15.webp',
            'img/berbena/berbena-14.webp',
            'img/berbena/berbena-13.webp',
            'img/berbena/berbena-12.webp',
            'img/berbena/berbena-11.webp',
            'img/berbena/berbena-10.webp',
            'img/berbena/berbena-07.webp',
            'img/berbena/berbena-09.webp',
            'img/berbena/berbena-08.webp',
            'img/berbena/berbena-06.webp',
            'img/berbena/berbena-05.webp',
            'img/berbena/berbena-04.webp',
            'img/berbena/berbena-03.webp',
            'img/berbena/berbena-02.webp',
            'img/berbena/berbena-01.webp'
        ];
    })(),
    'reinado-primavera-2026': reinadoImages,
    'celebracion-primavera-2026': primaveraImages,
    'eureka-2026': (function() {
        return [
            'img/Eureka/photo_1_2026-08-27_12-21-40.webp',
            'img/Eureka/photo_2_2026-08-27_12-21-40.webp',
            'img/Eureka/photo_3_2026-08-27_12-21-40.webp',
            'img/Eureka/photo_4_2026-08-27_12-21-40.webp',
            'img/Eureka/photo_5_2026-08-27_12-21-40.webp',
            'img/Eureka/photo_6_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_7_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_8_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_9_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_10_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_11_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_12_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_13_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_14_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_15_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_16_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_17_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_18_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_19_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_20_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_21_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_22_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_23_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_24_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_25_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_26_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_27_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_28_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_29_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_30_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_31_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_32_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_33_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_34_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_35_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_36_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_37_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_38_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_39_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_40_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_41_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_42_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_43_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_44_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_45_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_46_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_47_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_48_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_49_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_50_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_51_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_52_2026-08-27_12-21-41.webp',
            'img/Eureka/photo_53_2026-08-27_12-21-41.webp'
        ];
    })()
};

function renderReinadoGallery() {
    const grid = document.getElementById('reinado-gallery-grid');
    if (!grid) return;

    reinadoImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.addEventListener('click', () => openLightboxAt('reinado-primavera-2026', index));

        const image = document.createElement('img');
        image.src = src;
        image.alt = `Reinado de la Primavera 2026 - imagen ${index + 1}`;
        image.loading = 'lazy';
        item.appendChild(image);
        grid.appendChild(item);
    });
}

renderReinadoGallery();

function renderPrimaveraGallery() {
    const grid = document.getElementById('primavera-gallery-grid');
    if (!grid) return;

    primaveraImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.addEventListener('click', () => openLightboxAt('celebracion-primavera-2026', index));

        const image = document.createElement('img');
        image.src = src;
        image.alt = `Celebración de la Primavera 2026 - imagen ${index + 1}`;
        image.loading = 'lazy';
        item.appendChild(image);
        grid.appendChild(item);
    });
}

renderPrimaveraGallery();

function openLightboxAt(activityId, index) {
    lightboxImages = activityGalleries[activityId] || [];
    lightboxIndex = index;
    lightboxImg.src = lightboxImages[index];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openLightbox(src) {
    lightboxImages = [src];
    lightboxIndex = 0;
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
}

if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => {
        if (lightboxImages.length <= 1) return;
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
        if (lightboxImages.length <= 1) return;
        lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
    });
}

document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
});

/* ============================================
   ANIMACIONES SCROLL (FADE IN)
   ============================================ */
const fadeElements = document.querySelectorAll('.fade-in');

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

fadeElements.forEach(el => observer.observe(el));

/* ============================================
    POPUP REFORZAMIENTO ARITMÉTICO
    ============================================ */
const popupOverlay = document.getElementById('refuerzo-popup');
const popupClose = document.getElementById('popup-close');

function showPopup() {
    if (popupOverlay) {
        popupOverlay.classList.remove('hidden');
    }
}

function hidePopup() {
    if (popupOverlay) {
        popupOverlay.classList.add('hidden');
    }
}

if (popupOverlay) {
    showPopup();
    setTimeout(() => {
        popupOverlay.classList.add('fading');
    }, 5000);
    setTimeout(hidePopup, 7000);
}

if (popupClose) {
    popupClose.addEventListener('click', hidePopup);
}

if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) hidePopup();
    });
}

/* ============================================
    CONTACTO FORM
    ============================================ */
const contactoForm = document.querySelector('.contacto-form form');

if (contactoForm) {
    contactoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = contactoForm.querySelector('input[name="nombre"]').value;
        const email = contactoForm.querySelector('input[name="email"]').value;
        const mensaje = contactoForm.querySelector('textarea[name="mensaje"]').value;

        if (!nombre || !email || !mensaje) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        alert('¡Gracias por su mensaje, ' + nombre + '! Nos pondremos en contacto pronto.');
        contactoForm.reset();
    });
}
