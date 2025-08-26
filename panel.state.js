/**
 * State management for the GTM Inspector DevTools panel
 * Maintains application state including dataLayer data, events, and UI state
 */

/**
 * Application state object
 * Contains all the data needed to track the current state of the panel
 * @typedef {Object} PanelState
 * @property {string|null} lastDataLayerHash - Hash of the last dataLayer for change detection
 * @property {Array} currentDataLayer - Current dataLayer array from the page
 * @property {Set<string>} currentEvents - Set of unique event names found in dataLayer
 * @property {number|null} refreshInterval - ID for auto-refresh interval (if enabled)
 * @property {boolean} autoRefresh - Whether auto-refresh is currently enabled
 */

/**
 * Initial state configuration
 * @type {PanelState}
 */
const initialState = {
  lastDataLayerHash: null,
  currentDataLayer: [],
  currentEvents: new Set(),
  refreshInterval: null,
  autoRefresh: false
};

/**
 * Application state container
 * @type {PanelState}
 */
export const state = { ...initialState };

/**
 * Updates the last dataLayer hash for change detection
 * @param {string|null} hash - The new hash value
 */
export function setLastHash(hash) {
  if (typeof hash !== 'string' && hash !== null) {
    console.warn('setLastHash: Expected string or null, got:', typeof hash);
    return;
  }
  state.lastDataLayerHash = hash;
}

/**
 * Resets the application state to initial values
 * Useful when navigating to a new page or clearing data
 */
export function resetState() {
  state.lastDataLayerHash = initialState.lastDataLayerHash;
  state.currentDataLayer = [...initialState.currentDataLayer];
  state.currentEvents = new Set(initialState.currentEvents);
  
  // Clean up any active intervals
  if (state.refreshInterval) {
    clearInterval(state.refreshInterval);
    state.refreshInterval = initialState.refreshInterval;
  }
  
  state.autoRefresh = initialState.autoRefresh;
}

/**
 * Updates the current dataLayer and extracts unique events
 * @param {Array} dataLayer - The new dataLayer array
 */
export function updateCurrentDataLayer(dataLayer) {
  if (!Array.isArray(dataLayer)) {
    console.warn('updateCurrentDataLayer: Expected array, got:', typeof dataLayer);
    return;
  }
  
  state.currentDataLayer = [...dataLayer];
  
  // Extract unique event names
  const events = new Set();
  dataLayer.forEach(item => {
    if (item && typeof item === 'object' && item.event) {
      events.add(item.event);
    }
  });
  
  state.currentEvents = events;
}

/**
 * Gets the current state as a read-only snapshot
 * Useful for debugging or state inspection
 * @returns {Readonly<PanelState>} Read-only state object
 */
export function getStateSnapshot() {
  return Object.freeze({
    lastDataLayerHash: state.lastDataLayerHash,
    currentDataLayer: [...state.currentDataLayer],
    currentEvents: new Set(state.currentEvents),
    refreshInterval: state.refreshInterval,
    autoRefresh: state.autoRefresh
  });
}
