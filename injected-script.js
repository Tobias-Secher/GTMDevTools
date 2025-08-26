// This script runs in the page context and has access to window.dataLayer
// It can be used for additional functionality like monitoring dataLayer changes

(function() {
    // Optional: Add additional functionality here
    // For example, you could monitor dataLayer pushes and send notifications
    
    // Store original push method
    if (typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer)) {
        const originalPush = window.dataLayer.push;
        
        // Override push to detect new items
        window.dataLayer.push = function() {
            const result = originalPush.apply(this, arguments);
            
            // You could dispatch custom events here to notify the extension
            // window.dispatchEvent(new CustomEvent('dataLayerPush', { 
            //     detail: { newItems: arguments } 
            // }));
            
            return result;
        };
        
        console.log('GTM DataLayer Inspector: Monitoring dataLayer pushes');
    }
})();