// Create the DevTools panel
chrome.devtools.panels.create(
  "DataLayer", // Panel title
  null, // Icon path (optional)
  "panel.html", // Panel HTML file
  function(panel) {
    console.log("DataLayer panel created");
  }
);