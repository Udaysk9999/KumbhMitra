# AI KumbhMitra - API Documentation

This directory details the REST API specifications for the AI KumbhMitra backend service.

---

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://api.kumbhmitra.example.com/api` (TBD)

---

## Implemented Endpoints (Phase 1)

### 1. Health Check

Verifies backend server availability and health status.

- **URL**: `/health`
- **Method**: `GET`
- **Auth Required**: No
- **Query Parameters**: None
- **Response Headers**: `Content-Type: application/json`

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "AI KumbhMitra backend is running"
}
```

---

## Planned Endpoints (Future Phases)

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Places** | `GET` | `/places` | Search & filter POIs by category and bounding box |
| **Places** | `GET` | `/places/:id` | Detailed place info (timings, photos, history) |
| **GIS** | `GET` | `/gis/nearby` | Find places within radius from coordinates |
| **Routing** | `POST` | `/routing/directions` | Calculate safe route between origin & destination |
| **AI** | `POST` | `/ai/chat` | Natural language conversational assistance |
| **AI** | `POST` | `/ai/itinerary` | Generate customized day-wise itinerary |
| **Kumbh** | `GET` | `/kumbh/schedule` | Shahi Snan dates, Aarti times, and alerts |
| **Emergency**| `GET` | `/emergency/contacts` | First-aid posts, police chowkis, emergency helplines |
