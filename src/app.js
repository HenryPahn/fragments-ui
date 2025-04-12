// src/app.js

import { signIn, getUser, signOut } from './auth';
import { createFragment, getUserFragments, getFragmentMetaData, deleteFragment, updateFragment } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const fragmentForm = document.querySelector('#createFragment');
  const getFragmentsButton = document.querySelector('#getFragmentsButton');
  const fragmentsList = document.querySelector('#fragmentsList');
  const noOfFragments = document.querySelector('#noOfFragments');
  const fragmentSection = document.querySelector('#fragmentSection');
  let warning = document.querySelector('#warning');
  let fileName = document.querySelector('#fileName')

  const updateSection = document.querySelector('#updateFragment');
  const updateIdSpan = document.querySelector('#updateFragmentId');
  const updateTypeSpan = document.querySelector('#updateFragmentType');
  const updateSelectBox = document.querySelector('#updateSelectBox');
  const updateDropZone = document.querySelector('#update_drop_zone');
  const updateFileName = document.querySelector('#updateFileName');
  const updateWarning = document.querySelector('#updateWarning');

  let currentUpdateId = '';
  let updateData = '';

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signIn();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();

  if (!user) {
    userSection.hidden = true;
    fragmentForm.hidden = true;
    getFragmentsButton.hidden = true;
    fragmentsList.hidden = true;
    noOfFragments.hidden = true;
    fragmentSection.hidden = true;
    logoutBtn.disabled = true;
    return;
  }

  logoutBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    signOut();
  };

  async function showFragments() {
    // Do an authenticated request to the fragments API server and log the result
    const userFragments = await getUserFragments(user); // display all user fragment
    const fragmentIds = userFragments.fragments;

    noOfFragments.innerText = `Number of Fragments: ${fragmentIds.length}`

    // Get the section element where fragments will be displayed and clear any previous content.
    const fragmentsListSection = document.getElementById('fragmentsList');
    fragmentsListSection.innerHTML = '';

    // Loop through each fragment ID, fetch its metadata and display it.
    for (let i = 0; i < fragmentIds.length; ++i) {
      // Fetch metadata; assume the returned structure is like:
      // { data: { status: "ok", fragment: { ... } } }
      const fragmentMetaDataResponse = await getFragmentMetaData(user, fragmentIds[i]);
      const fragment = fragmentMetaDataResponse.fragment;
      // JSON.stringify()
      const fragmentDiv = document.createElement('div');
      fragmentDiv.classList.add('fragment-item');

      // Set the inner HTML to show details.
      function showData() {
        return `
        <p><strong>ID:</strong> ${fragment.id}</p>
        <p><strong>Owner ID:</strong> ${fragment.ownerId}</p>
        <p><strong>Created:</strong> ${new Date(fragment.created).toLocaleString()}</p>
        <p><strong>Updated:</strong> ${new Date(fragment.updated).toLocaleString()}</p>
        <p><strong>Type:</strong> ${fragment.type}</p>
        <p><strong>Size:</strong> ${fragment.size} bytes</p>
        <button class="delete-button" data-id="${fragment.id}">Delete</button>
        <button class="edit-button" data-id="${fragment.id}">Edit</button>
      `;
      }

      fragmentDiv.innerHTML = showData();

      const deleteFunc = async () => {
        await deleteFragment(user, fragment.id);
      }

      const deleteBtn = fragmentDiv.querySelector('.delete-button');
      deleteBtn.addEventListener('click', () => {
        deleteFunc();
      });

      const editBtn = fragmentDiv.querySelector('.edit-button');
      editBtn.addEventListener('click', () => {
        updateSection.hidden = false;
        currentUpdateId = fragment.id;
        updateIdSpan.innerText = currentUpdateId;
      });      

      // Append the fragment details to the list section.
      fragmentsListSection.appendChild(fragmentDiv);
    }
  }

  updateDropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  
  updateDropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length !== 1) {
      console.error("Only one file allowed");
      updateWarning.style.color = 'red';
      return;
    }
    updateWarning.style.color = 'black';
    const file = files[0];
    updateFileName.innerText = file.name;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      updateData = e.target.result;
    };
    reader.readAsText(file); // adjust if needed
  });

  updateSection.addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const newType = updateSelectBox.value;
  
    if (!updateData || !currentUpdateId) {
      console.error('Missing update data or fragment ID');
      updateWarning.style.color = 'red';
      return;
    }
  
    await updateFragment(user, currentUpdateId, newType, updateData);
  
    updateWarning.style.color = 'black';
    updateFileName.innerText = 'No file';
    updateSection.hidden = true;
    updateData = '';
    currentUpdateId = '';
  
    // Refresh fragments list
    await showFragments();
  });  

  // show up all private sections
  userSection.hidden = false;
  fragmentForm.hidden = false;
  getFragmentsButton.hidden = false;
  fragmentsList.hidden = false;
  noOfFragments.hidden = false;
  fragmentSection.hidden = false;

  showFragments()

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  let fragmentData = '';

  async function create(event) {
    event.preventDefault(); // Prevent page reload

    const contentType = document.getElementById("selectBox").value;

    if (!fragmentData) {
      console.error("No file content available. Please drop a file.");
      warning.style.color = 'red';
      return;
    }
    warning.style.color = 'black';

    await createFragment(user, contentType, fragmentData);

    fileName.innerText = 'No dopped file';
    fragmentData = '';
  }

  addEventListener('submit', create);

  // The dropHandler function handles the file drop event.
  function dropHandler(event) {


    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();

    // Access the FileList object
    const files = event.dataTransfer.files;

    if (files.length !== 1) {
      console.error("Error: There are more than 1 file dropped");
      warning.style.color = 'red';
      return;
    }
    warning.style.color = 'black';
    const file = files[0];
    console.log('Dropped file:', file.name);
    fileName.innerText = file.name;

    // Optionally, use FileReader to read the file content:
    const reader = new FileReader();
    reader.onload = function (e) {
      fragmentData = e.target.result;
    };
    // Read file as text; adjust if you need a different format
    reader.readAsText(file);
  }

  const dropZone = document.getElementById('drop_zone');

  // Prevent default behavior to allow drop.
  dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // Show a copy icon when dragging.
  });

  // Attach dropHandler defined in api.js to the drop event.
  dropZone.addEventListener('drop', dropHandler);

  // Attach the showFragments function to the button click event.
  getFragmentsButton.addEventListener('click', showFragments);
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
