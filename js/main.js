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
            const elements = document.querySelectorAll('[data-i18n]');
            elements.forEach(element => {
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

        if (typeof goToSlide === 'function') {
            const currentIdx = typeof currentIndex !== 'undefined' ? currentIndex : 0;
            goToSlide(currentIdx % (typeof slideCount !== 'undefined' ? slideCount : 1), false);
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

    const sliderTrack = document.getElementById('sliderTrack');
    const sliderContainer = document.getElementById('sliderContainer');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');

    if (sliderTrack && sliderContainer) {
        const slides = Array.from(sliderTrack.children);
        const slideCount = slides.length;

        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            sliderTrack.appendChild(clone);
        });

        let currentIndex = 0;
        let isTransitioning = false;
        let autoSlideInterval;

        function getSlideWidth() {
            const slideItem = sliderTrack.querySelector('.slide-item');
            const slideStyle = window.getComputedStyle(slideItem);
            const slideWidth = slideItem.offsetWidth;
            const gap = parseInt(window.getComputedStyle(sliderTrack).gap) || 40;
            return slideWidth + gap;
        }

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

        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.slider-dot');
            if (dots.length === 0) return;
            const activeDotIndex = ((currentIndex % slideCount) + slideCount) % slideCount;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDotIndex);
            });
        }

        // Move to specific slide
        function goToSlide(index, smooth = true) {
            currentIndex = index;
            const slideWidth = getSlideWidth();
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            const offset = isRTL ? currentIndex * slideWidth : -currentIndex * slideWidth;

            if (smooth) {
                sliderTrack.style.transition = 'transform 0.5s ease-in-out';
            } else {
                sliderTrack.style.transition = 'none';
            }

            sliderTrack.style.transform = `translateX(${offset}px)`;
            updateDots();
        }

        function nextSlide() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            goToSlide(currentIndex);

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

        function startAutoSlide() {
            autoSlideInterval = setInterval(nextSlide, 3000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

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

        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);

        createDots();
        goToSlide(0, false);
        startAutoSlide();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                goToSlide(currentIndex % slideCount, false);
            }, 250);
        });
    }
});
