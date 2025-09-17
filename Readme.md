# Gemini Backend Assignment

This backend API is built to serve a subscription-based SaaS application, handling user management, subscriptions, chatrooms, messaging, and Gemini API powered responses—all with rich real-time features and strong architectural foundations.

---

## Table of Contents

- [How to Set Up and Run the Project](#how-to-set-up-and-run-the-project)
- [Architecture Overview](#architecture-overview)
- [Queue System Explanation](#queue-system-explanation)
- [Gemini API Integration Overview](#gemini-api-integration-overview)
- [Assumptions / Design Decisions](#assumptions--design-decisions)
- [How to Test via Postman](#how-to-test-via-postman)
- [Access / Deployment Instructions](#access--deployment-instructions)
- [Environment Variables](#environment-variables)
- [Setting Webhook route](#webhook-stripe)

---

## How to Set Up and Run the Project

**Prerequisites:**
- Node.js (v16+ recommended)
- PostgreSQL (hosted instance or local)
- Redis (hosted or local, supports TLS for cloud)
- Stripe account for payment integration

**1. Clone the repository:**
git clone [repo url](https://github.com/sarthak3203/gemini-backend-assignment)
cd GEMINI-BACKEND-ASSIGNMENT


**2. Install dependencies:**
npm install


**3. Configure environment variables:**
- Copy the template below to a file named `.env` in the project root.
- Fill with your actual secrets (see `.env.example` if provided).

**4. Set up database and start server:**
npm start

---

## Architecture Overview

- The project follows a modular structure with clear separation of concerns.
- **Folders:**
  - `config/`: configurations for DB, Redis, BullMQ, and Stripe.
  - `controllers/`: route logic for each feature (auth, user, chatroom, messages, subscription, webhook).
  - `middlewares/`: authentication, error handling, and rate limiting logic.
  - `models/`: database models and business logic for PostgreSQL tables.
  - `routes/`: API route definitions for all major features.
  - `utils/`: helper utilities for JWT, OTP, Redis.
  - `worker/`: BullMQ worker that handles Gemini API jobs.
- **schema.txt** documents the SQL schema for all tables used by the backend.
- API server is started via `server.js`.

**Sample Structure:**
/config
/controllers
/middlewares
/models
/routes
/utils
/worker
schema.txt
server.js


---

## Queue System Explanation

- The backend uses [BullMQ](https://docs.bullmq.io/) (configured in `config/bullMQ.js`) as a job queue system powered by Redis.
- When a user sends a message that requires an AI-powered Gemini reply, the following workflow happens:
  1. The chat message is added to the PostgreSQL DB.
  2. A new job is added to the BullMQ queue (`"gemini-messages"`) with the user’s input.
  3. The BullMQ worker (defined in `worker/geminiWorker.js`) picks up jobs and processes them in the background, calling the Gemini API.
  4. After processing, the Gemini response is stored in the DB and can be fetched from the chatroom endpoint later by the user.
- This system ensures that slow or intermittent API responses do not block the main API, supporting a responsive and scalable user experience.

---

## Gemini API Integration Overview

- Gemini’s Generative AI API is integrated in the BullMQ worker (`geminiWorker.js`) using the `@google/generative-ai` npm package.
- When a job is processed, the worker sends the user’s message text to the Gemini API via the `generateContent` method, using the model `gemini-2.0-flash`.
- The Gemini response is saved to the database and returned to the user—either instantly if the job finishes quickly, or through a follow-up fetch after background processing.
- All Gemini communication is secured using a `GEMINI_API_KEY` loaded from environment variables.

**Partial Implementation Example:**
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const result = await model.generateContent(userText);
return result.response.text();

text

---

## Assumptions / Design Decisions

- All **authentication** and protected routes use JWT tokens, provided on verify-otp route and verified in middleware.
- **Rate limiting** is applied per user/IP using middleware (`middlewares/rateLimitMiddleware.js`) to protect against abuse and DDoS.
- **PostgreSQL** is the primary database for persistent storage, using a hosted Render instance.
- **Redis** is used both for BullMQ queues and as a cache for improving read-heavy queries and session management.
- All secrets and sensitive configuration are handled via environment variables and not hardcoded.
- Stripe is used for subscription/payment management; all webhook events are processed on backend endpoints.
- The backend is purely decoupled from frontend—clients interact exclusively through well-defined RESTful APIs.

---

## How to Test via Postman

1. **Download the Postman collection:**  
   [Gemini Backend Postman Collection (.json)](https://drive.google.com/file/d/1q_-V1tPR_Ob4qJIdqBMOJgIb2e3cWRgy/view?usp=sharing)

2. **Import the collection** into Postman:
   - Open Postman → Import → Upload the downloaded `.json` file.
   - All routes are organized in folders: auth, user, chatroom, subscription, webhook, etc.

3. **Set environment variables or use JWT tokens** as described in the collection for protected endpoints.

4. **Test all endpoints**:
   - Signup and verify-otp to get a token.
   - Use the token for protected endpoints (sending messages, checking subscription status, etc.).
   - Send messages in a chatroom to see Gemini-powered asynchronous responses.
   - Trigger and inspect webhook events and subscription flows.

---

## Access / Deployment Instructions

- **Live URL:**  
  [https://gemini-backend-assignment-2hnu.onrender.com](https://gemini-backend-assignment-2hnu.onrender.com)
- Deployed via Render with a persistent PostgreSQL and Redis instance.
- API is accessible from anywhere—use Postman or any HTTP client to interact with public endpoints.

---

## Environment Variables

Copy this template to your `.env` file in the project root and fill with your actual secrets:

PORT=5000
DATABASE_URL=postgresql://username:password@host:port/database_name
REDIS_URL=rediss://default:password@host:port
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PRO_PRICE_ID=your_stripe_price_id_here
FRONTEND_URL= http://mock.example.com
GEMINI_API_KEY=your_gemini_api_key_here


## WEBHOOK STRIPE
Setup the webhook on stripe dashboard->developer->webhook and set the route to livedeployedurl/webhook/stripe and send test events which are handled in webhookController.js