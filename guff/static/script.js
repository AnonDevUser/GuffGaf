document.addEventListener('DOMContentLoaded', () => {
    // API Client with CSRF protection
    const apiClient = {
        getCookie(name) {
            let cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        },

        async request(url, options = {}) {
            const defaults = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCookie('csrftoken')
                }
            };
            const response = await fetch(url, { ...defaults, ...options, headers: { ...defaults.headers, ...options.headers } });
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || error.error || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        }
    };

    // Dashboard Logic
    const dashboardContainer = document.querySelector('.dashboard-page');
    if (dashboardContainer) {
        initDashboard(apiClient);
    }

    // Creator Profile Logic
    const profilePage = document.querySelector('.profile-page');
    if (profilePage) {
        const creatorUsername = profilePage.dataset.username;
        if (creatorUsername) {
            loadCreatorPlans(apiClient, creatorUsername);
        }
    }

    const authForms = document.querySelectorAll('.auth-form, .contact-form');

    authForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
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

async function initDashboard(apiClient) {
    const saveBtn = document.querySelector('.save-btn');
    const plansContainer = document.createElement('div');
    plansContainer.className = 'plans-list-container';
    document.querySelector('.main-content').appendChild(plansContainer);

    // Load existing plans
    async function refreshPlans() {
        try {
            const userData = await apiClient.request('/api/me/');
            const data = await apiClient.request(`/api/creators/${userData.username}/plans/`);
            renderPlans(plansContainer, data.plans, true);
        } catch (err) {
            console.error('Failed to load plans:', err);
        }
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const title = document.querySelector('input[placeholder="Title"]').value;
            const description = document.querySelector('input[placeholder="Description"]').value;
            const price = 500; // Hardcoded for demo or add input

            saveBtn.classList.add('loading');
            try {
                await apiClient.request('/api/plans/', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: title,
                        subscription_bio: description,
                        price: price,
                        interval: 'M'
                    })
                });
                alert('Plan created successfully!');
                refreshPlans();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                saveBtn.classList.remove('loading');
            }
        });
    }

    refreshPlans();
}

async function loadCreatorPlans(apiClient, username) {
    const container = document.querySelector('.community-links');
    if (!container) return;

    try {
        const data = await apiClient.request(`/api/creators/${username}/plans/`);
        console.log('Plans for', username, data.plans);
    } catch (err) {
        console.error('Failed to load creator plans:', err);
    }
}

function renderPlans(container, plans, isDashboard = false) {
    container.innerHTML = '<h3>Existing Plans</h3>';
    if (plans.length === 0) {
        container.innerHTML += '<p>No plans created yet.</p>';
        return;
    }

    const list = document.createElement('div');
    list.className = 'plans-grid';
    plans.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'plan-card-mini';
        card.innerHTML = `
            <h4>${plan.name}</h4>
            <p>${plan.subscription_bio}</p>
            <div class="plan-price">Rs. ${plan.price}<span>/ ${plan.interval === 'M' ? 'Month' : 'Year'}</span></div>
        `;
        list.appendChild(card);
    });
    container.appendChild(list);
}
