document.addEventListener('DOMContentLoaded', () => {
    const authForms = document.querySelectorAll('.auth-form, .contact-form');

    authForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                // Simulate processing/network delay
                // In a real app, this would be removed after the API response
                setTimeout(() => {
                    // submitBtn.classList.remove('loading');
                }, 3000);
            }
        });
    });

    // Hamburger Menu Logic
    const hamburger = document.querySelector('.hamburger-btn');
    const navPill = document.querySelector('.nav-pill');

    if (hamburger && navPill) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navPill.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinksInPill = navPill.querySelectorAll('a');
        navLinksInPill.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navPill.classList.remove('active');
            });
        });
    }

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });

    // Smooth scroll for nav links (fallback if scroll-behavior: smooth isn't supported)
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Scroll Reveal Logic
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Jump to Top Logic
    const jumpToTopBtn = document.getElementById('jump-to-top');

    if (jumpToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                jumpToTopBtn.classList.add('show');
            } else {
                jumpToTopBtn.classList.remove('show');
            }
        });

        jumpToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
