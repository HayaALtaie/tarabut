document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    const html = document.documentElement;

    function setLanguage(lang) {
        const dir = lang === 'ar' ? 'rtl' : 'ltr';

        html.setAttribute('lang', lang);
        html.setAttribute('dir', dir);

        localStorage.setItem('selectedLang', lang);

        if (typeof translations !== 'undefined') {
            const t = translations[lang];

            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (t[key]) {
                    if (element.tagName === 'H1' || element.tagName === 'P' || element.tagName === 'DIV' || element.tagName === 'SPAN') {
                        element.innerHTML = t[key];
                    } else {
                        element.textContent = t[key];
                    }
                }
            });
        }
    }

    const savedLang = localStorage.getItem('selectedLang') || 'ar';
    setLanguage(savedLang);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const currentLang = html.getAttribute('lang');
            const newLang = currentLang === 'ar' ? 'en' : 'ar';
            setLanguage(newLang);
        });
    }

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // Clients Slider
    const sliderTrack = document.getElementById('sliderTrack');
    const sliderContainer = document.getElementById('sliderContainer');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');

    if (sliderTrack && sliderContainer) {
        const slides = Array.from(sliderTrack.children);
        const slideCount = slides.length;

        // Clone slides for infinite loop effect
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            sliderTrack.appendChild(clone);
        });

        let currentIndex = 0;
        let isTransitioning = false;
        let autoSlideInterval;

        // Calculate slide width including gap
        function getSlideWidth() {
            const slideItem = sliderTrack.querySelector('.slide-item');
            const slideStyle = window.getComputedStyle(slideItem);
            const slideWidth = slideItem.offsetWidth;
            const gap = parseInt(window.getComputedStyle(sliderTrack).gap) || 40;
            return slideWidth + gap;
        }

        // Create dots
        function createDots() {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < slideCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        // Update dots
        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex % slideCount);
            });
        }

        // Move to specific slide
        function goToSlide(index, smooth = true) {
            if (isTransitioning) return;

            currentIndex = index;
            const slideWidth = getSlideWidth();
            const offset = -currentIndex * slideWidth;

            if (smooth) {
                sliderTrack.style.transition = 'transform 0.5s ease-in-out';
            } else {
                sliderTrack.style.transition = 'none';
            }

            sliderTrack.style.transform = `translateX(${offset}px)`;
            updateDots();
        }

        // Next slide
        function nextSlide() {
            if (isTransitioning) return;

            isTransitioning = true;
            currentIndex++;

            goToSlide(currentIndex);

            // Reset to first slide when reaching clones
            if (currentIndex >= slideCount) {
                setTimeout(() => {
                    currentIndex = 0;
                    goToSlide(0, false);
                    isTransitioning = false;
                }, 500);
            } else {
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            }
        }

        // Previous slide
        function prevSlide() {
            if (isTransitioning) return;

            isTransitioning = true;

            if (currentIndex === 0) {
                currentIndex = slideCount;
                goToSlide(currentIndex, false);
                setTimeout(() => {
                    currentIndex--;
                    goToSlide(currentIndex);
                    setTimeout(() => {
                        isTransitioning = false;
                    }, 500);
                }, 20);
            } else {
                currentIndex--;
                goToSlide(currentIndex);
                setTimeout(() => {
                    isTransitioning = false;
                }, 500);
            }
        }

        // Auto slide
        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 3000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        // Event listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }

        // Pause on hover
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);

        // Initialize
        createDots();
        goToSlide(0, false);
        startAutoSlide();

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                goToSlide(currentIndex % slideCount, false);
            }, 250);
        });
    }
});
