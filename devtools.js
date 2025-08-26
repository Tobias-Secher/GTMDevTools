/**
 * DevTools extension entry point
 * Creates the GTM Inspector panel in Chrome DevTools
 */

// Panel configuration
const PANEL_CONFIG = {
  title: "GTM Inspector",
  iconPath: null, // No custom icon
  htmlFile: "panel.html"
};

/**
 * Callback for panel creation
 * @param {chrome.devtools.panels.ExtensionPanel} panel - The created panel instance
 */
function onPanelCreated(panel) {
  console.log("GTM Inspector panel created successfully");
  
  // Optional: Add panel lifecycle handlers
  // panel.onShown.addListener(() => console.log("Panel shown"));
  // panel.onHidden.addListener(() => console.log("Panel hidden"));
}

// Create the DevTools panel
chrome.devtools.panels.create(
  PANEL_CONFIG.title,
  PANEL_CONFIG.iconPath,
  PANEL_CONFIG.htmlFile,
  onPanelCreated
);