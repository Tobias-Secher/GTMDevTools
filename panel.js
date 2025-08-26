import { els, displayDataLayer, displayNoData, updateEventFilter, clearDisplay, copyEntireDataLayer } from './panel.view.js';
import { refreshDataLayerFromPage } from './panel.data.js';
import { state } from './panel.state.js';

// Wire DOM events
els.refreshBtn.addEventListener('click', () => refreshDataLayerFromPage({
    onNoData: () => { els.statusEl.textContent = 'No dataLayer found on this page'; displayNoData(); },
    onDataFound: (res) => { updateEventFilter(res.data); els.statusEl.textContent = `DataLayer found with ${res.length} items`; displayDataLayer(res.data); }
}));

els.clearBtn.addEventListener('click', clearDisplay);
els.copyAllBtn.addEventListener('click', copyEntireDataLayer);
els.eventFilter.addEventListener('change', () => {
    if (state.currentDataLayer && state.currentDataLayer.length > 0) displayDataLayer(state.currentDataLayer);
});

// Initial load
refreshDataLayerFromPage({
    onNoData: () => { els.statusEl.textContent = 'No dataLayer found on this page'; displayNoData(); },
    onDataFound: (res) => { updateEventFilter(res.data); els.statusEl.textContent = `DataLayer found with ${res.length} items`; displayDataLayer(res.data); }
});

// Listen for navigation changes
chrome.devtools.network.onNavigated.addListener(function() {
    state.lastDataLayerHash = null;
    state.currentDataLayer = [];
    updateEventFilter([]);
    setTimeout(() => refreshDataLayerFromPage({
        onNoData: () => { els.statusEl.textContent = 'No dataLayer found on this page'; displayNoData(); },
        onDataFound: (res) => { updateEventFilter(res.data); els.statusEl.textContent = `DataLayer found with ${res.length} items`; displayDataLayer(res.data); }
    }), 1000);
});