# AATHVI TOY SHOP — Node.js website

A colourful, light-premium toy shop website with responsive layout, search, category filters, a persistent shopping cart, checkout form, order-request storage and customer enquiries.

## Run in VS Code
1. Install Node.js (LTS) if it is not installed.
2. Extract this ZIP and open the `AATHVI_TOY_SHOP_WEBSITE` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install`
5. Run `npm start`
6. Open `http://localhost:3000` in your browser.

## Features
- Product search and category browsing.
- Add/remove items and adjust cart quantities; cart stays in the same browser using local storage.
- Checkout sends a validated order request to the Node.js backend. Orders are stored in `data/orders.json`.
- Customer enquiries are stored in `data/enquiries.json`.
- Shop details and Google Maps URL are configured in `server.js` via `/api/config`. Phone and WhatsApp are intentionally blank.
- Optional private order API: set an environment variable `ADMIN_KEY` before starting the server, then request `/api/admin/orders` with an `x-admin-key` header. Keep this key private.

## Important before launching publicly
- Product names, sample prices and images are illustrative and are not verified live inventory or shop prices. Replace them with actual products, prices and licensed/original photos. The original Google Maps listing is linked on the site, but its photos are not copied into this ZIP.
- Checkout currently submits an **order request**, not a confirmed sale. The shop must confirm availability, delivery charges and final amount. Online payment is not integrated; choosing online only records a request for payment instructions. To accept real online payments, integrate a payment provider (for example, Razorpay) on the backend and follow its current security and verification requirements. Never collect or store card/UPI credentials directly in this site.
- This starter stores orders in a local JSON file. For a public production store, use a database, HTTPS, authentication, backups, rate limiting and appropriate privacy/consumer policies.

### Google Maps note
- The contact section now includes an embedded map preview based on the shop's address.
- **Get directions** opens the original Google Maps listing URL configured in `server.js`.
- The embedded preview is address-based and may show the surrounding area rather than the exact shop pin. Use the directions button for the shop listing's precise pin.
