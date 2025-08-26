import { hashCode } from './panel.utils.js';
import { state, setLastHash } from './panel.state.js';

/**
 * Script to evaluate in the inspected window to retrieve dataLayer
 * @constant {string}
 */
const DATA_LAYER_EVAL_SCRIPT = `
  (function() {
    try {
      if (typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer)) {
        return { 
          exists: true, 
          data: window.dataLayer, 
          length: window.dataLayer.length 
        };
      }
      return { exists: false };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  })()
`;

/**
 * Creates a hash for the dataLayer to detect changes
 * @param {Array} dataLayer - The dataLayer array
 * @returns {string} Hash string representing the dataLayer state
 */
export function createDataLayerHash(dataLayer) {
  if (!dataLayer || !Array.isArray(dataLayer)) {
    return `empty-${Date.now()}`;
  }
  
  try {
    const jsonString = JSON.stringify(dataLayer);
    return hashCode(jsonString);
  } catch (error) {
    console.warn('Failed to create dataLayer hash:', error);
    return `fallback-${Date.now()}-${dataLayer.length}`;
  }
}

/**
 * Validates callback object structure
 * @param {Object} callbacks - Callback object
 * @returns {boolean} True if callbacks are valid
 */
function validateCallbacks(callbacks) {
  if (!callbacks || typeof callbacks !== 'object') {
    console.warn('Invalid callbacks provided to refreshDataLayerFromPage');
    return false;
  }
  
  if (callbacks.onNoData && typeof callbacks.onNoData !== 'function') {
    console.warn('onNoData callback is not a function');
    return false;
  }
  
  if (callbacks.onDataFound && typeof callbacks.onDataFound !== 'function') {
    console.warn('onDataFound callback is not a function');
    return false;
  }
  
  return true;
}

/**
 * Handles the case when dataLayer exists and has been updated
 * @param {Object} result - Result from inspected window evaluation
 * @param {Object} callbacks - Callback functions
 */
function handleDataLayerFound(result, callbacks) {
  const currentHash = createDataLayerHash(result.data);
  
  // Only update if data has actually changed
  if (currentHash !== state.lastDataLayerHash) {
    setLastHash(currentHash);
    state.currentDataLayer = result.data;
    
    if (callbacks.onDataFound) {
      callbacks.onDataFound(result);
    }
  }
}

/**
 * Handles the case when dataLayer doesn't exist or was removed
 * @param {Object} callbacks - Callback functions
 */
function handleDataLayerNotFound(callbacks) {
  // Only call callback if we previously had data
  if (state.lastDataLayerHash !== null) {
    setLastHash(null);
    state.currentDataLayer = [];
    
    if (callbacks.onNoData) {
      callbacks.onNoData();
    }
  }
}

/**
 * Handles errors from the inspected window evaluation
 * @param {any} isException - Exception information from Chrome DevTools
 * @param {Object} callbacks - Callback functions
 */
function handleEvaluationError(isException, callbacks) {
  console.error('Error evaluating dataLayer in inspected window:', isException);
  
  if (callbacks.onNoData) {
    callbacks.onNoData();
  }
}

/**
 * Refreshes dataLayer data from the inspected page
 * @param {Object} callbacks - Callback object with onNoData and onDataFound functions
 * @param {Function} [callbacks.onNoData] - Called when no dataLayer is found
 * @param {Function} [callbacks.onDataFound] - Called when dataLayer is found with new data
 * 
 * @example
 * refreshDataLayerFromPage({
 *   onNoData: () => console.log('No dataLayer found'),
 *   onDataFound: (result) => console.log('Found dataLayer with', result.length, 'items')
 * });
 */
export function refreshDataLayerFromPage(callbacks = {}) {
  if (!validateCallbacks(callbacks)) {
    return;
  }
  
  chrome.devtools.inspectedWindow.eval(
    DATA_LAYER_EVAL_SCRIPT,
    (result, isException) => {
      // Handle evaluation errors
      if (isException) {
        handleEvaluationError(isException, callbacks);
        return;
      }
      
      // Handle null/undefined result
      if (!result) {
        handleDataLayerNotFound(callbacks);
        return;
      }
      
      // Handle result based on dataLayer existence
      if (result.exists) {
        handleDataLayerFound(result, callbacks);
      } else {
        handleDataLayerNotFound(callbacks);
      }
    }
  );
}
