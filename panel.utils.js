/**
 * Utility functions for the GTM Inspector DevTools panel
 * Contains helper functions for HTML escaping, hashing, and DOM manipulation
 */

/**
 * Escapes HTML special characters in text to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} HTML-escaped text
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') {
    return String(text);
  }
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generates a hash code for a string using a simple hash algorithm
 * @param {string} str - The string to hash
 * @returns {string} Hash code as string
 */
export function hashCode(str) {
  if (!str || typeof str !== 'string' || str.length === 0) {
    return '0';
  }
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    // Convert to 32bit integer
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString();
}

/**
 * JSON element class names that should be considered as content nodes
 * @constant {Set<string>}
 */
const JSON_CONTENT_CLASSES = new Set([
  'json-string',
  'json-number', 
  'json-boolean',
  'json-null',
  'json-bracket',
  'json-collapsed'
]);

/**
 * Checks if a node is a valid content node for JSON display
 * @param {Node} node - The DOM node to check
 * @returns {boolean} True if the node contains JSON content
 */
function isJsonContentNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return Boolean(node.textContent && node.textContent.trim());
  }
  
  if (node.nodeType === Node.ELEMENT_NODE && node.classList) {
    return Array.from(JSON_CONTENT_CLASSES).some(className => 
      node.classList.contains(className)
    );
  }
  
  return false;
}

/**
 * Finds the last meaningful text or element node within a DOM element
 * Used for adding commas to JSON tree elements
 * @param {Element} element - The DOM element to search within
 * @returns {Node|null} The last content node, or null if none found
 */
export function findLastTextNode(element) {
  if (!element || !element.nodeType) {
    console.warn('findLastTextNode: Invalid element provided');
    return null;
  }
  
  const walker = document.createTreeWalker(
    element, 
    NodeFilter.SHOW_ALL, 
    null, 
    false
  );
  
  let lastContentNode = null;
  let node;
  
  while ((node = walker.nextNode())) {
    if (isJsonContentNode(node)) {
      lastContentNode = node;
    }
  }
  
  return lastContentNode;
}

/**
 * Debounces a function call, useful for performance optimization
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
