import { createJsonTree } from './panel.jsonTree.js';
import { copyJsonToClipboard, showCopyFeedback } from './panel.clipboard.js';
import { state } from './panel.state.js';

export const els = {
  statusEl: document.getElementById('status'),
  containerEl: document.getElementById('dataLayerContainer'),
  refreshBtn: document.getElementById('refreshBtn'),
  clearBtn: document.getElementById('clearBtn'),
  // copyAllBtn: document.getElementById('copyAllBtn'), // Copy functionality disabled
  eventFilter: document.getElementById('eventFilter')
};

export function displayNoData() {
  els.containerEl.innerHTML = `\n        <div class="no-data">\n            No dataLayer found. Make sure GTM is loaded on this page.\n        </div>\n    `;
}

export function clearDisplay() {
  els.containerEl.innerHTML = `\n        <div class="no-data">\n            DataLayer cleared from display. Click refresh to reload.\n        </div>\n    `;
  els.statusEl.textContent = 'Display cleared';
  // Reset state
  state.lastDataLayerHash = null;
  state.currentDataLayer = [];
  updateEventFilter([]);
}

export function updateEventFilter(dataLayer) {
  const events = new Set();
  if (dataLayer && Array.isArray(dataLayer)) {
    dataLayer.forEach(item => {
      if (item && typeof item === 'object' && item.event && typeof item.event === 'string') {
        events.add(item.event);
      }
    });
  }
  const currentSelection = els.eventFilter.value;
  els.eventFilter.innerHTML = '<option value="">All Events</option>';
  const sortedEvents = Array.from(events).sort();
  sortedEvents.forEach(event => {
    const option = document.createElement('option');
    option.value = event;
    option.textContent = event;
    els.eventFilter.appendChild(option);
  });
  if (currentSelection && events.has(currentSelection)) {
    els.eventFilter.value = currentSelection;
  } else if (currentSelection && currentSelection !== '') {
    els.eventFilter.value = '';
  }
  state.currentEvents = events;
}

export function displayDataLayer(dataLayer) {
  els.containerEl.innerHTML = '';
  if (!dataLayer || dataLayer.length === 0) {
    displayNoData();
    return;
  }
  const selectedEvent = els.eventFilter.value;
  let matchingCount = 0;
  dataLayer.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'datalayer-item';
    const itemMatches = !selectedEvent || item.event === selectedEvent || !item.hasOwnProperty('event');
    if (itemMatches) {
      matchingCount++;
    } else {
      itemEl.classList.add('filtered-out');
    }
    const indexEl = document.createElement('div');
    indexEl.className = 'item-index';
    const indexContent = document.createElement('div');
    indexContent.textContent = `[${index}]`;
    if (item.event) {
      const eventBadge = document.createElement('span');
      eventBadge.style.cssText = 'background: #007acc; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 8px;';
      eventBadge.textContent = item.event;
      indexContent.appendChild(eventBadge);
    }
    // Copy functionality disabled
    // const copyBtn = document.createElement('button');
    // copyBtn.className = 'copy-btn';
    // copyBtn.textContent = 'Copy';
    // copyBtn.title = 'Copy this item to clipboard';
    // copyBtn.onclick = async () => {
    //   const res = await copyJsonToClipboard(item);
    //   showCopyFeedback(copyBtn, res.ok ? 'Copied!' : 'Failed', res.ok);
    // };
    indexEl.appendChild(indexContent);
    // indexEl.appendChild(copyBtn);
    const contentEl = document.createElement('div');
    contentEl.className = 'item-content';
    const jsonTree = createJsonTree(item);
    contentEl.appendChild(jsonTree);
    itemEl.appendChild(indexEl);
    itemEl.appendChild(contentEl);
    els.containerEl.appendChild(itemEl);
  });
  const totalCount = dataLayer.length;
  if (selectedEvent && matchingCount !== totalCount) {
    els.statusEl.textContent = `Highlighting ${matchingCount} of ${totalCount} items for event "${selectedEvent}"`;
  } else {
    els.statusEl.textContent = `DataLayer found with ${totalCount} items`;
  }
  els.containerEl.scrollTop = els.containerEl.scrollHeight;
}

// Copy functionality disabled
// export async function copyEntireDataLayer() {
//   if (!state.currentDataLayer || state.currentDataLayer.length === 0) {
//     showCopyFeedback(els.copyAllBtn, 'No Data', false);
//     return;
//   }
//   const res = await copyJsonToClipboard(state.currentDataLayer);
//   showCopyFeedback(els.copyAllBtn, res.ok ? 'Copied!' : 'Failed', res.ok);
// }
