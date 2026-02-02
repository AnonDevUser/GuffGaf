# 🎙️ GuffGaff: The Creator Bridge

GuffGaff is a high-performance, premium web platform designed to bridge the gap between content creators and their most dedicated communities. Built with a focus on seamless integration, robust security, and stunning aesthetics, GuffGaff empowers creators to monetize their influence through exclusive access to Discord guilds and WhatsApp groups.

## 🎨 AI-Driven Design & Development

The entire frontend experience—from the intuitive dashboard to the high-converting landing pages—was developed by **Gemini 3 Flash** in **Planning Mode** on **Antigravity**. The development process utilized high-fidelity Figma mocks as a baseline, resulting in a state-of-the-art interface that feels both premium and responsive.

## 🚀 Key Features

### 💎 For Creators
-   **Dynamic Plan Management**: Effortlessly create, edit, and scale subscription plans (Monthly/Yearly) with a real-time dashboard.
-   **Seamless Integrations**: One-click connection to Discord (automated role assignments) and WhatsApp (secure group link distribution).
-   **Insights Dashboard**: Track community growth and active subscriptions at a glance.

### 👤 For Subscribers
-   **Personalized Experience**: Dedicated subscriber dashboards to manage active memberships and discover new community perks.
-   **Secure Payments**: Integrated eSewa v2 and Khalti support with cryptographic signature verification for peace of mind.
-   **Instant Access**: Automatic invitation delivery to premium communities immediately upon successful purchase.

## 🛠 Technical Architecture

GuffGaff leverages a modern, decoupled architecture:
-   **Backend**: Django-powered REST API (DRF) providing secure endpoints for all business logic.
-   **Frontend**: A sophisticated AJAX-driven architecture using Vanilla JavaScript and CSS, ensuring blazing-fast interactions without the overhead of heavy frameworks.
-   **Integrations**: Direct API hooks with Discord and WhatsApp for automated membership control.

## 📂 Project Structure

```text
guffgaff/
├── api/                # REST API Layer (DRF)
├── guff/               # Core Application (Models, Views, Templates)
│   ├── static/         # Advanced JS (script.js) and Design Tokens (styles.css)
│   └── templates/      # High-fidelity Django Templates
├── guffgaff/           # Project Configuration
└── manage.py           # Command-line utility
```

## ⚙️ Getting Started

### Prerequisites
- **Python 3.9+**
- **Git**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd guffgaff
    ```

2.  **Setup Virtual Environment:**
    ```bash
    python3.9 -m venv venv
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Environment Configuration:**
    Create a `.env` file in the root:
    ```env
    DJANGO_SECRET_KEY=your_secret_key_here
    ```

5.  **Initialize Database:**
    ```bash
    python manage.py migrate
    ```

6.  **Launch Development Server:**
    ```bash
    python manage.py runserver
    ```
    The app will be live at `http://127.0.0.1:8000/`.

---
© GuffGaf 2026
