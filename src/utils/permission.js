import { setSessionStore, getSessionStore, removeSessionStore } from './webStorage'

export function setUserPerms (perms) {
  setSessionStore('User-Perms', perms)
}

export function getUserPerms () {
  return getSessionStore('User-Perms')
}

export function removeUserPerms () {
  removeSessionStore('User-Perms')
}

export function hasPermission (perm) {
  const userPerms = getUserPerms()
  if (perm && userPerms.length > 0) {
    return userPerms.some(accessPerm => perm.indexOf(accessPerm) >= 0)
  } else {
    return false
  }
}
