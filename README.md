# GDG OAU Landing Page

A clean React landing page for GDG on Campus OAU, built with Vite and React. The app includes the home page, communities section, calendar page, and registration flow.

## Features

- Responsive landing page
- Community cards and navigation
- Calendar section with Notion embed
- Registration form UI
- Clean component-based structure

## Tech Stack

- React
- Vite
- JavaScript

## Project Structure

```bash
src/
├── App.jsx
├── main.jsx
├── styles.css
├── components/
│   ├── Header.jsx
│   ├── HomePage.jsx
│   ├── CommunitiesPage.jsx
│   ├── CalendarPage.jsx
│   └── RegistrationPage.jsx
├── constants/
│   └── site.js
├── data/
│   └── communities.js
└── ...
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Then open the local URL shown in the terminal, usually:

```bash
http://localhost:5173/
```

### 3. Build for production

```bash
npm run build
```

### 4. Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` — start the app locally
- `npm run build` — build the production bundle
- `npm run preview` — preview the built app locally

## Deployment

The project is deployed with **Cloudflare Pages**:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

Single-page application (SPA) routing is handled automatically via `public/_redirects`.

## Notes

This project is structured to keep pages and data separated for easier maintenance. The original worker-based logic was refactored into a cleaner React app.

## License

This project is for educational and community use.
