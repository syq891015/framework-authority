import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken () {
  return getCookie(TokenKey)
}

export function setToken (token, attributes) {
  return setCookie(TokenKey, token, attributes)
}

export function removeToken () {
  return removeCookie(TokenKey)
}

export function setCookie (key, value, attributes) {
  return Cookies.set(key, value, attributes)
}

export function getCookie (key) {
  return Cookies.get(key)
}

export function removeCookie (key) {
  return Cookies.remove(key)
}
