const accessKey = 'testomax:shared-access:v1'

export function hasSharedAccess() {
  return localStorage.getItem(accessKey) === 'granted'
}

export function grantSharedAccess() {
  localStorage.setItem(accessKey, 'granted')
}

export function revokeSharedAccess() {
  localStorage.removeItem(accessKey)
}
