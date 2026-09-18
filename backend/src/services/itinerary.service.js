import mongoose from 'mongoose';
import Place from '../models/Place.js';
import { calculateRoute } from './routing.service.js';

/**
 * Standardized estimated visit duration in minutes by POI category.
 * Centralized mapping per project requirements; no database schema modifications.
 */
export const CATEGORY_VISIT_DURATIONS = {
  temple: 45,
  ghat: 60,
  fort: 150,
  cave: 90,
  waterfall: 60,
  museum: 75,
  viewpoint: 45,
  nature: 60,
  tourist_spot: 60,
  ashram: 60,
  akhada: 45,
  kumbh_zone: 60,
  restaurant: 45,
  hotel: 30,
  dharamshala: 30,
  bhakta_niwas: 30,
  guest_house: 30,
  hospital: 30,
  medical: 30,
  pharmacy: 15,
  police: 20,
  fire_station: 20,
  emergency: 20,
  transport: 30,
  railway: 30,
  bus_stand: 20,
  parking: 15,
  water_point: 10,
  public_toilet: 10,
  toilet: 10,
  help_center: 20,
  tourist_information: 20,
  rest_area: 25,
  government_facility: 30,
  other_public_facility: 30,
  shop: 30,
  default: 45
};

/**
 * Geographic bounding box for Nashik & Trimbakeshwar region.
 */
const NASHIK_TRIMBAK_BOUNDS = {
  minLat: 19.5,
  maxLat: 20.5,
  minLng: 73.0,
  maxLng: 74.5
};

/**
 * Great-circle distance between two coordinates in kilometers (Haversine formula).
 */
export const calculateHaversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Extract latitude and longitude from a Place document.
 */
const getPlaceCoordinates = (place) => {
  if (place.location?.coordinates && Array.isArray(place.location.coordinates)) {
    return {
      lat: place.location.coordinates[1],
      lng: place.location.coordinates[0]
    };
  }
  return {
    lat: place.latitude || 0,
    lng: place.longitude || 0
  };
};

/**
 * Get visit duration in minutes for a given place.
 */
export const getVisitDuration = (place) => {
  if (typeof place.visitDuration === 'number' && place.visitDuration > 0) {
    return place.visitDuration;
  }
  const category = (place.category || '').toLowerCase();
  return CATEGORY_VISIT_DURATIONS[category] || CATEGORY_VISIT_DURATIONS.default;
};

/**
 * Partition places into k geographical clusters deterministically.
 * Uses k-means with longitudinal initialization (Trimbakeshwar is West ~73.53, Nashik is East ~73.79).
 *
 * @param {Array} places - Array of place documents
 * @param {number} k - Number of days/clusters
 * @returns {Array<Array>} Array of clusters
 */
export const clusterPlacesByProximity = (places, k) => {
  if (k <= 1 || places.length <= k) {
    // If 1 day or fewer/equal places than days, distribute evenly
    const clusters = Array.from({ length: k }, () => []);
    places.forEach((p, idx) => {
      clusters[idx % k].push(p);
    });
    return clusters.filter((c) => c.length > 0);
  }

  // Extract coords for all places
  const coords = places.map((p) => ({
    place: p,
    ...getPlaceCoordinates(p)
  }));

  // Deterministic initial centroids: sort places by longitude (West to East)
  // and pick k evenly spaced elements
  const sorted = [...coords].sort((a, b) => a.lng - b.lng);
  let centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.min(
      sorted.length - 1,
      Math.floor((i / (k - 1)) * (sorted.length - 1))
    );
    centroids.push({ lat: sorted[idx].lat, lng: sorted[idx].lng });
  }

  let clusters = Array.from({ length: k }, () => []);

  // Run up to 10 iterations of k-means
  for (let iter = 0; iter < 10; iter++) {
    clusters = Array.from({ length: k }, () => []);

    // Assign each place to nearest centroid
    coords.forEach((pt) => {
      let bestCluster = 0;
      let minDistance = Infinity;

      centroids.forEach((c, cIdx) => {
        const dist = calculateHaversineDistance(pt.lat, pt.lng, c.lat, c.lng);
        if (dist < minDistance) {
          minDistance = dist;
          bestCluster = cIdx;
        }
      });

      clusters[bestCluster].push(pt.place);
    });

    // Rebalance any empty cluster by taking the furthest place from largest cluster
    clusters.forEach((c, cIdx) => {
      if (c.length === 0) {
        let largestCluster = clusters.reduce(
          (maxIdx, curr, idx) => (curr.length > clusters[maxIdx].length ? idx : maxIdx),
          0
        );
        if (clusters[largestCluster].length > 1) {
          c.push(clusters[largestCluster].pop());
        }
      }
    });

    // Update centroids
    centroids = clusters.map((c) => {
      if (c.length === 0) return { lat: 20.0, lng: 73.7 };
      let sumLat = 0;
      let sumLng = 0;
      c.forEach((p) => {
        const pt = getPlaceCoordinates(p);
        sumLat += pt.lat;
        sumLng += pt.lng;
      });
      return {
        lat: sumLat / c.length,
        lng: sumLng / c.length
      };
    });
  }

  return clusters.filter((c) => c.length > 0);
};

/**
 * Order a list of places within a day using nearest-neighbor traversal.
 *
 * @param {Array} places - Places to visit in the day
 * @param {object} startPoint - { lat, lng } starting location
 * @returns {Array} Sequenced places
 */
export const orderDayPlaces = (places, startPoint) => {
  if (!places || places.length <= 1) {
    return [...places];
  }

  const remaining = [...places];
  const ordered = [];
  let currentCoord = startPoint;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const pCoord = getPlaceCoordinates(remaining[i]);
      const dist = calculateHaversineDistance(
        currentCoord.lat,
        currentCoord.lng,
        pCoord.lat,
        pCoord.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextPlace = remaining.splice(nearestIdx, 1)[0];
    ordered.push(nextPlace);
    currentCoord = getPlaceCoordinates(nextPlace);
  }

  return ordered;
};

/**
 * Calculate travel segment between two places using OSRM with safe fallback.
 */
const calculateLegTravel = async (fromCoord, toCoord) => {
  try {
    const route = await calculateRoute({
      origin: fromCoord,
      destination: toCoord,
      mode: 'driving'
    });
    return {
      distance: route.distanceKm,
      duration: route.durationMins,
      geometry: route.geometry || null,
      source: 'osrm'
    };
  } catch (error) {
    // Graceful fallback to Haversine calculation (1.28x road factor at ~35 km/h avg speed)
    const directKm = calculateHaversineDistance(
      fromCoord.lat,
      fromCoord.lng,
      toCoord.lat,
      toCoord.lng
    );
    const estimatedKm = Math.round(directKm * 1.28 * 10) / 10;
    const estimatedMins = Math.max(Math.round((estimatedKm / 35) * 60), 2);
    return {
      distance: estimatedKm,
      duration: estimatedMins,
      geometry: null,
      source: 'fallback'
    };
  }
};

/**
 * Main Itinerary Generation Engine
 *
 * @param {object} params
 * @param {number} params.days - Number of days (1 to 7)
 * @param {Array<string>} params.placeIds - Array of MongoDB ObjectIds
 * @param {object} [params.startLocation] - Optional { latitude, longitude }
 * @returns {Promise<object>} Generated itinerary breakdown by day
 */
export const planItinerary = async ({ days = 1, placeIds = [], startLocation = null }) => {
  const safeDays = Math.max(1, parseInt(days, 10) || 1);

  // 1. Validate ObjectIds format
  const validObjectIds = placeIds.map((id) => new mongoose.Types.ObjectId(id));

  // 2. Fetch Place documents from MongoDB
  const places = await Place.find({ _id: { $in: validObjectIds } }).lean();

  if (places.length === 0) {
    throw new Error('None of the requested places could be found in the database.');
  }

  if (places.length !== placeIds.length) {
    const foundIds = new Set(places.map((p) => p._id.toString()));
    const missingIds = placeIds.filter((id) => !foundIds.has(id));
    throw new Error(`The following place IDs were not found: ${missingIds.join(', ')}`);
  }

  // 3. Verify all places are within Nashik / Trimbakeshwar bounds
  for (const place of places) {
    const { lat, lng } = getPlaceCoordinates(place);
    if (
      lat < NASHIK_TRIMBAK_BOUNDS.minLat ||
      lat > NASHIK_TRIMBAK_BOUNDS.maxLat ||
      lng < NASHIK_TRIMBAK_BOUNDS.minLng ||
      lng > NASHIK_TRIMBAK_BOUNDS.maxLng
    ) {
      throw new Error(
        `Place '${place.name}' is outside the Nashik & Trimbakeshwar geographic scope.`
      );
    }
  }

  // Determine starting point
  let currentStart = startLocation
    ? { lat: parseFloat(startLocation.latitude), lng: parseFloat(startLocation.longitude) }
    : getPlaceCoordinates(places[0]);

  // 4. Multi-day spatial clustering
  const dayClusters = clusterPlacesByProximity(places, Math.min(safeDays, places.length));

  // Order clusters so the cluster closest to startLocation is Day 1
  dayClusters.sort((a, b) => {
    const avgA = a.reduce((acc, p) => acc + getPlaceCoordinates(p).lat, 0) / a.length;
    const avgALng = a.reduce((acc, p) => acc + getPlaceCoordinates(p).lng, 0) / a.length;
    const avgB = b.reduce((acc, p) => acc + getPlaceCoordinates(p).lat, 0) / b.length;
    const avgBLng = b.reduce((acc, p) => acc + getPlaceCoordinates(p).lng, 0) / b.length;

    const distA = calculateHaversineDistance(currentStart.lat, currentStart.lng, avgA, avgALng);
    const distB = calculateHaversineDistance(currentStart.lat, currentStart.lng, avgB, avgBLng);
    return distA - distB;
  });

  // 5. Sequence places and compute legs within each day
  const resultDays = [];
  let grandTotalDistance = 0;
  let grandTotalDuration = 0;
  let grandTotalPlaces = 0;

  for (let dIdx = 0; dIdx < dayClusters.length; dIdx++) {
    const dayNum = dIdx + 1;
    const rawCluster = dayClusters[dIdx];

    // Sequence places within the cluster
    const sequencedPlaces = orderDayPlaces(rawCluster, currentStart);

    let dayTotalDistance = 0;
    let dayTotalDuration = 0;
    let dayTotalVisitDuration = 0;
    const dayPlaces = [];

    let prevCoord = currentStart;

    for (let pIdx = 0; pIdx < sequencedPlaces.length; pIdx++) {
      const p = sequencedPlaces[pIdx];
      const pCoord = getPlaceCoordinates(p);
      const visitDuration = getVisitDuration(p);
      dayTotalVisitDuration += visitDuration;

      let travelFromPrevious = {
        distance: 0,
        duration: 0
      };

      // Travel from previous stop (or start location for order 1 if specified)
      if (pIdx > 0 || (dIdx === 0 && startLocation)) {
        const leg = await calculateLegTravel(prevCoord, pCoord);
        travelFromPrevious = {
          distance: leg.distance,
          duration: leg.duration,
          geometry: leg.geometry
        };
        dayTotalDistance += leg.distance;
        dayTotalDuration += leg.duration;
      }

      dayPlaces.push({
        order: pIdx + 1,
        place: {
          _id: p._id.toString(),
          name: p.name,
          category: p.category,
          subcategory: p.subcategory || null,
          description: p.description || null,
          location: p.location,
          address: p.address || null,
          openingHours: p.openingHours || null,
          contact: p.contact || null,
          importance: p.importance || 3
        },
        visitDuration,
        travelFromPrevious
      });

      prevCoord = pCoord;
      grandTotalPlaces++;
    }

    // Round day totals
    dayTotalDistance = Math.round(dayTotalDistance * 10) / 10;
    dayTotalDuration = Math.round(dayTotalDuration);

    grandTotalDistance += dayTotalDistance;
    grandTotalDuration += dayTotalDuration;

    resultDays.push({
      day: dayNum,
      places: dayPlaces,
      totalTravelDistance: dayTotalDistance,
      totalTravelDuration: dayTotalDuration,
      totalVisitDuration: dayTotalVisitDuration
    });

    // For next day, the starting reference point can be the last place of this day
    currentStart = prevCoord;
  }

  return {
    days: resultDays,
    summary: {
      totalDays: resultDays.length,
      totalPlaces: grandTotalPlaces,
      totalDistanceKm: Math.round(grandTotalDistance * 10) / 10,
      totalTravelDurationMins: Math.round(grandTotalDuration)
    }
  };
};

export default {
  CATEGORY_VISIT_DURATIONS,
  calculateHaversineDistance,
  getVisitDuration,
  clusterPlacesByProximity,
  orderDayPlaces,
  planItinerary
};
