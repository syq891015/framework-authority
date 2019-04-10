export function isObject (val) {
  return val !== null && typeof val === 'object'
}

export function setStore (key, val, type = 'localStorage') {
  if (isObject(val)) {
    window[type].setItem(key, JSON.stringify(val))
  } else {
    window[type].setItem(key, val)
  }
}

export function getStore (key, type = 'localStorage') {
  const val = window[type].getItem(key)
  try {
    return JSON.parse(val)
  } catch (e) {
    return val
  }
}

export function removeStore (key, type = 'localStorage') {
  window[type].removeItem(key)
}

export function setSessionStore (key, val) {
  setStore(key, val, 'sessionStorage')
}

export function getSessionStore (key) {
  return getStore(key, 'sessionStorage')
}

export function removeSessionStore (key) {
  return removeStore(key, 'sessionStorage')
}
