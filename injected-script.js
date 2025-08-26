/**
 * Injected script for GTM Inspector
 * Runs in the page context with access to window.dataLayer
 * 
 * This script can monitor dataLayer changes and provide additional
 * functionality for real-time dataLayer inspection.
 */

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    enablePushMonitoring: true,
    enableEventNotifications: false, // Future feature
    logPrefix: 'GTM DataLayer Inspector:'
  };
  
  /**
   * Checks if dataLayer exists and is valid
   * @returns {boolean} True if dataLayer is available and valid
   */
  function isDataLayerAvailable() {
    return typeof window.dataLayer !== 'undefined' && 
           Array.isArray(window.dataLayer);
  }
  
  /**
   * Enhanced dataLayer push method that maintains original functionality
   * while adding monitoring capabilities
   * @param {...any} args - Arguments passed to dataLayer.push
   * @returns {number} New length of the dataLayer array
   */
  function enhancedPush(...args) {
    // Call original push method first
    const result = this._gtmInspectorOriginalPush.apply(this, args);
    
    // Log push events for debugging (if needed)
    if (console.groupCollapsed) {
      console.groupCollapsed(`${CONFIG.logPrefix} dataLayer.push()`, args.length, 'items');
      args.forEach((item, index) => {
        console.log(`[${index}]:`, item);
      });
      console.groupEnd();
    }
    
    // Future: Could dispatch custom events for real-time updates
    if (CONFIG.enableEventNotifications) {
      try {
        window.dispatchEvent(new CustomEvent('gtmInspectorDataLayerPush', {
          detail: { 
            newItems: args,
            totalLength: result,
            timestamp: Date.now()
          }
        }));
      } catch (error) {
        console.warn(`${CONFIG.logPrefix} Error dispatching event:`, error);
      }
    }
    
    return result;
  }
  
  /**
   * Sets up dataLayer monitoring
   */
  function setupDataLayerMonitoring() {
    if (!isDataLayerAvailable()) {
      console.log(`${CONFIG.logPrefix} dataLayer not found or invalid`);
      return;
    }
    
    // Store reference to original push method
    if (!window.dataLayer._gtmInspectorOriginalPush) {
      window.dataLayer._gtmInspectorOriginalPush = window.dataLayer.push;
      
      // Replace push method with enhanced version
      window.dataLayer.push = enhancedPush;
      
      console.log(`${CONFIG.logPrefix} Successfully enhanced dataLayer.push()`);
      console.log(`${CONFIG.logPrefix} Current dataLayer length: ${window.dataLayer.length}`);
    } else {
      console.log(`${CONFIG.logPrefix} dataLayer monitoring already active`);
    }
  }
  
  /**
   * Initialize the inspector
   */
  function initialize() {
    try {
      if (CONFIG.enablePushMonitoring) {
        setupDataLayerMonitoring();
      }
      
      console.log(`${CONFIG.logPrefix} Injected script initialized successfully`);
    } catch (error) {
      console.error(`${CONFIG.logPrefix} Initialization error:`, error);
    }
  }
  
  // Run initialization
  initialize();
  
})();