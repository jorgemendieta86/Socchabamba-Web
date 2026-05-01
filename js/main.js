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
   LIGHTBOX GALERÍA
   ============================================ */
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxPrev = document.querySelector('.lightbox-nav.prev');
const lightboxNext = document.querySelector('.lightbox-nav.next');
let lightboxIndex = 0;
let lightboxImages = [];

// Collect all gallery images
function collectImages() {
    lightboxImages = [];
    const featuredImg = document.querySelector('.activity-featured-img img');
    if (featuredImg) {
        lightboxImages.push(featuredImg.src);
    }
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(img => {
        lightboxImages.push(img.src);
    });
}

collectImages();

function openLightboxAt(index) {
    lightboxIndex = index;
    lightboxImg.src = lightboxImages[index];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openLightbox(src) {
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
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        lightboxImg.src = lightboxImages[lightboxIndex];
    });
}

if (lightboxNext) {
    lightboxNext.addEventListener('click', () => {
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
   ANIMACIONES SCROLL (FADE IN)
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
