import { getCurrentUser } from "../userContext";
import { createFragment } from '../api';

const createFragmentBtn = document.querySelector('#createFragment');

createFragmentBtn.onclick = async () => {
    // show the fragment creation section
    const createFragmentSection = document.querySelector('#createFragmentSection');
    createFragmentSection.hidden = false;

    const displayFragmentSection = document.querySelector('#displayFragmentSection');
    displayFragmentSection.hidden = true;

    const createForm = document.querySelector('#createForm');
    const textBox = document.querySelector('#textBox');


    // Handle form submit
    createForm.onsubmit = async (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        const contentType = selectBox.value;
        let data;

        if (contentType.startsWith('image/')) {
            if (!window.droppedFile) {
                alert('Please drop an image file.');
                return;
            }
            data = window.droppedFile;
        } else {
            const text = textBox.value.trim();
            if (!text) {
                alert('Please enter text.');
                return;
            }
            data = text;
        }

        try {
            await createFragment(user, contentType, data);
            createForm.reset();
            window.droppedFile = null;
            dropArea.innerHTML = "Drop your file here";
            document.getElementById('fileName').textContent = 'No dropped file';
        } catch (err) {
            alert('Failed to create fragment.');
            console.error(err);
        }
    };
}

// display the text box or drop box based on the selected type
const selectBox = document.getElementById('selectBox');
const textBoxSection = document.getElementById('textFile');
const dropFileSection = document.getElementById('dropFile');

selectBox.addEventListener('change', () => {
    const selectedType = selectBox.value;

    if (selectedType.startsWith('image/')) {
        textBoxSection.hidden = true;
        dropFileSection.hidden = false;
    } else {
        textBoxSection.hidden = false;
        dropFileSection.hidden = true;
    }
});

const dropArea = document.getElementById('drop_zone');
const fileNameSpan = document.getElementById('fileName');
const imagePreview = document.createElement('div');
dropArea.insertAdjacentElement('afterend', imagePreview);

// Prevent default browser handling
dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
});

// Optional: visual cue for dragging
dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    dropArea.textContent = "Drop Image Here";
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];

    if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.draggable = true;

            dropArea.innerHTML = "";
            dropArea.appendChild(img);

            // Show file name
            fileNameSpan.textContent = file.name;

            // Save for form submission
            window.droppedFile = file;
        };

        reader.readAsDataURL(file);
    } else {
        alert("Please drop an image file only!");
    }
});