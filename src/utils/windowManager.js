/**
 * Window Manager Utility Functions
 * Handles window object creation and state management
 */

/**
 * Creates a new window object
 * @param {string} id - Unique window identifier
 * @param {string} title - Window title
 * @param {string} type - Window type (e.g., 'terminal', 'files', 'resume')
 * @param {*} content - Window content (can be string, component, etc.)
 * @returns {object} Window object with default properties
 */
export const createWindow = (id, title, type, content) => {
  return {
    id,
    title,
    type,
    content,
    x: 50,
    y: 50,
    width: 600,
    height: 400,
    zIndex: 1,
    minimized: false,
  };
};

/**
 * Updates window position
 * @param {object} window - Window object to update
 * @param {number} x - New x coordinate
 * @param {number} y - New y coordinate
 * @returns {object} Updated window object
 */
export const updateWindowPosition = (window, x, y) => {
  return {
    ...window,
    x,
    y,
  };
};

/**
 * Updates window size
 * @param {object} window - Window object to update
 * @param {number} width - New width
 * @param {number} height - New height
 * @returns {object} Updated window object
 */
export const updateWindowSize = (window, width, height) => {
  return {
    ...window,
    width,
    height,
  };
};

/**
 * Toggles window minimized state
 * @param {object} window - Window object to update
 * @returns {object} Updated window object
 */
export const toggleMinimize = (window) => {
  return {
    ...window,
    minimized: !window.minimized,
  };
};

/**
 * Brings window to front by updating z-index
 * @param {object} window - Window object to update
 * @param {number} maxZ - Current maximum z-index
 * @returns {object} Updated window object
 */
export const bringToFront = (window, maxZ) => {
  return {
    ...window,
    zIndex: maxZ + 1,
  };
};
