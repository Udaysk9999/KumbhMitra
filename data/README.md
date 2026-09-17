# Data Layer: AI KumbhMitra

This directory stores spatial assets, GeoJSON features, place catalogs, and reference datasets for Nashik and Trimbakeshwar for the Kumbh Mela 2027 application.

## Directory Structure

- `places/`: Normalized JSON catalogs of places of interest (temples, ghats, medical facilities, parking, hotels, etc.).
- `geojson/`: Spatial polygons, paths, administrative boundaries, sector divisions, and route geometries.

## Data Guidelines

1. **Coordinate System**: All geographic coordinates must follow WGS84 (`[longitude, latitude]`) standard conforming to RFC 7946 for GeoJSON.
2. **Idempotency**: All records must contain unique identifiers (e.g. `place_ramkund_nashik`).
3. **Data Verification**: All place information, contact numbers, and timings should be verified against official Kumbh Mela administration releases.
