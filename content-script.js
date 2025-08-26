/**
 * Content script for GTM Inspector
 * Injects a script into the page context to access window.dataLayer
 * 
 * Content scripts run in an isolated world and cannot directly access
 * the page's window object, so we need to inject a separate script.
 */

/**
 * Injects the monitoring script into the page context
 * This allows access to window.dataLayer and other page globals
 */
function injectPageScript() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected-script.js');
  
  // Clean up the script element after loading
  script.onload = function() {
    this.remove();
  };
  
  // Handle injection errors
  script.onerror = function() {
    console.error('GTM Inspector: Failed to inject page script');
    this.remove();
  };
  
  // Inject into the page as early as possible
  const targetElement = document.head || document.documentElement;
  if (targetElement) {
    targetElement.appendChild(script);
  } else {
    console.warn('GTM Inspector: No suitable element found for script injection');
  }
}

// Execute injection immediately
(function() {
  try {
    injectPageScript();
  } catch (error) {
    console.error('GTM Inspector: Error during script injection:', error);
  }
})();