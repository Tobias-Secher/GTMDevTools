import { escapeHtml, findLastTextNode } from './panel.utils.js';

/**
 * Adds a comma span element to the last node of an element
 * @param {HTMLElement} element - The element to add comma to
 */
function addCommaToElement(element) {
  const lastTextNode = findLastTextNode(element);
  if (lastTextNode) {
    const commaSpan = document.createElement('span');
    commaSpan.className = 'json-comma';
    commaSpan.textContent = ',';
    if (lastTextNode.nodeType === Node.TEXT_NODE) {
      lastTextNode.parentNode.appendChild(commaSpan);
    } else {
      lastTextNode.appendChild(commaSpan);
    }
  }
}

/**
 * Creates a formatted key span for JSON display
 * @param {string|null} key - The key to format
 * @returns {string} Formatted HTML string
 */
function createKeySpan(key) {
  return key ? `<span class="json-key">"${key}"</span>: ` : '';
}

/**
 * Creates a collapsible header for JSON objects/arrays
 * @param {string|null} key - The key name
 * @param {string} openBracket - Opening bracket character
 * @param {string} preview - Preview text for collapsed state
 * @returns {HTMLElement} Header element with toggle
 */
function createCollapsibleHeader(key, openBracket, preview) {
  const header = document.createElement('div');
  const toggle = document.createElement('span');
  toggle.className = 'json-toggle';
  toggle.textContent = '\u25bc';
  
  const keySpan = createKeySpan(key);
  header.innerHTML = `${keySpan}<span class="json-bracket">${openBracket}</span><span class="json-collapsed" style="display: none;">${preview}</span>`;
  header.insertBefore(toggle, header.firstChild);
  
  return { header, toggle };
}

/**
 * Toggles the expanded/collapsed state of a JSON node
 * @param {HTMLElement} container - The container element
 * @param {HTMLElement} toggle - The toggle button element
 */
export function toggleJsonNode(container, toggle) {
  const isExpanded = container.classList.contains('json-expandable');
  const collapsedSpan = container.querySelector('.json-collapsed');
  
  if (isExpanded) {
    container.classList.remove('json-expandable');
    container.classList.add('json-collapsed');
    toggle.textContent = '\u25b6';
    if (collapsedSpan) collapsedSpan.style.display = 'inline';
  } else {
    container.classList.remove('json-collapsed');
    container.classList.add('json-expandable');
    toggle.textContent = '\u25bc';
    if (collapsedSpan) collapsedSpan.style.display = 'none';
  }
}

/**
 * Creates a JSON tree representation of data
 * @param {any} data - The data to display
 * @param {string|null} key - The key name for this data
 * @returns {HTMLElement} The created DOM element
 */
export function createJsonTree(data, key = null) {
  const container = document.createElement('div');
  const keySpan = createKeySpan(key);
  
  // Handle primitive values
  if (data === null) {
    container.innerHTML = `${keySpan}<span class="json-null">null</span>`;
    return container;
  }
  
  if (typeof data === 'string') {
    container.innerHTML = `${keySpan}<span class="json-string">"${escapeHtml(data)}"</span>`;
    return container;
  }
  
  if (typeof data === 'number') {
    container.innerHTML = `${keySpan}<span class="json-number">${data}</span>`;
    return container;
  }
  
  if (typeof data === 'boolean') {
    container.innerHTML = `${keySpan}<span class="json-boolean">${data}</span>`;
    return container;
  }
  // Handle arrays
  if (Array.isArray(data)) {
    return createArrayElement(data, key, container);
  }
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    return createObjectElement(data, key, container);
  }
  // Handle other types
  container.innerHTML = `${keySpan}${String(data)}`;
  return container;
}

/**
 * Creates an array element with collapsible functionality
 * @param {Array} data - The array data
 * @param {string|null} key - The key name
 * @param {HTMLElement} container - The container element
 * @returns {HTMLElement} The array element
 */
function createArrayElement(data, key, container) {
  container.className = 'json-array json-expandable';
  const preview = data.length === 0 ? '[]' : `[...] (${data.length} items)`;
  const { header, toggle } = createCollapsibleHeader(key, '[', preview);
  
  const content = document.createElement('div');
  content.className = 'json-content';
  
  data.forEach((item, index) => {
    const itemEl = createJsonTree(item, null);
    itemEl.className += ' json-item';
    
    if (index < data.length - 1) {
      addCommaToElement(itemEl);
    }
    
    content.appendChild(itemEl);
  });
  
  const closeBracket = document.createElement('div');
  closeBracket.innerHTML = '<span class="json-bracket">]</span>';
  content.appendChild(closeBracket);
  
  toggle.addEventListener('click', () => toggleJsonNode(container, toggle));
  container.appendChild(header);
  container.appendChild(content);
  
  return container;
}

/**
 * Creates an object element with collapsible functionality
 * @param {Object} data - The object data
 * @param {string|null} key - The key name
 * @param {HTMLElement} container - The container element
 * @returns {HTMLElement} The object element
 */
function createObjectElement(data, key, container) {
  container.className = 'json-object json-expandable';
  const keys = Object.keys(data);
  const preview = keys.length === 0 ? '{}' : `{...} (${keys.length} properties)`;
  const { header, toggle } = createCollapsibleHeader(key, '{', preview);
  
  const content = document.createElement('div');
  content.className = 'json-content';
  
  keys.forEach((objKey, index) => {
    const propertyEl = createJsonTree(data[objKey], objKey);
    propertyEl.className += ' json-property';
    
    if (index < keys.length - 1) {
      addCommaToElement(propertyEl);
    }
    
    content.appendChild(propertyEl);
  });
  
  const closeBrace = document.createElement('div');
  closeBrace.innerHTML = '<span class="json-bracket">}</span>';
  content.appendChild(closeBrace);
  
  toggle.addEventListener('click', () => toggleJsonNode(container, toggle));
  container.appendChild(header);
  container.appendChild(content);
  
  return container;
}
