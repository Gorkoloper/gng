// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

let lenis;

// Initialize Lenis for Smooth Scrolling
const initLenis = () => {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{
        lenis.raf(time * 1000);
    });
    gsap.ticker.fps(60);
};

// Check if touch device
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

// Initialize Custom Cursor (only if NOT a touch device and pointer is fine)
if (!isTouchDevice && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    document.body.classList.add('has-custom-cursor');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const hoverElements = document.querySelectorAll('a, button, .z-row, .minimal-card, .gallery-item, .service-card, .founder-card, input, textarea, .team-member');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// Header Scroll Effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Logic
const initMobileMenu = () => {
    const nav = document.querySelector('nav');
    if (header && nav) {
        const hamburger = document.createElement('div');
        hamburger.classList.add('hamburger');
        hamburger.innerHTML = '<span></span><span></span><span></span>';
        header.appendChild(hamburger);

        hamburger.addEventListener('click', () => {
            nav.classList.toggle('open');
            hamburger.classList.toggle('active');
            header.classList.toggle('menu-open');
            if (nav.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
                if (typeof lenis !== 'undefined' && lenis) lenis.stop();
            } else {
                document.body.style.overflow = '';
                if (typeof lenis !== 'undefined' && lenis) lenis.start();
            }
        });

        // Close menu on link click
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                hamburger.classList.remove('active');
                header.classList.remove('menu-open');
                document.body.style.overflow = '';
                if (typeof lenis !== 'undefined' && lenis) lenis.start();
            });
        });
    }
};

// Setup active state for nav links
const setupNavLinks = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href') === currentPath) {
            a.classList.add('active');
        }
    });
};

// GSAP Animations
const animateOnScroll = () => {
    const tl = gsap.timeline();

    // Entry Animations
    if(document.querySelector('.hero-bg')) {
        tl.fromTo('.hero-bg', 
            { scale: 1.1, filter: 'brightness(0)' }, 
            { scale: 1, filter: 'brightness(0.7)', duration: 1.5, ease: 'power3.out' }
        );
    }
    
    if(document.querySelector('.hero-title span')) {
        tl.from('.hero-title span', { y: '100%', duration: 1, stagger: 0.2, ease: 'power4.out' }, "-=1");
    }

    if(document.querySelector('.hero-subtitle')) {
        tl.fromTo('.hero-subtitle', 
            { opacity: 0, y: 25 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'all' }, 
            "-=0.8"
        );
    }

    // Scroll Animations - Fast, Responsive, Independent
    if(document.querySelector('.about-text')) {
        gsap.from('.about-text h2, .about-text p, .about-text .btn', {
            scrollTrigger: { trigger: '.about', start: 'top 92%' },
            y: 25, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', clearProps: 'all'
        });
    }

    if(document.querySelector('.about-image')) {
        gsap.fromTo('.about-image', { y: '-10%' }, {
            scrollTrigger: { trigger: '.about-image-wrapper', start: 'top bottom', end: 'bottom top', scrub: true },
            y: '10%', ease: 'none'
        });
    }

    const cards = document.querySelectorAll('.z-row, .minimal-card, .gallery-item, .service-card, .founder-card, .founder-card-premium, .contact-card-premium, .process-step, .team-member, .contact-item');
    cards.forEach((card) => {
        gsap.fromTo(card, 
            { y: 30, opacity: 0 }, 
            {
                scrollTrigger: { 
                    trigger: card, 
                    start: 'top 96%',
                    toggleActions: 'play none none none'
                },
                y: 0, 
                opacity: 1, 
                duration: 0.45, 
                ease: 'power2.out',
                clearProps: 'all',
                onComplete: () => {
                    card.classList.add('ready');
                }
            }
        );
    });
};

// Lightbox Gallery Logic
const initLightbox = () => {
    const galleryItems = document.querySelectorAll('.gallery-item, .z-img-wrapper, .about-image-wrapper');
    if (galleryItems.length === 0) return;

    // Create modal structure
    const modal = document.createElement('div');
    modal.classList.add('lightbox-modal');
    modal.innerHTML = `
        <button class="lightbox-close" aria-label="Kapat">&times;</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Önceki">&#10094;</button>
        <div class="lightbox-content">
            <img src="" alt="Gallery Preview" class="lightbox-img">
        </div>
        <button class="lightbox-nav lightbox-next" aria-label="Sonraki">&#10095;</button>
        <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.lightbox-img');
    const closeBtn = modal.querySelector('.lightbox-close');
    const prevBtn = modal.querySelector('.lightbox-prev');
    const nextBtn = modal.querySelector('.lightbox-next');
    const counter = modal.querySelector('.lightbox-counter');

    let images = [];
    let currentIndex = 0;

    const setupGallery = (clickedItem) => {
        let imgElements = [];
        if (clickedItem.classList.contains('about-image-wrapper')) {
            imgElements = [clickedItem.querySelector('img')];
        } else {
            const parentGrid = clickedItem.closest('.gallery-grid, .z-layout') || document.body;
            imgElements = parentGrid.querySelectorAll('.gallery-img, .z-img, .about-image');
        }
        images = Array.from(imgElements).filter(Boolean).map(img => ({
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || 'GNG Mühendislik Proje'
        }));
        
        const clickedImg = clickedItem.querySelector('img');
        if (clickedImg) {
            const src = clickedImg.getAttribute('src');
            currentIndex = images.findIndex(item => item.src === src);
            if (currentIndex === -1) currentIndex = 0;
        }
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
    };

    const updateLightbox = () => {
        if (images.length === 0) return;
        const current = images[currentIndex];
        modalImg.style.opacity = '0';
        modalImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modalImg.src = current.src;
            modalImg.alt = current.alt;
            modalImg.style.opacity = '1';
            modalImg.style.transform = 'scale(1)';
            counter.textContent = `${currentIndex + 1} / ${images.length}`;
        }, 150);
    };

    const openModal = (item) => {
        setupGallery(item);
        updateLightbox();
        modal.classList.add('active');
        if (lenis) lenis.stop();
    };

    const closeModal = () => {
        modal.classList.remove('active');
        if (lenis) lenis.start();
    };

    const nextSlide = (e) => {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        updateLightbox();
    };

    const prevSlide = (e) => {
        if (e) e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightbox();
    };

    galleryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(item);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === modal.querySelector('.lightbox-content')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });
};

// Initialize everything on load
window.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initMobileMenu();
    setupNavLinks();
    animateOnScroll();
    initLightbox();
});
