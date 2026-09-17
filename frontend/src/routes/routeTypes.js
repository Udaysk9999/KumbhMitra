// @ts-check
/**
 * @typedef {Object} RoutePoint
 * @property {string} id - Unique identifier for the point.
 * @property {string} name - Human readable name.
 * @property {string} [category] - Optional category label.
 * @property {string} [categoryIcon] - Optional icon for UI.
 * @property {number} latitude - Latitude in decimal degrees.
 * @property {number} longitude - Longitude in decimal degrees.
 * @property {string} [address] - Optional full address.
 * @property {string} [region] - Optional region (e.g., "Nashik", "Trimbakeshwar").
 */

/**
 * @typedef {Object} RouteStep
 * @property {number} stepIndex - Sequence number of the step.
 * @property {string} instruction - Human readable navigation instruction.
 * @property {number} distanceKm - Distance of this step in kilometres.
 * @property {string} distanceText - Formatted distance string.
 * @property {number} durationMinutes - Duration of this step in minutes.
 * @property {string} durationText - Formatted duration string.
 * @property {string} maneuver - Semantic maneuver type (e.g., "depart", "turn-right").
 * @property {string} icon - Emoji or icon representing the step.
 */

/**
 * @typedef {Object} RouteData
 * @property {string} id - Unique route identifier.
 * @property {RoutePoint} start - Origin point details.
 * @property {RoutePoint} destination - Destination point details.
 * @property {number} distanceKm - Total route distance in kilometres.
 * @property {string} distanceText - Formatted distance.
 * @property {number} durationMinutes - Total travel time in minutes.
 * @property {string} durationText - Formatted duration.
 * @property {'walking'|'driving'|'shuttle'} travelMode - Travel mode identifier.
 * @property {string} modeLabel - Human readable mode label.
 * @property {string} modeIcon - Icon representing the mode.
 * @property {string} modeColor - Hex colour for UI styling.
 * @property {Array.<[number, number]>} geometry - GeoJSON LineString coordinates [[lng, lat], ...].
 * @property {Array.<RouteStep>} [steps] - Optional turn‑by‑turn steps.
 * @property {'api'|'mock'} source - Indicates whether data came from live API or mock generator.
 */

/**
 * Exported types for tooling and documentation purposes.
 */
export const RouteTypes = {};
