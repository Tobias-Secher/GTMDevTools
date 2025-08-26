# GTM Inspector

A Chrome DevTools extension for inspecting Google Tag Manager's dataLayer in real-time. Debug GTM implementations, monitor dataLayer pushes, and analyze tag firing with an intuitive interface.

## 🚀 Features

- **Real-time GTM Monitoring**: Inspect dataLayer contents as they're pushed
- **Event Filtering**: Filter items by specific event types for focused debugging
- **Auto-scroll Navigation**: Automatically scroll to first matching item when filtering
- **JSON Tree Visualization**: Expandable/collapsible JSON tree view with syntax highlighting
- **Modern UI**: Clean, accessible interface following DevTools design patterns
- **Keyboard Navigation**: Full keyboard accessibility support

## 📦 Installation

### From Chrome Web Store (Recommended)
*Coming soon - extension is currently in development*

### Manual Installation (Development)
1. Clone this repository:
   ```bash
   git clone https://github.com/Tobias-Secher/GTMDevTools.git
   cd dataLayerDevTools
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the project directory
5. The GTM Inspector will appear in Chrome DevTools panels

## 🎯 Usage

1. **Open DevTools**: Press `F12` or right-click → "Inspect" (CMD+OPT+I for mac)

2. **Find GTM Inspector**: Look for the "GTM Inspector" tab in DevTools

3. **Inspect dataLayer**: 
   - View all dataLayer pushes in real-time
   - Expand/collapse objects and arrays
   - Use event filtering to focus on specific events

4. **Filter Events**:
   - Use the dropdown to filter by specific event types
   - Automatically scrolls to first matching item
   - Clear filter to show all events

5. **Navigate Data**:
   - Click refresh to reload GTM data
   - Use clear to reset the display
   - Scroll through items with smooth animations

## 🛠️ Development

### Prerequisites
- Node.js (for development tools)
- Chrome browser
- Basic knowledge of Chrome Extensions

### Project Structure
```
dataLayerDevTools/
├── manifest.json          # Extension manifest (Manifest V3)
├── devtools.html          # DevTools page entry
├── devtools.js           # DevTools panel creation
├── panel.html            # Main panel HTML
├── panel.css             # Panel styles with CSS custom properties
├── panel.js              # Main application logic
├── panel.view.js         # UI rendering and DOM manipulation
├── panel.data.js         # Data fetching and management
├── panel.state.js        # Application state management
├── panel.jsonTree.js     # JSON tree rendering
├── panel.clipboard.js    # Clipboard functionality (disabled)
├── panel.utils.js        # Utility functions
├── content-script.js     # Content script for page injection
├── injected-script.js    # Page context script for dataLayer access
└── README.md             # This file
```

### Key Technologies
- **Manifest V3**: Modern Chrome extension architecture
- **CSS Custom Properties**: Maintainable styling system
- **Chrome DevTools API**: Native DevTools integration
- **Content Script Injection**: Access to page's dataLayer

## 🎨 Architecture

### Core Components

- **DevTools Integration**: Seamless integration with Chrome DevTools
- **Real-time Monitoring**: Monitors dataLayer.push() calls via injected script
- **State Management**: Centralized application state with proper validation
- **Modular Design**: Separated concerns for maintainability

### Data Flow
1. **Injected Script** monitors `window.dataLayer` in page context
2. **Content Script** bridges communication between page and extension
3. **DevTools Panel** fetches and displays dataLayer data
4. **State Management** handles data updates and change detection
5. **UI Components** render JSON trees with filtering and navigation

## 🔧 Configuration

The extension works out-of-the-box with no configuration required. However, you can customize:

### CSS Custom Properties
Modify `panel.css` to customize colors, spacing, and typography:

```css
:root {
  --color-primary: #007acc;
  --color-primary-light: #e3f2ff;
  --spacing-lg: 16px;
  /* ... more variables */
}
```

### Feature Flags
Enable/disable features in `injected-script.js`:

```javascript
const CONFIG = {
  enablePushMonitoring: true,
  enableEventNotifications: false,
  logPrefix: 'GTM DataLayer Inspector:'
};
```

## 📋 Browser Support

- **Chrome**: ✅ Full support (Manifest V3)
- **Edge**: ✅ Compatible with Chromium-based Edge
- **Firefox**: ❌ Not compatible (uses Chrome-specific APIs)
- **Safari**: ❌ Not compatible

## 🐛 Troubleshooting

### Common Issues

**GTM Inspector tab not appearing**
- Ensure extension is enabled in `chrome://extensions/`
- Refresh the page and reopen DevTools
- Check browser console for errors

**No GTM data showing**
- Verify Google Tag Manager is loaded on the page
- Check that dataLayer exists: `console.log(window.dataLayer)`
- Click the refresh button in GTM Inspector

**Items not filtering correctly**
- Ensure events have the `event` property set
- Try clearing the filter and reselecting
- Check browser console for JavaScript errors

### Performance Tips
- Use event filtering for large dataLayers
- Clear display periodically for better performance
- Close GTM Inspector when not needed to reduce overhead

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** and test thoroughly
4. **Follow code style**: Use existing patterns and conventions
5. **Add/update tests** if applicable
6. **Commit changes**: `git commit -m 'feat: add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Style
- Use ES6+ features and modules
- Follow existing naming conventions
- Add JSDoc comments for functions
- Use CSS custom properties for styling
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License

---

**Built with ❤️ for the GTM community**

*GTM Inspector v1.2.2 - Making dataLayer debugging delightful*