# Glitter Store

Glitter Store is a static fashion e-commerce website for **GL Fashion / Glitter**, built with HTML, CSS, and JavaScript. The site is designed for GitHub Pages hosting and includes a customer storefront, category pages, cart and checkout flow, and a lightweight browser-based admin panel.

## Live Domain

```text
https://glitterstore.online/
```

## Project Description

Glitter Store presents a premium fashion shopping experience for men, women, and kids. The website includes a polished gold-and-black brand identity, Arabic/English language toggle, light/dark mode, category-based shopping, product detail drawers, cart checkout, WhatsApp order confirmation, optional EmailJS email notifications, and a local admin dashboard for managing products, coupons, orders, visual content, invoices, managers, and store settings.

## Features

- Responsive customer homepage with three main sections:
  - Men
  - Women
  - Kids
- Separate product pages for each section.
- Side navigation menu for customers.
- Arabic and English language toggle.
- Light and dark mode toggle.
- Product cards with detail drawer.
- Cart and cash-on-delivery checkout.
- WhatsApp order message generation.
- Optional EmailJS order notification support.
- Admin login page.
- Admin dashboard pages for:
  - Products
  - Visual editor
  - Orders
  - Coupons
  - Motion promos
  - Invoice settings
  - Managers
  - Store settings
- GitHub Pages ready:
  - `index.html`
  - `CNAME`
  - `.nojekyll`

## Important Files

```text
index.html                     Main customer homepage
glitter-men.html               Men section
glitter-women.html             Women section
glitter-kids.html              Kids section
glitter-cart.html              Cart and checkout
glitter-admin.html             Admin login
glitter-admin-dashboard.html   Admin dashboard
assets/glitter-site.css        Shared styling
assets/glitter-data.js         Shared data and local storage logic
assets/glitter-store.js        Storefront JavaScript
assets/glitter-admin.js        Admin JavaScript
assets/glitter-logo.jpeg       Brand logo
CNAME                          Custom domain for GitHub Pages
.nojekyll                      Disables Jekyll processing
```

## Admin Access

```text
Username: admin
Password: Glitter@2026
```

Admin URL:

```text
https://glitterstore.online/glitter-admin.html
```

## Hosting On GitHub Pages

1. Create a public GitHub repository.
2. Upload the contents of this folder directly to the repository root.
3. Make sure these files are in the root:
   - `index.html`
   - `CNAME`
   - `.nojekyll`
   - `assets/`
4. Go to repository `Settings > Pages`.
5. Set source to:
   - Branch: `main`
   - Folder: `/root`
6. Add the custom domain:

```text
glitterstore.online
```

7. Wait for DNS check and TLS certificate provisioning.
8. Enable `Enforce HTTPS` when available.

## DNS Records For GitHub Pages

A records for the root domain:

```text
@  A  185.199.108.153
@  A  185.199.109.153
@  A  185.199.110.153
@  A  185.199.111.153
```

Optional `www` record:

```text
www  CNAME  YOUR_GITHUB_USERNAME.github.io
```

## Notes

- This is a static website, so admin changes are stored in the browser using `localStorage`.
- For production-level shared admin updates across devices, the project would need a backend or hosted database.
- Email notifications require EmailJS credentials to be added from the admin settings page.
- WhatsApp checkout opens a ready order message for the admin number.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- GitHub Pages
- EmailJS optional integration

