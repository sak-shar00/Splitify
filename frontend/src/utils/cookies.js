// Cookie-like utilities (now backed by sessionStorage for per-tab auth isolation)
// Keeps the same function names used across the app.

export const setCookie = (name, value) => {
  window.sessionStorage.setItem(name, value);
};

export const getCookie = (name) => {
  return window.sessionStorage.getItem(name) || "";
};

export const deleteCookie = (name) => {
  window.sessionStorage.removeItem(name);
};
