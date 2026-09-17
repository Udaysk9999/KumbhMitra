# AI KumbhMitra - Local Development Setup Guide

This document explains how to set up, configure, run, and verify the AI KumbhMitra project in your local development environment.

---

## 1. Environment Requirements

- **Node.js**: `v20.x` or higher (Recommended: `v20.x` LTS or `v24.x`)
- **npm**: `v10.x` or higher
- **Git**: Installed and configured
- **Operating System**: Windows, macOS, or Linux

Verify your installation:
```bash
node -v
npm -v
```

---

## 2. Repository Structure

The project is structured as a monorepo containing separate `frontend` and `backend` services:

```
AI-KumbhMitra/
├── frontend/    # React + Vite + Tailwind CSS client
├── backend/     # Node.js + Express API server
├── data/        # Places & GeoJSON geospatial data
└── docs/        # Architectural and operational documentation
```

---

## 3. Environment Variables Setup

Both frontend and backend provide template files:

### Frontend
In `frontend/`:
```bash
cp .env.example .env
```
Key variables:
- `VITE_API_BASE_URL`: Base URL for the Express backend API (Default: `http://localhost:5000/api`)

### Backend
In `backend/`:
```bash
cp .env.example .env
```
Key variables:
- `PORT`: Server port (Default: `5000`)
- `NODE_ENV`: Runtime environment (`development` / `production`)
- `MONGODB_URI`: MongoDB connection string (Reserved for future database phase)
- `GOOGLE_MAPS_API_KEY`: Maps platform key (Reserved for future maps phase)
- `AI_API_KEY`: LLM API key (Reserved for future AI phase)

> **Important**: Never commit `.env` files with secret keys. The `.gitignore` file is strictly configured to prevent secret leaks.

---

## 4. Frontend Setup & Execution

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the frontend application:
   - URL: `http://localhost:5173`

### Other Frontend Scripts:
- Build for production:
  ```bash
  npm run build
  ```
- Preview production build:
  ```bash
  npm run preview
  ```

---

## 5. Backend Setup & Execution

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (with nodemon auto-restart):
   ```bash
   npm run dev
   ```
4. Or run the standard production start script:
   ```bash
   npm start
   ```

The server will listen on `http://localhost:5000`.

---

## 6. Health-Check Endpoint Verification

To verify that the backend is running properly, send an HTTP GET request to the health-check route:

### Using cURL:
```bash
curl http://localhost:5000/api/health
```

### Using PowerShell:
```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

### Expected Response:
```json
{
  "success": true,
  "message": "AI KumbhMitra backend is running"
}
```

---

## 7. Next Steps

Once the foundation is running, future phases will introduce:
- 2D and 3D map viewport integrations
- MongoDB database collections for POIs
- Spatial query APIs and routing engines
- AI conversational guide and dynamic itinerary planner
