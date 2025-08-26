/**
 * Main panel script - Entry point for the GTM Inspector DevTools panel
 * Handles DOM events, data refresh, and navigation monitoring
 */

import { els, displayDataLayer, displayNoData, updateEventFilter, clearDisplay } from './panel.view.js';
import { refreshDataLayerFromPage } from './panel.data.js';
import { state, resetState } from './panel.state.js';

/**
 * Configuration constants
 */
const CONFIG = {
  NAVIGATION_DELAY: 1000, // Delay after navigation before refreshing data
  STATUS_MESSAGES: {
    NO_DATA: 'No GTM found on this page',
    DATA_FOUND: (count) => `GTM found with ${count} items`
  }
};

/**
 * Creates standardized callback handlers for data refresh operations
 * @returns {Object} Object with onNoData and onDataFound callbacks
 */
function createDataRefreshCallbacks() {
  return {
    onNoData: () => {
      els.statusEl.textContent = CONFIG.STATUS_MESSAGES.NO_DATA;
      displayNoData();
    },
    onDataFound: (result) => {
      updateEventFilter(result.data);
      els.statusEl.textContent = CONFIG.STATUS_MESSAGES.DATA_FOUND(result.length);
      displayDataLayer(result.data);
    }
  };
}

/**
 * Handles manual refresh button click
 */
function handleRefreshClick() {
  refreshDataLayerFromPage(createDataRefreshCallbacks());
}

/**
 * Handles event filter change
 */
function handleEventFilterChange() {
  if (state.currentDataLayer && state.currentDataLayer.length > 0) {
    displayDataLayer(state.currentDataLayer);
  }
}

/**
 * Handles navigation changes in the inspected window
 * Resets state and refreshes data after a delay
 */
function handleNavigation() {
  // Reset application state
  resetState();
  updateEventFilter([]);
  
  // Refresh data after a delay to allow page to load
  setTimeout(() => {
    refreshDataLayerFromPage(createDataRefreshCallbacks());
  }, CONFIG.NAVIGATION_DELAY);
}

/**
 * Initializes the panel by setting up event listeners and loading initial data
 */
function initializePanel() {
  // Set up DOM event listeners
  els.refreshBtn.addEventListener('click', handleRefreshClick);
  els.clearBtn.addEventListener('click', clearDisplay);
  els.eventFilter.addEventListener('change', handleEventFilterChange);
  
  // Set up navigation listener
  chrome.devtools.network.onNavigated.addListener(handleNavigation);
  
  // Load initial data
  refreshDataLayerFromPage(createDataRefreshCallbacks());
}

// Initialize the panel when script loads
initializePanel();