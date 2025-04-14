// src/app/index.js

import { signIn, getUser, signOut } from '../auth';
import { setUser } from '../userContext';

async function init() {
  // Get our UI elements
  // sections
  const userSection = document.querySelector('#user');
  const buttonSection = document.querySelector('#buttonSection');

  // buttons
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();

  if (!user) {
    logoutBtn.disabled = true;
    return;
  }

  setUser(user); // Store user globally

  // show up all private sections
  userSection.hidden = false;
  buttonSection.hidden = false;

  // set up event for log out button
  loginBtn.disabled = true;
  logoutBtn.onclick = () => {
    signOut();
  };

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
