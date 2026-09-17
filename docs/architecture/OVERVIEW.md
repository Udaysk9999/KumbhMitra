# AI KumbhMitra - System Architecture Overview

This document outlines the planned multi-tier system architecture for **AI KumbhMitra**.

> **Note**: This is an architectural blueprint for future phases. In the current phase (Phase 1), only the foundation layers and health services are active.

---

## 1. High-Level Architecture Diagram

```
User / Pilgrim / Tourist
       │
       ▼
┌────────────────────────────────────────────────────────┐
│                   React Frontend                       │
│  - 2D / 3D Map Viewport (Google Maps Platform)         │
│  - Place Cards & Details Panel                         │
│  - Search & Category Filters                           │
│  - Multi-Modal Route Visualization                     │
│  - AI Assistant Chat & Itinerary Interface             │
│  - Emergency & Kumbh Info Hub                          │
└───────────────────────────┬────────────────────────────┘
                            │
                      HTTPS / REST
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Node.js + Express Backend API            │
│  - Authentication & Authorization                      │
│  - Request Validation & Rate Limiting                  │
│  - Route Handlers & Controllers                        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Service Layer                       │
│  ├── Places Service     (POI query, filtering, details)│
│  ├── Routing Service    (Multi-modal paths, walking)   │
│  ├── GIS Service        (Spatial indexing, geo-fences) │
│  └── AI Service         (NLP, prompts, itineraries)    │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Database Layer        │ │   External Providers      │
│  - MongoDB                │ │  - Google Maps Platform   │
│    (Places, Routes,       │ │    (2D/3D Photorealistic) │
│     Events, Users)        │ │  - LLM Service            │
│  - GeoJSON Spatial Layers │ │    (Gemini / OpenAI)      │
│                           │ │  - Routing Engines        │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 2. Layer Responsibilities & Separation of Concerns

### Frontend Layer (`frontend/`)
- **Presentation & Interaction**: Renders interactive map controls, place cards, information sheets, route guidance steps, and chat interfaces.
- **Client-Side State**: Manages active filter state, user location markers, map camera coordinates, and itinerary views.
- **Security Boundary**: **No backend logic, database credentials, or secret API keys** exist in frontend code. All external map/AI requests are either secured with restricted tokens or proxied through the backend.

### Backend Layer (`backend/`)
- **Gateway & Controller**: Validates incoming client requests, manages CORS policies, and coordinates service calls.
- **Business Logic & Services**:
  - `Places`: Fetches and caches enriched temple, ghat, accommodation, and amenity records.
  - `Routing`: Calculates walking routes, transit shuttle loops, and emergency corridors avoiding bottleneck areas.
  - `GIS`: Executes spatial queries (e.g. `$near`, `$geoWithin`, bounding box calculations) for proximity discovery.
  - `AI`: Translates unstructured user queries into structured spatial actions and customized itinerary schedules.
- **Data Persistence**: Connects to MongoDB for document storage and geospatial indexing.

### Data Layer (`data/`)
- **Geographic Polygons & Vectors**: GeoJSON boundary definitions for Nashik and Trimbakeshwar sectors, ghat steps, and vehicle-free pilgrimage walking corridors.
- **Static Catalogs**: Curated and verified place registries with cultural and historical metadata.

---

## 3. Data Flow Scenario: Pilgrim Seeking Ramkund Aarti

1. **User Input**: Pilgrim asks in chat: *"How do I reach Ramkund for evening Aarti avoiding crowded lanes?"*
2. **AI Intent Extraction**: Backend AI Service parses intent: `target: "Ramkund"`, `event: "Sandhya Aarti"`, `constraint: "avoid_high_density"`.
3. **GIS & Places Query**: GIS Service identifies Ramkund coordinates and active pedestrian zones.
4. **Routing Calculation**: Routing Service checks safety corridors and generates step-by-step pedestrian path with entry checkpoint instructions.
5. **Client Presentation**: Frontend renders the optimal path on the map with clear waypoints and an advisory card.
