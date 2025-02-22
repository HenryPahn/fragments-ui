// src/app.js

import { signIn, getUser } from './auth';
import { getUserFragments, createFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const fragmentForm = document.querySelector('#createFragment');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  
  if (!user) {
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  const userFragments = await getUserFragments(user); // display all user fragment

  // show up all private sections
  userSection.hidden = false;
  fragmentForm.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  async function create(event) {
    event.preventDefault(); // Prevent page reload

    const contentType = document.getElementById("selectBox").value;
    const fragmentData = document.getElementById("textInput").value;

    console.log("Content Type:", contentType);
    console.log("Fragment Data:", fragmentData);

    await createFragment(user, contentType, fragmentData);
  }
  
  addEventListener('submit', create);
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
