// App state container
export const state = {
  lastDataLayerHash: null,
  currentDataLayer: [],
  currentEvents: new Set(),
  refreshInterval: null,
  autoRefresh: false
};

export function setLastHash(hash) {
  state.lastDataLayerHash = hash;
}

export function resetState() {
  state.lastDataLayerHash = null;
  state.currentDataLayer = [];
  state.currentEvents = new Set();
}
