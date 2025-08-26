import { escapeHtml } from './panel.utils.js';
import { findLastTextNode } from './panel.utils.js';

export function toggleJsonNode(container, toggle) {
  const isExpanded = container.classList.contains('json-expandable');
  const collapsedSpan = container.querySelector('.json-collapsed');
  if (isExpanded) {
    container.classList.remove('json-expandable');
    container.classList.add('json-collapsed');
    toggle.textContent = '\u25b6';
    if (collapsedSpan) collapsedSpan.style.display = 'inline';
  } else {
    container.classList.remove('json-collapsed');
    container.classList.add('json-expandable');
    toggle.textContent = '\u25bc';
    if (collapsedSpan) collapsedSpan.style.display = 'none';
  }
}

export function createJsonTree(data, key = null, isLast = true) {
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
    toggle.textContent = '\u25bc';
    const keySpan = key ? `<span class="json-key">"${key}"</span>: ` : '';
    const preview = data.length === 0 ? '[]' : `[...] (${data.length} items)`;
    header.innerHTML = `${keySpan}<span class="json-bracket">[</span><span class="json-collapsed" style="display: none;">${preview}</span>`;
    header.insertBefore(toggle, header.firstChild);
    const content = document.createElement('div');
    content.className = 'json-content';
    data.forEach((item, index) => {
      const itemEl = createJsonTree(item, null, index === data.length - 1);
      itemEl.className += ' json-item';
      if (index < data.length - 1) {
        const lastTextNode = findLastTextNode(itemEl);
        if (lastTextNode) {
          const commaSpan = document.createElement('span');
          commaSpan.className = 'json-comma';
          commaSpan.textContent = ',';
          if (lastTextNode.nodeType === Node.TEXT_NODE) {
            lastTextNode.parentNode.appendChild(commaSpan);
          } else {
            lastTextNode.appendChild(commaSpan);
          }
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
    toggle.textContent = '\u25bc';
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
      if (index < keys.length - 1) {
        const lastTextNode = findLastTextNode(propertyEl);
        if (lastTextNode) {
          const commaSpan = document.createElement('span');
          commaSpan.className = 'json-comma';
          commaSpan.textContent = ',';
          if (lastTextNode.nodeType === Node.TEXT_NODE) {
            lastTextNode.parentNode.appendChild(commaSpan);
          } else {
            lastTextNode.appendChild(commaSpan);
          }
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
  container.innerHTML = `${key ? `<span class="json-key">"${key}"</span>: ` : ''}${String(data)}`;
  return container;
}
