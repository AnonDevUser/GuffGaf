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
                let message = error.message || error.error || error.detail;

                // Handle DRF field errors (e.g., {"name": ["This field is required."]})
                if (!message && typeof error === 'object') {
                    const firstKey = Object.keys(error)[0];
                    if (firstKey) {
                        const val = error[firstKey];
                        message = Array.isArray(val) ? val[0] : val;
                    }
                }

                throw new Error(message || `HTTP error! status: ${response.status}`);
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

    // Creator Profile Logic (V1)
    const profilePage = document.querySelector('.profile-page');
    if (profilePage) {
        const creatorUsername = profilePage.dataset.username;
        if (creatorUsername) {
            loadCreatorPlans(apiClient, creatorUsername);
        }
    }

    // Creator Profile Logic (V2 - Optimized)
    const profilePageV2 = document.querySelector('.profile-page-v2');
    if (profilePageV2) {
        initCreatorProfileV2(apiClient);
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
    const planId = window.DASHBOARD_DATA ? window.DASHBOARD_DATA.planId : null;

    let integrationStates = { discord: false, whatsapp: false };

    // UI Elements
    const navItems = document.querySelectorAll('.nav-item');
    const modals = document.querySelectorAll('.modal-overlay');
    const closeBtns = document.querySelectorAll('.close-modal');

    // Sidebar Navigation
    navItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const navType = item.dataset.nav;

            if (navType === 'discord') {
                if (integrationStates.discord) {
                    if (confirm('Are you sure you want to disconnect Discord?')) {
                        try {
                            await apiClient.request('/api/integrations/discord/unlink/', { method: 'DELETE' });
                            alert('Discord unlinked successfully!');
                            window.location.reload();
                        } catch (err) {
                            alert('Error: ' + err.message);
                        }
                    }
                } else {
                    openModal('discord-modal');
                }
            } else if (navType === 'whatsapp') {
                if (integrationStates.whatsapp) {
                    if (confirm('Are you sure you want to disconnect WhatsApp?')) {
                        try {
                            await apiClient.request('/api/integrations/whatsapp/unlink/', { method: 'DELETE' });
                            alert('WhatsApp unlinked successfully!');
                            window.location.reload();
                        } catch (err) {
                            alert('Error: ' + err.message);
                        }
                    }
                } else {
                    openModal('whatsapp-modal');
                }
            }
        });
    });

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(m => m.classList.remove('active'));
        });
    });

    window.addEventListener('click', (e) => {
        modals.forEach(m => {
            if (e.target === m) m.classList.remove('active');
        });
    });

    function openModal(id) {
        if (!planId) {
            alert('Please create a plan first before connecting integrations.');
            return;
        }
        document.getElementById(id).classList.add('active');
    }

    // Initialize Plan Display if ID exists
    if (planId) {
        loadAndDisplayPlan(planId);
    }

    async function loadAndDisplayPlan(id) {
        try {
            const plan = await apiClient.request(`/api/plans/${id}/`);
            document.getElementById('display-plan-name').textContent = plan.name;
            document.getElementById('display-plan-bio').textContent = plan.subscription_bio;
            document.getElementById('display-plan-price').textContent = plan.price;

            // Update Integration States
            integrationStates.discord = plan.discord_state;
            integrationStates.whatsapp = plan.whatsapp_state;

            // Update Sidebar Text
            const discordItem = document.querySelector('[data-nav="discord"]');
            const whatsappItem = document.querySelector('[data-nav="whatsapp"]');

            if (discordItem) {
                discordItem.querySelector('span').nextSibling.textContent = integrationStates.discord ? ' Disconnect Discord' : ' Connect Discord';
            }
            if (whatsappItem) {
                whatsappItem.querySelector('span').nextSibling.textContent = integrationStates.whatsapp ? ' Disconnect WhatsApp' : ' Connect WhatsApp';
            }

            // Pre-fill edit modal
            document.getElementById('edit-plan-title').value = plan.name;
            document.getElementById('edit-plan-description').value = plan.subscription_bio;
            document.getElementById('edit-plan-price').value = plan.price;
        } catch (err) {
            console.error('Failed to load plan details:', err);
        }
    }

    const openEditBtn = document.getElementById('open-edit-plan-modal');
    if (openEditBtn) {
        openEditBtn.addEventListener('click', () => {
            document.getElementById('edit-plan-modal').classList.add('active');
        });
    }

    // Plan Actions (Create/Update)
    const savePlanBtn = document.getElementById('save-plan-btn');
    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', async () => {
            const name = document.getElementById('plan-title').value;
            const subscription_bio = document.getElementById('plan-description').value;
            const price = document.getElementById('plan-price').value;

            if (!name || !price) return alert('Plan name and price are required.');

            savePlanBtn.classList.add('loading');
            try {
                await apiClient.request('/api/plans/', {
                    method: 'POST',
                    body: JSON.stringify({ name, subscription_bio, price, interval: 'M' })
                });
                alert('Plan created successfully!');
                window.location.reload();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                savePlanBtn.classList.remove('loading');
            }
        });
    }

    const updatePlanBtn = document.getElementById('update-plan-btn');
    if (updatePlanBtn) {
        updatePlanBtn.addEventListener('click', async () => {
            const name = document.getElementById('edit-plan-title').value;
            const subscription_bio = document.getElementById('edit-plan-description').value;
            const price = document.getElementById('edit-plan-price').value;

            updatePlanBtn.classList.add('loading');
            try {
                // Assuming PATCH /api/plans/<id>/ works for updates
                await apiClient.request(`/api/plans/${planId}/`, {
                    method: 'PATCH',
                    body: JSON.stringify({ name, subscription_bio, price })
                });
                alert('Plan updated successfully!');
                window.location.reload();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                updatePlanBtn.classList.remove('loading');
            }
        });
    }

    // Integration Actions
    const saveDiscordBtn = document.getElementById('save-discord-btn');
    if (saveDiscordBtn) {
        saveDiscordBtn.addEventListener('click', async () => {
            const guild_id = document.getElementById('discord-guild-id').value;
            const role_id = document.getElementById('discord-role-id').value;

            if (!guild_id || !role_id) return alert('Guild ID and Role ID are required.');

            saveDiscordBtn.classList.add('loading');
            try {
                await apiClient.request('/api/integrations/discord/link/', {
                    method: 'POST',
                    body: JSON.stringify({ plan_id: planId, guild_id, role_id })
                });
                alert('Discord connected successfully!');
                document.getElementById('discord-modal').classList.remove('active');
                window.location.reload();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                saveDiscordBtn.classList.remove('loading');
            }
        });
    }

    const saveWhatsappBtn = document.getElementById('save-whatsapp-btn');
    if (saveWhatsappBtn) {
        saveWhatsappBtn.addEventListener('click', async () => {
            const group_link = document.getElementById('whatsapp-link').value;

            if (!group_link) return alert('WhatsApp group link is required.');

            saveWhatsappBtn.classList.add('loading');
            try {
                await apiClient.request('/api/integrations/whatsapp/link/', {
                    method: 'POST',
                    body: JSON.stringify({ plan_id: planId, group_link })
                });
                alert('WhatsApp connected successfully!');
                document.getElementById('whatsapp-modal').classList.remove('active');
                window.location.reload();
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                saveWhatsappBtn.classList.remove('loading');
            }
        });
    }
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
async function initCreatorProfileV2(apiClient) {
    const planId = document.body.getAttribute('data-plan-id');
    if (!planId) return;

    try {
        const data = await apiClient.request(`/api/plans/${planId}/`);

        // Update header
        const titleEl = document.getElementById('community-name-title');
        const bioEl = document.getElementById('community-bio');
        if (titleEl) titleEl.textContent = `${data.creator}'s Dev Club`;
        if (bioEl) bioEl.textContent = data.subscription_bio;

        // Update avatar
        const avatar = document.getElementById('creator-avatar');
        const placeholder = document.getElementById('avatar-placeholder');
        if (avatar && placeholder) {
            avatar.src = `https://ui-avatars.com/api/?name=${data.creator}&background=random&size=200`;
            avatar.style.display = 'block';
            placeholder.style.display = 'none';
        }

        // Update plan info
        const planNameEl = document.getElementById('plan-name');
        const priceDisplayEl = document.getElementById('plan-price-display');
        if (planNameEl) planNameEl.textContent = data.name;
        if (priceDisplayEl) {
            const interval = data.interval === 'M' ? 'month' : 'year';
            priceDisplayEl.textContent = `Rs. ${data.price} /${interval}`;
        }


        // Update access links
        const accessSection = document.getElementById('access-section');
        const accessLinks = document.getElementById('access-links');

        if (accessSection && accessLinks) {
            accessLinks.innerHTML = '';
            let hasIntegrations = false;

            if (data.discord_state) {
                hasIntegrations = true;
                accessLinks.innerHTML += `
                    <a class="access-v2-btn discord">
                        <svg class="icon-v2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/></svg>
                        Discord
                    </a>
                `;
            }

            if (data.whatsapp_state) {
                hasIntegrations = true;
                accessLinks.innerHTML += `
                    <a class="access-v2-btn whatsapp">
                        <svg class="icon-v2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.414 0 .004 5.411 0 12.046c0 2.121.54 4.191 1.564 6.04L0 24l6.108-1.604a11.777 11.777 0 0 0 5.937 1.602h.005c6.634 0 12.043-5.411 12.047-12.047a11.791 11.791 0 0 0-3.486-8.451"/></svg>
                        WhatsApp
                    </a>
                `;
            }

            if (hasIntegrations) {
                accessSection.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Failed to load profile details:', err);
    } finally {
        // Hide loader and show content
        const loader = document.getElementById('profile-loader');
        const content = document.getElementById('profile-content');
        if (loader) loader.style.display = 'none';
        if (content) content.classList.remove('is-loading');
    }
}
