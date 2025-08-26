// Create the DevTools panel
chrome.devtools.panels.create(
  "GTM Inspector", // Panel title
  null, // Icon path (optional)
  "panel.html", // Panel HTML file
  function(panel) {
    console.log("GTM Inspector panel created");
  }
);