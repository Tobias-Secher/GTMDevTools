export function showCopyFeedback(button, message, success) {
  const originalText = button.textContent;
  button.textContent = message;
  if (success) button.classList.add('copied');
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copied');
  }, 1500);
}

export async function copyJsonToClipboard(obj) {
  try {
    const jsonString = JSON.stringify(obj, null, 2);
    await navigator.clipboard.writeText(jsonString);
    return { ok: true };
  } catch (err) {
    console.error('Clipboard write failed', err);
    return { ok: false, error: err };
  }
}
