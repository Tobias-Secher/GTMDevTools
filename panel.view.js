/**
 * View rendering and DOM manipulation for the GTM Inspector DevTools panel
 * Handles UI updates, event filtering, and dataLayer display
 */

import { createJsonTree } from './panel.jsonTree.js';
import { state, resetState } from './panel.state.js';

/**
 * DOM element references for the panel interface
 * Cached for performance and easy access throughout the module
 */
export const els = {
  statusEl: document.getElementById('status'),
  containerEl: document.getElementById('dataLayerContainer'),
  refreshBtn: document.getElementById('refreshBtn'),
  clearBtn: document.getElementById('clearBtn'),
  eventFilter: document.getElementById('eventFilter')
};

/**
 * Template strings for common UI states
 */
const TEMPLATES = {
  NO_DATA: `
    <div class="empty-state" role="alert">
      <div class="empty-state__icon">📊</div>
      <h3 class="empty-state__title">No dataLayer found</h3>
      <p class="empty-state__message">
        Make sure Google Tag Manager is loaded on this page, then click refresh.
      </p>
    </div>
  `,
  CLEARED: `
    <div class="empty-state" role="alert">
      <div class="empty-state__icon">🗑️</div>
      <h3 class="empty-state__title">Display cleared</h3>
      <p class="empty-state__message">
        DataLayer cleared from display. Click refresh to reload.
      </p>
    </div>
  `
};

/**
 * Status message templates
 */
const STATUS_MESSAGES = {
  CLEARED: 'Display cleared',
  DATA_FOUND: (count) => `DataLayer found with ${count} items`,
  FILTERED: (matched, total, event) => `Highlighting ${matched} of ${total} items for event "${event}"`
};

/**
 * Displays the no data state in the container
 */
export function displayNoData() {
  els.containerEl.innerHTML = TEMPLATES.NO_DATA;
}

/**
 * Clears the display and resets application state
 * Shows a cleared message to the user
 */
export function clearDisplay() {
  els.containerEl.innerHTML = TEMPLATES.CLEARED;
  els.statusEl.textContent = STATUS_MESSAGES.CLEARED;
  
  // Reset application state
  resetState();
  updateEventFilter([]);
}

/**
 * Extracts unique event names from dataLayer items
 * @param {Array} dataLayer - The dataLayer array
 * @returns {Set<string>} Set of unique event names
 */
function extractEventsFromDataLayer(dataLayer) {
  const events = new Set();
  
  if (!Array.isArray(dataLayer)) {
    return events;
  }
  
  dataLayer.forEach(item => {
    if (item && 
        typeof item === 'object' && 
        item.event && 
        typeof item.event === 'string') {
      events.add(item.event);
    }
  });
  
  return events;
}

/**
 * Creates an option element for the event filter
 * @param {string} eventName - The event name
 * @returns {HTMLOptionElement} The option element
 */
function createEventOption(eventName) {
  const option = document.createElement('option');
  option.value = eventName;
  option.textContent = eventName;
  return option;
}

/**
 * Updates the event filter dropdown with available events
 * Preserves the current selection if it's still valid
 * @param {Array} dataLayer - The dataLayer array to extract events from
 */
export function updateEventFilter(dataLayer) {
  const events = extractEventsFromDataLayer(dataLayer);
  const currentSelection = els.eventFilter.value;
  
  // Clear and repopulate the filter
  els.eventFilter.innerHTML = '<option value="">All Events</option>';
  
  const sortedEvents = Array.from(events).sort();
  sortedEvents.forEach(event => {
    els.eventFilter.appendChild(createEventOption(event));
  });
  
  // Restore selection if still valid
  if (currentSelection && events.has(currentSelection)) {
    els.eventFilter.value = currentSelection;
  } else if (currentSelection && currentSelection !== '') {
    els.eventFilter.value = '';
  }
  
  state.currentEvents = events;
}

/**
 * Checks if a dataLayer item matches the current event filter
 * @param {Object} item - The dataLayer item
 * @param {string} selectedEvent - The selected event filter
 * @returns {boolean} True if the item should be displayed
 */
function itemMatchesFilter(item, selectedEvent) {
  if (!selectedEvent) return true;
  
  // Show items that match the event or items without event property
  return item.event === selectedEvent || !item.hasOwnProperty('event');
}

/**
 * Creates an event badge element for display
 * @param {string} eventName - The event name
 * @returns {HTMLElement} The badge element
 */
function createEventBadge(eventName) {
  const badge = document.createElement('span');
  badge.className = 'event-badge';
  badge.style.cssText = 'background: #007acc; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 8px;';
  badge.textContent = eventName;
  return badge;
}

/**
 * Creates the index header for a dataLayer item
 * @param {number} index - The item index
 * @param {string|undefined} eventName - The event name (if present)
 * @returns {HTMLElement} The index element
 */
function createItemIndex(index, eventName) {
  const indexEl = document.createElement('div');
  indexEl.className = 'item-index';
  
  const indexContent = document.createElement('div');
  indexContent.textContent = `[${index}]`;
  
  if (eventName) {
    indexContent.appendChild(createEventBadge(eventName));
  }
  
  indexEl.appendChild(indexContent);
  return indexEl;
}

/**
 * Creates the content area for a dataLayer item
 * @param {Object} item - The dataLayer item
 * @returns {HTMLElement} The content element
 */
function createItemContent(item) {
  const contentEl = document.createElement('div');
  contentEl.className = 'item-content';
  
  const jsonTree = createJsonTree(item);
  contentEl.appendChild(jsonTree);
  
  return contentEl;
}

/**
 * Creates a complete dataLayer item element
 * @param {Object} item - The dataLayer item
 * @param {number} index - The item index
 * @param {boolean} matches - Whether the item matches current filter
 * @returns {HTMLElement} The complete item element
 */
function createDataLayerItem(item, index, matches) {
  const itemEl = document.createElement('div');
  itemEl.className = 'datalayer-item';
  
  if (!matches) {
    itemEl.classList.add('filtered-out');
  }
  
  const indexEl = createItemIndex(index, item.event);
  const contentEl = createItemContent(item);
  
  itemEl.appendChild(indexEl);
  itemEl.appendChild(contentEl);
  
  return itemEl;
}

/**
 * Updates the status bar with current display information
 * @param {string} selectedEvent - The selected event filter
 * @param {number} matchingCount - Number of items matching the filter
 * @param {number} totalCount - Total number of items
 */
function updateStatusBar(selectedEvent, matchingCount, totalCount) {
  if (selectedEvent && matchingCount !== totalCount) {
    els.statusEl.textContent = STATUS_MESSAGES.FILTERED(matchingCount, totalCount, selectedEvent);
  } else {
    els.statusEl.textContent = STATUS_MESSAGES.DATA_FOUND(totalCount);
  }
}

/**
 * Displays the dataLayer items in the container
 * Handles filtering, rendering, and status updates
 * @param {Array} dataLayer - The dataLayer array to display
 */
export function displayDataLayer(dataLayer) {
  els.containerEl.innerHTML = '';
  
  if (!dataLayer || dataLayer.length === 0) {
    displayNoData();
    return;
  }
  
  const selectedEvent = els.eventFilter.value;
  let matchingCount = 0;
  
  // Create and append items
  dataLayer.forEach((item, index) => {
    const matches = itemMatchesFilter(item, selectedEvent);
    if (matches) matchingCount++;
    
    const itemEl = createDataLayerItem(item, index, matches);
    els.containerEl.appendChild(itemEl);
  });
  
  // Update status and scroll to bottom
  updateStatusBar(selectedEvent, matchingCount, dataLayer.length);
  els.containerEl.scrollTop = els.containerEl.scrollHeight;
}
