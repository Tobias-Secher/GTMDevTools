let autoRefresh = true;
let refreshInterval;

const statusEl = document.getElementById('status');
const containerEl = document.getElementById('dataLayerContainer');
const refreshBtn = document.getElementById('refreshBtn');
const clearBtn = document.getElementById('clearBtn');
const autoRefreshBtn = document.getElementById('autoRefreshBtn');

// Button event listeners
refreshBtn.addEventListener('click', refreshDataLayer);
clearBtn.addEventListener('click', clearDisplay);
autoRefreshBtn.addEventListener('click', toggleAutoRefresh);

// Initialize
refreshDataLayer();
// Enable auto-refresh by default
// startAutoRefresh();

function refreshDataLayer() {
    // Execute script in the inspected page to get dataLayer
    chrome.devtools.inspectedWindow.eval(
        `
        (function() {
            if (typeof window.dataLayer !== 'undefined') {
                return {
                    exists: true,
                    data: window.dataLayer,
                    length: window.dataLayer.length
                };
            } else {
                return { exists: false };
            }
        })()
        `,
        function(result, isException) {
            if (isException) {
                statusEl.textContent = 'Error accessing dataLayer';
                displayNoData();
                return;
            }
            
            if (result && result.exists) {
                statusEl.textContent = `DataLayer found with ${result.length} items`;
                displayDataLayer(result.data);
            } else {
                statusEl.textContent = 'No dataLayer found on this page';
                displayNoData();
            }
        }
    );
}

function displayDataLayer(dataLayer) {
    containerEl.innerHTML = '';
    
    if (!dataLayer || dataLayer.length === 0) {
        displayNoData();
        return;
    }
    
    dataLayer.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'datalayer-item';
        
        const indexEl = document.createElement('div');
        indexEl.className = 'item-index';
        indexEl.textContent = `[${index}] ${item.event ? `(event: ${item.event})` : ''}`;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'item-content';
        
        // Create collapsible JSON tree
        const jsonTree = createJsonTree(item);
        contentEl.appendChild(jsonTree);
        
        itemEl.appendChild(indexEl);
        itemEl.appendChild(contentEl);
        containerEl.appendChild(itemEl);
    });
    
    // Scroll to bottom to show latest items
    containerEl.scrollTop = containerEl.scrollHeight;
}

function createJsonTree(data, key = null, isLast = true) {
    const container = document.createElement('div');
    
    if (data === null) {
        container.innerHTML = `${key ? `<span class="json-key">"${key}"</span>: ` : ''}<span class="json-null">null</span>`;
        return container;
    }
    
    if (typeof data === 'string') {
        container.innerHTML = `${key ? `<span class="json-key">"${key}"</span>: ` : ''}<span class="json-string">"${escapeHtml(data)}"</span>`;
        return container;
    }
    
    if (typeof data === 'number') {
        container.innerHTML = `${key ? `<span class="json-key">"${key}"</span>: ` : ''}<span class="json-number">${data}</span>`;
        return container;
    }
    
    if (typeof data === 'boolean') {
        container.innerHTML = `${key ? `<span class="json-key">"${key}"</span>: ` : ''}<span class="json-boolean">${data}</span>`;
        return container;
    }
    
    if (Array.isArray(data)) {
        container.className = 'json-array json-expandable';
        
        const header = document.createElement('div');
        const toggle = document.createElement('span');
        toggle.className = 'json-toggle';
        toggle.textContent = '▼';
        
        const keySpan = key ? `<span class="json-key">"${key}"</span>: ` : '';
        const preview = data.length === 0 ? '[]' : `[...] (${data.length} items)`;
        
        header.innerHTML = `${keySpan}<span class="json-bracket">[</span><span class="json-collapsed" style="display: none;">${preview}</span>`;
        header.insertBefore(toggle, header.firstChild);
        
        const content = document.createElement('div');
        content.className = 'json-content';
        
        data.forEach((item, index) => {
            const itemEl = createJsonTree(item, null, index === data.length - 1);
            itemEl.className += ' json-item';
            
            // Add comma directly to the item if not the last one
            if (index < data.length - 1) {
                const lastTextNode = findLastTextNode(itemEl);
                if (lastTextNode) {
                    lastTextNode.textContent += ',';
                }
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
    
    if (typeof data === 'object' && data !== null) {
        container.className = 'json-object json-expandable';
        
        const header = document.createElement('div');
        const toggle = document.createElement('span');
        toggle.className = 'json-toggle';
        toggle.textContent = '▼';
        
        const keys = Object.keys(data);
        const keySpan = key ? `<span class="json-key">"${key}"</span>: ` : '';
        const preview = keys.length === 0 ? '{}' : `{...} (${keys.length} properties)`;
        
        header.innerHTML = `${keySpan}<span class="json-bracket">{</span><span class="json-collapsed" style="display: none;">${preview}</span>`;
        header.insertBefore(toggle, header.firstChild);
        
        const content = document.createElement('div');
        content.className = 'json-content';
        
        keys.forEach((objKey, index) => {
            const propertyEl = createJsonTree(data[objKey], objKey, index === keys.length - 1);
            propertyEl.className += ' json-property';
            
            // Add comma directly to the property if not the last one
            if (index < keys.length - 1) {
                const lastTextNode = findLastTextNode(propertyEl);
                if (lastTextNode) {
                    lastTextNode.textContent += ',';
                }
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
    
    // Fallback for unknown types
    container.innerHTML = `${key ? `<span class="json-key">"${key}"</span>: ` : ''}${String(data)}`;
    return container;
}

function toggleJsonNode(container, toggle) {
    const isExpanded = container.classList.contains('json-expandable');
    const collapsedSpan = container.querySelector('.json-collapsed');
    const content = container.querySelector('.json-content');
    
    if (isExpanded) {
        // Collapse
        container.classList.remove('json-expandable');
        container.classList.add('json-collapsed');
        toggle.textContent = '▶';
        if (collapsedSpan) collapsedSpan.style.display = 'inline';
    } else {
        // Expand
        container.classList.remove('json-collapsed');
        container.classList.add('json-expandable');
        toggle.textContent = '▼';
        if (collapsedSpan) collapsedSpan.style.display = 'none';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function findLastTextNode(element) {
    // Find the last text node or span that contains actual content
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_ALL,
        null,
        false
    );
    
    let lastContentNode = null;
    let node;
    
    while (node = walker.nextNode()) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            lastContentNode = node;
        } else if (node.nodeType === Node.ELEMENT_NODE && 
                   (node.classList.contains('json-string') || 
                    node.classList.contains('json-number') || 
                    node.classList.contains('json-boolean') || 
                    node.classList.contains('json-null') ||
                    node.classList.contains('json-bracket'))) {
            // For collapsed objects/arrays, we want to add comma after the preview
            if (element.classList.contains('json-collapsed') && 
                node.classList.contains('json-collapsed')) {
                lastContentNode = node;
            } else if (!element.classList.contains('json-collapsed')) {
                lastContentNode = node;
            }
        }
    }
    
    return lastContentNode;
}

function displayNoData() {
    containerEl.innerHTML = `
        <div class="no-data">
            No dataLayer found. Make sure GTM is loaded on this page.
        </div>
    `;
}

function clearDisplay() {
    containerEl.innerHTML = `
        <div class="no-data">
            DataLayer cleared from display. Click refresh to reload.
        </div>
    `;
    statusEl.textContent = 'Display cleared';
}

function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    
    if (autoRefresh) {
        autoRefreshBtn.classList.add('active');
        autoRefreshBtn.textContent = 'Auto-refresh';
        startAutoRefresh();
    } else {
        autoRefreshBtn.classList.remove('active');
        autoRefreshBtn.textContent = 'Manual';
        stopAutoRefresh();
    }
}

function startAutoRefresh() {
    if (autoRefresh && !refreshInterval) {
        refreshInterval = setInterval(refreshDataLayer, 2000); // Refresh every 2 seconds
    }
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

// Listen for navigation changes
chrome.devtools.network.onNavigated.addListener(function() {
    setTimeout(refreshDataLayer, 1000); // Wait a bit for page to load
});