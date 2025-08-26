import { hashCode } from './panel.utils.js';
import { state, setLastHash } from './panel.state.js';

export function createDataLayerHash(dataLayer) {
  try {
    const jsonString = JSON.stringify(dataLayer);
    return hashCode(jsonString);
  } catch (error) {
    return Date.now() + '-' + (dataLayer ? dataLayer.length : 0);
  }
}

export function refreshDataLayerFromPage(callbacks) {
  // callbacks: { onNoData, onDataFound }
  chrome.devtools.inspectedWindow.eval(`(function() {
      if (typeof window.dataLayer !== 'undefined') {
          return { exists: true, data: window.dataLayer, length: window.dataLayer.length };
      } else { return { exists: false }; }
  })()` , function(result, isException) {
    if (isException || !result) {
      if (callbacks && callbacks.onNoData) callbacks.onNoData();
      return;
    }
    if (result.exists) {
      const currentHash = createDataLayerHash(result.data);
      if (currentHash !== state.lastDataLayerHash) {
        setLastHash(currentHash);
        state.currentDataLayer = result.data;
        if (callbacks && callbacks.onDataFound) callbacks.onDataFound(result);
      }
    } else {
      if (state.lastDataLayerHash !== null) {
        setLastHash(null);
        state.currentDataLayer = [];
        if (callbacks && callbacks.onNoData) callbacks.onNoData();
      }
    }
  });
}
