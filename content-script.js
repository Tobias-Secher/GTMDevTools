// Content script to inject our script into the page context
// This is needed because content scripts run in an isolated world
// and can't access the page's window.dataLayer directly

(function() {
    // Inject our script into the page
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected-script.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
})();