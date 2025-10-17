/**
 * DOM Utilities - Safe HTML manipulation and element creation
 * Prevents XSS attacks by sanitizing HTML content
 */

/**
 * Safe HTML sanitization
 * Removes dangerous tags and attributes that could execute scripts
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
    const allowedTags = [
        'div', 'span', 'p', 'a', 'strong', 'em', 'b', 'i', 'u',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'br', 'hr',
        'pre', 'code', 'blockquote',
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ];
    
    const allowedAttrs = ['class', 'id', 'href', 'title', 'alt', 'src'];
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove script tags
    const scripts = temp.querySelectorAll('script, style, iframe, object, embed');
    scripts.forEach(el => el.remove());
    
    // Filter elements
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove disallowed tags
        if (!allowedTags.includes(el.tagName.toLowerCase())) {
            el.replaceWith(...el.childNodes);
            return;
        }
        
        // Remove disallowed attributes
        const attrs = Array.from(el.attributes);
        attrs.forEach(attr => {
            if (!allowedAttrs.includes(attr.name.toLowerCase()) && 
                !attr.name.startsWith('data-')) {
                el.removeAttribute(attr.name);
            }
            
            // Remove javascript: and data: URIs
            if (attr.value && (
                attr.value.toLowerCase().includes('javascript:') ||
                attr.value.toLowerCase().includes('data:text/html')
            )) {
                el.removeAttribute(attr.name);
            }
        });
    });
    
    return temp.innerHTML;
}

/**
 * Safely set HTML content of an element
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content to set
 */
export function setHTML(element, html) {
    if (!element || !(element instanceof HTMLElement)) {
        console.error('Invalid element provided to setHTML');
        return;
    }
    element.innerHTML = sanitizeHTML(html);
}

/**
 * Create an element with properties and children
 * @param {string} tag - HTML tag name
 * @param {Object} props - Element properties
 * @param {string|Array<string|HTMLElement>} children - Child content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, props = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set properties
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'onclick' && typeof value === 'function') {
            element.onclick = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Add children
    if (typeof children === 'string') {
        element.textContent = children;
    } else if (Array.isArray(children)) {
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
    }
    
    return element;
}

/**
 * Create a text node (always safe)
 * @param {string} text - Text content
 * @returns {Text} Text node
 */
export function createText(text) {
    return document.createTextNode(String(text));
}

/**
 * Clear all children from an element
 * @param {HTMLElement} element - Element to clear
 */
export function clearElement(element) {
    if (!element || !(element instanceof HTMLElement)) {
        console.error('Invalid element provided to clearElement');
        return;
    }
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Show/hide element with optional animation
 * @param {HTMLElement} element - Target element
 * @param {boolean} show - Show or hide
 * @param {string} displayType - Display type when showing (default: 'block')
 */
export function toggleElement(element, show, displayType = 'block') {
    if (!element || !(element instanceof HTMLElement)) {
        console.error('Invalid element provided to toggleElement');
        return;
    }
    element.style.display = show ? displayType : 'none';
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Un-escape HTML entities
 * @param {string} html - HTML to unescape
 * @returns {string} Unescaped text
 */
export function unescapeHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

/**
 * Create an element from HTML string (sanitized)
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
export function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = sanitizeHTML(html.trim());
    return template.content.firstChild;
}

/**
 * Create multiple elements from HTML string (sanitized)
 * @param {string} html - HTML string
 * @returns {NodeList} Created elements
 */
export function htmlToElements(html) {
    const template = document.createElement('template');
    template.innerHTML = sanitizeHTML(html.trim());
    return template.content.childNodes;
}

/**
 * Add CSS class(es) to element
 * @param {HTMLElement} element - Target element
 * @param {string|Array<string>} classes - Class name(s)
 */
export function addClass(element, classes) {
    if (!element) return;
    const classList = Array.isArray(classes) ? classes : [classes];
    element.classList.add(...classList);
}

/**
 * Remove CSS class(es) from element
 * @param {HTMLElement} element - Target element
 * @param {string|Array<string>} classes - Class name(s)
 */
export function removeClass(element, classes) {
    if (!element) return;
    const classList = Array.isArray(classes) ? classes : [classes];
    element.classList.remove(...classList);
}

/**
 * Toggle CSS class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name
 * @param {boolean} force - Force add/remove
 */
export function toggleClass(element, className, force) {
    if (!element) return;
    return element.classList.toggle(className, force);
}

// Export as default object for convenience
export default {
    sanitizeHTML,
    setHTML,
    createElement,
    createText,
    clearElement,
    toggleElement,
    escapeHTML,
    unescapeHTML,
    htmlToElement,
    htmlToElements,
    addClass,
    removeClass,
    toggleClass
};
