/**
 * Host half of the fixed-conversation-width bundle.
 *
 * The preference is a browser-surface concern (the shipped draggable width is
 * stored in localStorage too), so the Client module owns the rendering and the
 * persistence; this row only exists so the bundle has a live plugin entry.
 */
export function apply() {}
