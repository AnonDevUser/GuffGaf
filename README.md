# GuffGaff

GuffGaff is a Django-based web application that allows creators to manage subscription plans and integrate with Discord and WhatsApp. It features a user profile system, subscription management, and payment processing integration (eSewa, Khalti).

## 🚀 Getting Started

### Prerequisites

- **Python 3.8+**
- **Git**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd guffgaff
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # Windows
    python -m venv venv
    venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Environment Setup:**
    Create a `.env` file in the root directory and add your secret key:
    ```env
    DJANGO_SECRET_KEY=your_secret_key_here
    ```

5.  **Run Migrations:**
    ```bash
    python manage.py migrate
    ```

6.  **Run the Server:**
    ```bash
    python manage.py runsslserver
    ```
    The app will be available at `https://127.0.0.1:8000/`.

## 📂 Project Structure

```text
guffgaff/
├── api/                # REST API endpoints
├── guff/               # Main application logic (views, models, templates)
├── guffgaff/           # Project settings and configuration
├── manage.py           # Django command-line utility
└── requirements.txt    # Project dependencies
```

## 🛠 Backend Documentation

### Key Apps

-   **`guff`**: Handles the core business logic, including user profiles, subscriptions, and integrations.
-   **`api`**: Provides RESTful endpoints for frontend interaction.

### Database Models (`guff/models.py`)

-   **`UserProfile`**: Extends the default Django User model. Tracks if a user is a creator and stores their phone number.
-   **`SubscriptionPlan`**: Plans created by creators (Monthly/Yearly) with a specific price.
-   **`UserSubscription`**: Links a buyer to a `SubscriptionPlan`. Tracks start/end dates and active status.
-   **`Payment`**: Records payment transactions via eSewa (`ES`) or Khalti (`KH`).
-   **`DiscordIntegration`**: Links a `SubscriptionPlan` to a Discord Guild and Role.
-   **`WhatsAppIntegration`**: Links a `SubscriptionPlan` to a WhatsApp group link.

### API Endpoints (`api/urls.py`)

**Auth & Users**
-   `GET /api/me/`: Get current user profile.
-   `GET /api/users/<username>/`: Get public user details.

**Creator Plans**
-   `GET /api/creators/<username>/plans/`: List plans for a specific creator.
-   `POST /api/plans/`: Create a new plan.
-   `GET /api/plans/<plan_id>/`: Get plan details.

**Subscriptions**
-   `GET /api/subscriptions/`: List current user's subscriptions.
-   `POST /api/subscriptions/<id>/`: Cancel a subscription.

**Payments**
-   `POST /api/payments/initiate/`: Start a payment flow.
-   `POST /api/payments/verify/`: Verify a payment.
-   `GET /api/payments/<id>/`: Get payment details.

**Integrations**
-   `POST /api/integrations/discord/link/`: Link Discord to a plan.
-   `POST /api/integrations/whatsapp/link/`: Link WhatsApp to a plan.

## 🎨 Frontend Documentation

The frontend is built using Django Templates and vanilla CSS/JavaScript. It currently does not use a client-side framework (like React or Vue) and relies on server-side rendering.

### Template Architecture (`guff/templates/guff/`)

The templates are currently **independent** and do not inherit from a base template (e.g., no `base.html`). Each HTML file acts as a standalone page.

-   **`main.html`**: The primary dashboard for logged-in users. It contains the core application UI.
-   **`landing.html`**: The public-facing marketing page.
-   **`subscription.html`**: A focused view for managing user subscriptions and payment methods.
-   **`creator_profile.html`**: Displays public creator profiles.
-   **`login.html` / `signup.html`**: Standalone authentication pages.

> **Note for Developers**: Future refactoring should consider creating a `base.html` to centralize the `<head>`, navigation, and footer sections to reduce code duplication.

### Static Assets (`guff/static/`)

The project uses a flat structure for static files:

-   **`styles.css`**: The single, global stylesheet for the entire application. All component styles (buttons, cards, layout) are defined here.
-   **`script.js`**: Currently a placeholder. There is no active client-side logic at the moment. All interactions are handled via standard HTML forms and links.
-   **`images/`**: Contains all project assets (e.g., `backdrop.png`).

### API Integration

There is currently **no active JavaScript integration** with the `api/` endpoints. The API exists but is not consumed by the current frontend templates. Future frontend work should focus on:
1.  Connecting forms in `subscription.html` to `api/payments/`.
2.  Fetching dynamic creator data in `creator_profile.html` from `api/creators/`.

## 🤝 Handover Notes

-   **Future Frontend Developers**: The `api/` endpoints return JSON. Use these for any dynamic content loading or single-page application (SPA) transitions in the future.
-   **Future Backend Developers**: When adding new payment gateways, update `Payment.GATEWAY_CHOICES` in `guff/models.py` and add a corresponding webhook in `api/views.py`.
