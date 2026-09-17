# AI KumbhMitra

AI KumbhMitra is an intelligent digital companion and navigation guide designed for the upcoming **Kumbh Mela 2027** in **Nashik and Trimbakeshwar**. It aims to deliver seamless spatial orientation, cultural information, dynamic route guidance, and AI-powered assistance to millions of pilgrims, tourists, and administrative authorities.

> **Current Project Status**: 🟡 **Phase 1: Project Foundation Initialized**.  
> The repository currently hosts the modular monorepo scaffold, baseline React+Vite+Tailwind frontend, and Express backend health service. Complex business logic, database connectors, maps, and AI integrations are planned for future development phases.

---

## Project Scope

- **Primary Regions**: Nashik and Trimbakeshwar, Maharashtra, India.
- **Context Event**: Kumbh Mela 2027 (Simhastha).
- **Target Audience**: Pilgrims, international tourists, local devotees, emergency responders, and event logistics coordinators.

---

## Core Concept

AI KumbhMitra unites geospatial intelligence with modern AI to bridge physical navigation and cultural awareness:

$$\text{AI} \quad+\quad \text{GIS} \quad+\quad \text{Maps} \quad+\quad \text{Routing} \quad+\quad \text{Intelligent Itinerary Planning}$$

### High-Level Architecture Flow

```
User Query / Need
       ↓
 [AI Understands]
   Natural Language Processing determines intent, preferences, constraints, & cultural context
       ↓
 [GIS Discovers]
   Geospatial queries identify places, temples, ghats, medical points, parking, & crowd zones
       ↓
[Routing Calculates]
   Real-time multi-modal pathways (walking, shuttle, transit) calculate safe, optimal paths
       ↓
[Optimization Plans]
   Itinerary engine sequences visits based on muhurat, timings, distances, and crowds
       ↓
  [Map Displays]
   Photorealistic 3D and interactive 2D maps render clear visual guidance on the device
```

---

## Planned Features

- **2D Interactive Map**: Vector-based mapping of streets, facilities, zones, and ghats.
- **3D Photorealistic Map**: Immersive 3D map experience highlighting iconic landmarks and temples.
- **Temple Information**: Timings, history, rituals, pooja booking details, and significance.
- **Ghat Information**: Ramkund, Kushavarta, and secondary snan ghat details with safety guidelines.
- **Accommodation & Dining**: Hotels, ashrams, dharamshalas, and verified restaurants.
- **Local Commerce**: Shops, authentic local handicrafts, and religious supply stores.
- **Hospitals & Emergency Services**: First-aid posts, hospitals, ambulances, and police assistance booths.
- **Parking & Holding Areas**: Designated parking lots, vehicle entry restrictions, and shuttle pickup zones.
- **Transport & Shuttles**: Ring road shuttles, state buses, and railway station connectivity.
- **Route Planning**: Safe walking routes avoiding overcrowded bottleneck corridors.
- **AI Assistant**: Conversational multilingual guide answering queries about rituals, timings, and navigation.
- **AI Itinerary Generation**: Personalized day-wise and hour-wise trip schedules based on interest and physical ability.
- **Kumbh-Specific Information**: Shahi Snan dates, Akharas, procession routes, lost-and-found, and real-time announcements.

---

## Technology Stack

| Layer | Technologies | Status |
|---|---|---|
| **Frontend** | React (v19+), Vite, Tailwind CSS, JavaScript | Foundation Initialized |
| **Backend** | Node.js, Express.js, CORS | Foundation Initialized |
| **Database** | MongoDB | Planned (Future Phase) |
| **Maps** | Google Maps Platform (2D & Photorealistic 3D Tiles) | Planned (Future Phase) |
| **AI Engine** | LLM API (Gemini / OpenAI-compatible service) | Planned (Future Phase) |
| **Routing** | Routing engine (e.g. Google Routes / OSRM / GraphHopper) | Planned (Future Phase) |

---

## Project Structure

```
AI-KumbhMitra/
│
├── frontend/             # React + Vite + Tailwind client application
│   ├── src/
│   │   ├── components/   # Reusable UI elements (cards, buttons, modals)
│   │   ├── pages/        # View screens (Home, Explore, Itinerary, etc.)
│   │   ├── layouts/      # Shell layouts (Navbar, Sidebar, Footer)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API integration & data fetching clients
│   │   ├── utils/        # Helper functions & formatters
│   │   ├── assets/       # Static media, icons, and illustrations
│   │   ├── constants/    # App constants and configuration tokens
│   │   ├── styles/       # Global CSS and Tailwind definitions
│   │   └── App.jsx       # Root application component
│   ├── public/           # Static public assets
│   ├── package.json      # Frontend dependencies & scripts
│   └── vite.config.js    # Vite configuration
│
├── backend/              # Node.js + Express REST API server
│   ├── src/
│   │   ├── controllers/  # Request handlers for endpoints
│   │   ├── routes/       # API route definitions
│   │   ├── models/       # Data schemas (prepared for MongoDB)
│   │   ├── services/     # Business logic & 3rd-party integrations
│   │   ├── middleware/   # Express middleware (CORS, error handling, etc.)
│   │   ├── utils/        # Backend helper utilities
│   │   ├── config/       # Environment & server settings
│   │   └── server.js     # Server entry point
│   ├── package.json      # Backend dependencies & scripts
│   └── .env.example      # Backend environment template
│
├── data/                 # Geospatial, place records, and reference data
│   ├── places/           # Structured JSON/GeoJSON for places of interest
│   ├── geojson/          # Boundary layers, routes, and geographic features
│   └── README.md         # Data schemas and contribution guidelines
│
├── docs/                 # Project documentation
│   ├── architecture/     # System design diagrams and specs
│   ├── api/              # API contract and endpoint docs
│   └── development/      # Setup guides, contributing workflow, and standards
│
├── .gitignore            # Git exclusion rules
├── .env.example          # Monorepo environment configuration template
└── README.md             # This project overview document
```

---

## Development

### Prerequisites

- **Node.js**: `v20.x` or higher (tested with `v24.x`)
- **npm**: `v10.x` or higher

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The frontend will start on [http://localhost:5173](http://localhost:5173).

Available frontend scripts:
- `npm run dev`: Starts the local Vite development server
- `npm run build`: Bundles production assets into `dist/`
- `npm run preview`: Previews the production build locally

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```
The backend server will start on [http://localhost:5000](http://localhost:5000).

Available backend scripts:
- `npm run dev`: Starts the Express server with nodemon auto-restart
- `npm start`: Runs the production server with Node.js

### 3. Health Check Verification

Test that the backend API is live:

```bash
# Using cURL
curl http://localhost:5000/api/health

# Or using PowerShell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "AI KumbhMitra backend is running"
}
```

For complete step-by-step guidance, refer to [docs/development/SETUP.md](docs/development/SETUP.md).
