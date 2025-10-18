// Lightweight sanitizer wrapper used across the client
// Prefers project-provided sanitizeHTML (in dom-utils.js) if available, else falls
// back to a conservative escape-to-text approach.
(function(global){
  function escapeHtml(str){
    if(!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitize(html){
    try{
      // If DOMPurify is available, prefer it (robust, well-tested sanitizer)
      if (typeof window !== 'undefined' && window.DOMPurify && typeof window.DOMPurify.sanitize === 'function') {
        return window.DOMPurify.sanitize(html);
      }
      // dom-utils may expose a sanitizer (try to use it if present and not this wrapper)
      if (typeof window !== 'undefined' && window.__projectSanitizeHTML && typeof window.__projectSanitizeHTML === 'function') {
        return window.__projectSanitizeHTML(html);
      }
      if (typeof sanitizeHTML === 'function' && sanitizeHTML !== sanitize) return sanitizeHTML(html);
    }catch(e){
      // ignore and fall back
    }
    // Fallback: if it looks like HTML (contains tags) try to allow a minimal set of tags
    // but safest is to escape everything and let existing components do their own markup.
    return escapeHtml(html);
  }

  // Expose on window for easy use in legacy scripts
  if(typeof global !== 'undefined') global.sanitizeHTML = sanitize;
  if(typeof global !== 'undefined') global.escapeHtml = escapeHtml;
  // Also export as module for modern imports
  if(typeof module !== 'undefined' && module.exports) module.exports = { sanitizeHTML: sanitize };
})(typeof window !== 'undefined' ? window : this);
