# Aura Dining — React + MongoDB migration

This branch contains the first migration stage. The original application remains in place under `backend/src/server.js` and `frontend/public/` while the new React client and MongoDB API are introduced separately.

## Current migration stage
- React 19 + Vite frontend in `frontend/src/`.
- Existing Aura Dining visual direction retained: warm ivory surfaces, terracotta accents, Playfair Display headings and responsive menu cards.
- Express API entry point: `backend/src/index.js`.
- MongoDB Atlas connection through `backend/src/config/database.js`.
- Initial Mongoose models: User, MenuItem, Order and Reservation.
- Health endpoint: `GET /api/health`.
- Order model already defines COD and Razorpay payment states; payment processing is not enabled yet.

## Run locally
1. Open a terminal in `restaurant-system/backend`.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and set a MongoDB Atlas connection string and a long random JWT secret.
4. Run `npm run dev`.
5. Open another terminal in `restaurant-system/frontend`.
6. Run `npm install`, then `npm run dev`.
7. Open `http://localhost:3000`.

The frontend can show demo menu items when the API has no menu records yet. The new backend requires MongoDB Atlas to be configured before it starts.

## Important
- Never commit `.env` or real payment, SMTP, Twilio or database credentials.
- Configure Razorpay in test mode before implementing and testing payment verification.
- The current UI cart is a presentation-stage cart; checkout, authentication, reservation submission, staff controls and notifications are planned for subsequent stages.
- Do not delete the legacy frontend/backend until all existing workflows have been migrated and tested.
