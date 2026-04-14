export function getStorageItem(key) {
  return window.localStorage.getItem(key)
}

export function setStorageItem(key, value) {
  window.localStorage.setItem(key, value)
}

export function removeStorageItem(key) {
  window.localStorage.removeItem(key)
}
