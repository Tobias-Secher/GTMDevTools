export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function hashCode(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

export function findLastTextNode(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_ALL, null, false);
  let lastContentNode = null;
  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      lastContentNode = node;
    } else if (node.nodeType === Node.ELEMENT_NODE && (
      node.classList.contains('json-string') ||
      node.classList.contains('json-number') ||
      node.classList.contains('json-boolean') ||
      node.classList.contains('json-null') ||
      node.classList.contains('json-bracket') ||
      node.classList.contains('json-collapsed')
    )) {
      lastContentNode = node;
    }
  }
  return lastContentNode;
}
