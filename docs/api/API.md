# AI KumbhMitra - API Specification & Contract

This document provides the complete REST API specification for Phase 4 of the AI KumbhMitra backend service.

---

## 1. Scope & Standards

### Geographic Scope
- **Nashik & Trimbakeshwar, Maharashtra, India** (Coordinates bounding box approx: `Lat: [19.85 to 20.10], Lng: [73.45 to 73.90]`).
- All geospatial points of interest (POIs) and routing paths pertain specifically to the Godavari riverbanks, Panchavati pilgrimage corridor, Trimbakeshwar Jyotirlinga, Kushavarta Kund, and surrounding Kumbh Mela infrastructure.

### Standard Response Format

#### Success Envelope (Collections / Lists):
```json
{
  "success": true,
  "count": 10,
  "total": 10,
  "page": 1,
  "totalPages": 1,
  "data": [ ... ]
}
```

#### Success Envelope (Single Objects):
```json
{
  "success": true,
  "count": 1,
  "data": { ... }
}
```

#### Error Envelope:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

---

## 2. Endpoints

### 2.1 Health Check

Verifies server status and availability.

- **Method**: `GET`
- **URL**: `/api/health`
- **Query Parameters**: None
- **Body**: None

#### Example Request:
```bash
curl -X GET http://localhost:5000/api/health
```

#### Example Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "AI KumbhMitra backend is running",
  "data": {
    "status": "healthy",
    "service": "ai-kumbhmitra-backend",
    "scope": "Nashik & Trimbakeshwar",
    "timestamp": "2026-09-17T13:45:00.000Z"
  }
}
```

---

### 2.2 Get All Places (Paginated & Filtered)

Retrieves places of interest in Nashik and Trimbakeshwar with optional category filtering and text search.

- **Method**: `GET`
- **URL**: `/api/places`
- **Query Parameters**:
  - `page` *(number, optional, default: 1)*: 1-indexed page number. Must be integer `>= 1`.
  - `limit` *(number, optional, default: 20, max: 100)*: Items per page. Must be integer `>= 1`.
  - `category` *(string, optional)*: Filter by POI category. Allowed values:
    `temple`, `ghat`, `tourist_spot`, `restaurant`, `hotel`, `hospital`, `parking`, `police`, `fire_station`, `transport`, `toilet`, `water_point`, `help_center`, `shop`.
  - `search` *(string, optional)*: Text search matching name or description.
- **Body**: None

#### Example Request:
```bash
curl -X GET "http://localhost:5000/api/places?category=temple&search=Kalaram&page=1&limit=10"
```

#### Example Success Response (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "6aab8aa442ec784f29a2b354",
      "name": "Kalaram Temple",
      "category": "temple",
      "location": {
        "type": "Point",
        "coordinates": [73.7925, 20.0078]
      },
      "address": "Panchavati Main Chowk, Nashik, Maharashtra 422003",
      "description": "Historic 18th-century black stone temple dedicated to Lord Rama, central to Panchavati heritage pilgrimage.",
      "contact": "+91 253 251 1234",
      "openingHours": {
        "open": "05:00",
        "close": "22:00"
      },
      "accessibility": {
        "wheelchairAccessible": true,
        "seniorFriendly": true
      },
      "services": [
        "Darshan",
        "Pooja Booking",
        "Prasad Counter"
      ]
    }
  ]
}
```

#### Example Error Response (`400 Bad Request`):
```json
{
  "success": false,
  "error": "Invalid category 'invalid_category'. Allowed categories: temple, ghat, tourist_spot, restaurant, hotel, hospital, parking, police, fire_station, transport, toilet, water_point, help_center, shop."
}
```

---

### 2.3 Get Nearby Places (Geospatial 2dsphere Proximity)

Queries places within a radial distance from specified latitude/longitude coordinates using MongoDB `$near` indexing. Returns results sorted by ascending distance.

- **Method**: `GET`
- **URL**: `/api/places/nearby`
- **Query Parameters**:
  - `lat` *(float, required)*: Latitude in degrees (`-90` to `90`). Example: `20.0059` (Ram Kund Ghat).
  - `lng` *(float, required)*: Longitude in degrees (`-180` to `180`). Example: `73.7904`.
  - `radius` *(number, optional, default: 5000)*: Search radius in meters. Must be `> 0`.
  - `category` *(string, optional)*: Optional category filter.
- **Body**: None

#### Example Request:
```bash
curl -X GET "http://localhost:5000/api/places/nearby?lat=20.0059&lng=73.7904&radius=5000&category=ghat"
```

#### Example Success Response (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6aab8aa442ec784f29a2b353",
      "name": "Ram Kund Ghat",
      "category": "ghat",
      "location": {
        "type": "Point",
        "coordinates": [73.7904, 20.0059]
      },
      "address": "Panchavati, Godavari Riverbank, Nashik, Maharashtra 422003",
      "description": "Sacred bathing ghat where millions take the holy dip during Kumbh Mela and Shahi Snan rituals."
    }
  ]
}
```

#### Example Error Response (`400 Bad Request`):
```json
{
  "success": false,
  "error": "Query parameter 'lat' must be a valid number between -90 and 90."
}
```

---

### 2.4 Get Place Details by ID

Fetches full record for a specific place using its 24-character hexadecimal MongoDB `ObjectId`.

- **Method**: `GET`
- **URL**: `/api/places/:id`
- **URL Parameters**:
  - `id` *(string, required)*: 24-character hexadecimal MongoDB ObjectId.
- **Query Parameters**: None
- **Body**: None

#### Example Request:
```bash
curl -X GET "http://localhost:5000/api/places/6aab8aa442ec784f29a2b353"
```

#### Example Success Response (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "data": {
    "_id": "6aab8aa442ec784f29a2b353",
    "name": "Ram Kund Ghat",
    "category": "ghat",
    "location": {
      "type": "Point",
      "coordinates": [73.7904, 20.0059]
    },
    "address": "Panchavati, Godavari Riverbank, Nashik, Maharashtra 422003",
    "description": "Sacred bathing ghat where millions take the holy dip during Kumbh Mela and Shahi Snan rituals.",
    "contact": "+91 253 257 0000",
    "openingHours": {
      "open": "00:00",
      "close": "23:59"
    },
    "accessibility": {
      "wheelchairAccessible": true,
      "seniorFriendly": true
    },
    "services": [
      "Holy Dip",
      "Godavari Aarti",
      "Changing Rooms",
      "Life Guard Post",
      "Lost & Found Booth"
    ]
  }
}
```

#### Example Error Responses:
- **`400 Bad Request`** (Invalid format):
```json
{
  "success": false,
  "error": "Invalid place ID format. Must be a 24-character hexadecimal string."
}
```
- **`404 Not Found`** (ID valid format, but record doesn't exist):
```json
{
  "success": false,
  "error": "Place not found with ID: 507f1f77bcf86cd799439011"
}
```

---

### 2.5 Calculate Route (OSRM Routing Engine)

Calculates driving or walking road geometries, travel distances, and estimated travel times between pilgrimage coordinates in Nashik and Trimbakeshwar.

- **Method**: `POST`
- **URL**: `/api/routes`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  - `origin` *(object, required)*:
    - `lat` *(number, required)*: Latitude (`-90` to `90`).
    - `lng` *(number, required)*: Longitude (`-180` to `180`).
  - `destination` *(object, required)*:
    - `lat` *(number, required)*: Latitude (`-90` to `90`).
    - `lng` *(number, required)*: Longitude (`-180` to `180`).
  - `mode` *(string, optional, default: "driving")*: Travel mode (`"driving"`, `"foot"`, or `"walking"`).

#### Example Request:
```bash
curl -X POST http://localhost:5000/api/routes \
  -H "Content-Type: application/json" \
  -d '{
    "origin": { "lat": 20.0059, "lng": 73.7904 },
    "destination": { "lat": 19.9324, "lng": 73.5302 },
    "mode": "driving"
  }'
```

#### Example Success Response (`200 OK`):
```json
{
  "success": true,
  "data": {
    "origin": { "lat": 20.0059, "lng": 73.7904 },
    "destination": { "lat": 19.9324, "lng": 73.5302 },
    "mode": "driving",
    "distanceKm": 29.8,
    "durationMins": 26,
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [73.7904, 20.0059],
        [73.7905, 20.0051],
        [73.5302, 19.9324]
      ]
    },
    "steps": [
      {
        "instruction": "Depart towards destination",
        "distanceMeters": 226,
        "durationSeconds": 35,
        "name": "",
        "mode": "driving",
        "maneuver": {
          "type": "depart",
          "modifier": "right"
        }
      },
      {
        "instruction": "Turn right onto MG Road",
        "distanceMeters": 661,
        "durationSeconds": 66,
        "name": "MG Road",
        "mode": "driving",
        "maneuver": {
          "type": "turn",
          "modifier": "right"
        }
      }
    ]
  }
}
```

#### Example Error Responses:
- **`400 Bad Request`** (Missing or invalid input):
```json
{
  "success": false,
  "error": "Field 'origin.lat' must be a valid latitude between -90 and 90."
}
```
- **`422 Unprocessable Entity`** (No navigable route found):
```json
{
  "success": false,
  "error": "No route found for specified points (OSRM code: NoRoute)"
}
```
- **`502 Bad Gateway`** (OSRM upstream timeout or failure):
```json
{
  "success": false,
  "error": "OSRM routing request timed out after 12 seconds"
}
```

---

### 2.6 Itinerary Planner

Generates a multi-day itinerary across selected Nashik and Trimbakeshwar points of interest using spatial clustering and nearest-neighbor route ordering, with real-road OSRM distances and durations.

- **Method**: `POST`
- **URL**: `/api/itinerary`
- **Headers**: `Content-Type: application/json`

#### Parameters:

| Field | Type | Required | Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `days` | `number` | No | Integer $1 \le \text{days} \le 7$, $\text{days} \le \text{placeIds.length}$ | Number of itinerary days (default: 1) |
| `placeIds` | `string[]` | Yes | Non-empty array of valid 24-character hexadecimal MongoDB ObjectIds | Unique place IDs to include in the itinerary |
| `startLocation` | `object` | No | `{ latitude: Number, longitude: Number }` | Optional starting coordinates |

#### Example Request:
```bash
curl -X POST http://localhost:5000/api/itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "days": 2,
    "placeIds": [
      "6aac2a46ec17e8ecf98834b8",
      "6aac2a46ec17e8ecf98834b9",
      "6aac2a46ec17e8ecf98834c3",
      "6aac2a46ec17e8ecf98834c4"
    ],
    "startLocation": {
      "latitude": 20.0059,
      "longitude": 73.7904
    }
  }'
```

#### Example Success Response (`200 OK`):
```json
{
  "success": true,
  "count": 2,
  "data": {
    "days": [
      {
        "day": 1,
        "places": [
          {
            "order": 1,
            "place": {
              "_id": "6aac2a46ec17e8ecf98834b8",
              "name": "Ram Kund Ghat",
              "category": "ghat",
              "subcategory": "Sacred Ghat",
              "description": "The central holy bathing ghat on the banks of Godavari...",
              "location": {
                "type": "Point",
                "coordinates": [73.7904, 20.0059]
              },
              "address": { "city": "Nashik", "area": "Panchavati" },
              "importance": 5
            },
            "visitDuration": 60,
            "travelFromPrevious": {
              "distance": 0,
              "duration": 0
            }
          },
          {
            "order": 2,
            "place": {
              "_id": "6aac2a46ec17e8ecf98834b9",
              "name": "Kalaram Temple",
              "category": "temple",
              "subcategory": "Ancient Temple",
              "description": "Historic black stone temple dedicated to Lord Rama...",
              "location": {
                "type": "Point",
                "coordinates": [73.7938, 20.0067]
              },
              "address": { "city": "Nashik", "area": "Panchavati" },
              "importance": 5
            },
            "visitDuration": 45,
            "travelFromPrevious": {
              "distance": 0.8,
              "duration": 3
            }
          }
        ],
        "totalTravelDistance": 0.8,
        "totalTravelDuration": 3,
        "totalVisitDuration": 105
      },
      {
        "day": 2,
        "places": [
          {
            "order": 1,
            "place": {
              "_id": "6aac2a46ec17e8ecf98834c4",
              "name": "Kushavarta Kund",
              "category": "ghat",
              "subcategory": "Sacred Water Tank",
              "location": {
                "type": "Point",
                "coordinates": [73.5305, 19.9328]
              },
              "importance": 5
            },
            "visitDuration": 60,
            "travelFromPrevious": {
              "distance": 29.8,
              "duration": 26
            }
          },
          {
            "order": 2,
            "place": {
              "_id": "6aac2a46ec17e8ecf98834c3",
              "name": "Trimbakeshwar Jyotirlinga Temple",
              "category": "temple",
              "subcategory": "Jyotirlinga",
              "location": {
                "type": "Point",
                "coordinates": [73.5308, 19.9325]
              },
              "importance": 5
            },
            "visitDuration": 45,
            "travelFromPrevious": {
              "distance": 0.4,
              "duration": 2
            }
          }
        ],
        "totalTravelDistance": 30.2,
        "totalTravelDuration": 28,
        "totalVisitDuration": 105
      }
    ],
    "summary": {
      "totalDays": 2,
      "totalPlaces": 4,
      "totalDistanceKm": 31.0,
      "totalTravelDurationMins": 31
    }
  }
}
```

#### Example Error Responses:
- **`400 Bad Request`** (Empty or invalid place list):
```json
{
  "success": false,
  "error": "Field 'placeIds' cannot be empty. Please select at least one place."
}
```
- **`400 Bad Request`** (Invalid ObjectId):
```json
{
  "success": false,
  "error": "Invalid place ID format at index 0: 'xyz123'. Must be a 24-character hexadecimal string."
}
```
- **`400 Bad Request`** (Duplicate place IDs):
```json
{
  "success": false,
  "error": "Duplicate place IDs detected in 'placeIds'. Each place can only be selected once."
}
```
- **`400 Bad Request`** (Days exceeds selected places count):
```json
{
  "success": false,
  "error": "Field 'days' (3) cannot exceed the number of selected places (2)."
}
```

