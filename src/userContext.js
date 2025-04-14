// src/userContext.js

let currentUser = null;

export function setUser(user) {
  currentUser = user;
}

export function getCurrentUser() {
  return currentUser;
}
