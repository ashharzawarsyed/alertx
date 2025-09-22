# AlertX Hospital Dashboard

A dedicated React + Vite dashboard for hospital staff to manage their operations within the AlertX emergency management system.

## Overview

This is a separate dashboard from the main admin dashboard, specifically designed for hospital staff to:

- Manage hospital bed availability
- View incoming emergency patients
- Update hospital status and capacity
- Coordinate with ambulance services

## Technology Stack

- **React 19.0.0** - Component library (matched with admin dashboard)
- **Vite 7.1.2** - Build tool and dev server
- **JavaScript** - No TypeScript for simplicity

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

From the monorepo root:

```bash
npm install
```

### Running the Development Server

From the monorepo root:

```bash
npm run hospital-dashboard
```

Or directly from this directory:

```bash
npm run dev
```

The application will be available at: http://localhost:5173/

## Monorepo Integration

This project is part of the AlertX monorepo and maintains version consistency with the admin dashboard:

- React: 19.0.0 (exact match with admin dashboard)
- react-dom: 19.0.0 (exact match with admin dashboard)
- Vite: ^7.1.2 (consistent with admin dashboard)

## Project Structure

```
hospital-dashboard/
├── public/           # Static assets
├── src/             # Source code
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── services/    # API services
│   └── main.jsx     # Application entry point
├── package.json     # Dependencies and scripts
└── vite.config.js   # Vite configuration
```

## Future Features

- Hospital-specific authentication
- Real-time bed availability management
- Emergency patient intake interface
- Integration with main AlertX backend
- Tailwind CSS for styling
- React Router for navigation
- State management with React Context or Zustand+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
