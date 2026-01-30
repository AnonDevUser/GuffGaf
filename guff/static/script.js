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

    // Signup Logic
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        initSignup(apiClient);
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
        // Skip forms handled by AJAX logic to avoid conflict
        if (form.id === 'signup-form' || form.classList.contains('content-form')) return;

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

async function initSignup(apiClient) {
    const signupForm = document.getElementById('signup-form');
    const errorBox = document.getElementById('signup-error');
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    function showError(message) {
        submitBtn.classList.remove('loading');
        errorBox.textContent = message;
        errorBox.classList.add('show');
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function hideError() {
        errorBox.textContent = '';
        errorBox.classList.remove('show');
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();

        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        // Basic Validation
        if (data.username.length < 3) {
            return showError('username must be at least 3 characters');
        }

        if (data.password.length < 6) {
            return showError('password must be at least 6 characters');
        }

        if (data.password !== data.confirmed_password) {
            return showError('passwords do not match');
        }

        // Phone validation (basic)
        const phoneRegex = /^(\+977)?[9][6-8][0-9]{8}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            return showError('invalid Nepal phone number format');
        }

        submitBtn.classList.add('loading');

        try {
            // We use request but handle the redirect manually if needed, 
            // or let the backend return a JSON response for AJAX.
            // Current views.py signup returns redirect on success, we need to handle that.

            const response = await fetch(signupForm.action, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': apiClient.getCookie('csrftoken'),
                },
                body: formData // Send as FormData to match standard Django POST
            });

            if (response.ok) {
                // If the response is a redirect (status 200 after following), 
                // but fetch might follow it. Let's check the URL.
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    // If not redirected but OK, maybe it's the dashboard already or success JSON
                    window.location.href = '/dashboard';
                }
            } else {
                const result = await response.json().catch(() => ({ error: 'signup failed' }));
                showError(result.error || result.message || 'an error occurred');
            }
        } catch (err) {
            showError('network error, please try again');
            console.error(err);
        } finally {
            submitBtn.classList.remove('loading');
        }
    });
}
