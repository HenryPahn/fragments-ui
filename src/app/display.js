import { getCurrentUser } from "../userContext";
import { getUserFragments, getAllFragmentData, deleteFragment, updateFragment, convertFragment } from '../api';

const displayFragmentBtn = document.querySelector('#displayFragment');

// show display fragment section 
displayFragmentBtn.onclick = async () => {
    // show the fragment section
    const displayFragmentSection = document.querySelector('#displayFragmentSection');
    displayFragmentSection.hidden = false;

    const createFragmentSection = document.querySelector('#createFragmentSection');
    createFragmentSection.hidden = true;

    // get all the fragments
    const user = getCurrentUser();
    const fragmentIds = await getUserFragments(user);
    const fragments = await getAllFragmentData(user, fragmentIds);

    // Sort by updated time (new to old)
    fragments.sort((a, b) => new Date(b.updated) - new Date(a.updated));

    const fragmentDataSection = document.querySelector('#fragmentData');

    fragmentDataSection.innerHTML = '';

    // add fragment HTML element
    fragments.forEach((fragment, i) => {
        let contentHTML = '';

        if (fragment.type.startsWith('image/')) {
            console.log(fragment.data)
            const blob = new Blob([fragment.data], { type: fragment.type });
            const url = URL.createObjectURL(blob);

            contentHTML = `<img src="${url}" style="max-width: 100%; border-radius: 4px;" />`;
        } else {
            const dataFormatted = typeof fragment.data === 'object'
                ? JSON.stringify(fragment.data, null, 2)
                : fragment.data;

            contentHTML = `<pre style="background:#f0f0f0; padding:8px; border-radius:4px; white-space:pre-wrap;">${dataFormatted}</pre>`;
        }

        const cardHTML = `
            <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px; border-radius:6px; background:#fafafa;">
                <h3>Fragment ${i + 1}</h3>
                <p><strong>ID:</strong> ${fragment.id}</p>
                <p><strong>Created:</strong> ${new Date(fragment.created).toLocaleString()}</p>
                <p><strong>Updated:</strong> ${new Date(fragment.updated).toLocaleString()}</p>
                <p><strong>Type:</strong> ${fragment.type}</p>
                <p><strong>Size:</strong> ${fragment.size} bytes</p>
                ${contentHTML}
                <button class="delete-btn" data-id="${fragment.id}">Delete</button>
                <button class="edit-btn" data-index="${i}">Edit</button>
                <button class="convert-btn" data-index="${i}">Convert</button>
            </div>
        `;

        fragmentDataSection.innerHTML += cardHTML;
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        const user = getCurrentUser();

        btn.onclick = async () => {
            const fragmentId = btn.getAttribute('data-id');
            const confirmed = confirm('Are you sure you want to delete this fragment?');
            if (!confirmed) return;

            await deleteFragment(user, fragmentId);

            // reload and display fragments
            location.reload();
        };
    });

    // Add edit button functionality after rendering
    const dialog = document.getElementById('editDialog');
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => {
            const index = btn.getAttribute('data-index');
            const fragment = fragments[index];

            const { id, type, data } = fragment;

            dialog.querySelector('#edit-id').textContent = id;
            dialog.querySelector('#edit-type').textContent = type;

            const textBox = document.getElementById('editTextBox');
            textBox.value = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;

            // Show textarea and submit if type is not image
            const textSection = document.getElementById('editTextSection');
            if (type.startsWith('image/')) {
                textSection.style.display = 'none';
                imageSection.style.display = 'block';
                fileNameLabel.textContent = 'No file selected';
                newImageFile = null;
            } else {
                textSection.style.display = 'block';
                imageSection.style.display = 'none';
            }

            dialog.showModal();

            document.getElementById('editSubmitBtn').onclick = async () => {
                let updatedData;

                if (type.startsWith('image/')) {
                    if (!newImageFile) {
                        alert('Please drop an image to update.');
                        return;
                    }
                    updatedData = newImageFile;
                } else {
                    const userInput = textBox.value.trim();
                    if (!userInput) {
                        alert('Text cannot be empty.');
                        return;
                    }
                    updatedData = userInput;
                }

                try {
                    await updateFragment(user, id, type, updatedData);
                    dialog.close();
                    location.reload();
                } catch (err) {
                    alert('Failed to update fragment.');
                    console.error(err);
                }
            };
        };
    });

    // Close dialog button
    document.getElementById('closeDialogBtn').onclick = () => {
        document.getElementById('editDialog').close();
    };

    document.querySelectorAll('.convert-btn').forEach(btn => {
        btn.onclick = () => {
            const index = btn.getAttribute('data-index');
            const fragment = fragments[index];

            const { id, type, data } = fragment;

            const dialog = document.getElementById('convertDialog');
            document.getElementById('convert-id').textContent = id;
            document.getElementById('convert-type').textContent = type;

            // Populate the select dropdown based on type
            const convertTo = document.getElementById('convertTo');
            convertTo.innerHTML = ''; // Clear previous options

            const typeMap = {
                'text/plain': ['txt'],
                'text/markdown': ['md', 'html', 'txt'],
                'text/html': ['html', 'txt'],
                'text/csv': ['csv', 'txt', 'json'],
                'application/json': ['json', 'yaml', 'yml', 'txt'],
                'application/yaml': ['yaml', 'txt'],
                'image/png': ['png', 'jpg', 'webp', 'gif', 'avif'],
                'image/jpeg': ['png', 'jpg', 'webp', 'gif', 'avif'],
                'image/webp': ['png', 'jpg', 'webp', 'gif', 'avif'],
                'image/avif': ['png', 'jpg', 'webp', 'gif', 'avif'],
                'image/gif': ['png', 'jpg', 'webp', 'gif', 'avif']
            };

            const options = typeMap[type] || [];
            options.forEach(ext => {
                const opt = document.createElement('option');
                opt.value = ext;
                opt.textContent = ext;
                convertTo.appendChild(opt);
            });

            dialog.querySelector('#convert-id').textContent = id;
            dialog.querySelector('#convert-type').textContent = type;

            const outputBox = document.getElementById('convertedOutput');
            if (type.startsWith('image/')) {
                const blob = new Blob([data], { type });
                const url = URL.createObjectURL(blob);
                outputBox.innerHTML = `<img src="${url}" style="max-width:100%; border-radius: 6px;" />`;
            } else {
                const dataFormatted = typeof data === 'object'
                    ? JSON.stringify(data, null, 2)
                    : data;
                outputBox.textContent = dataFormatted;
            }

            dialog.showModal();

            // Handle actual conversion
            document.getElementById('convertActionBtn').onclick = async () => {
                const selectedExt = convertTo.value;

                try {

                    let convertedData = await convertFragment(user, id, selectedExt);

                    if (type.startsWith('image/')) {
                        const blob = new Blob([convertedData], { type });
                        const url = URL.createObjectURL(blob);
                        outputBox.innerHTML = `<img src="${url}" style="max-width:100%; border-radius: 6px;" />`;
                    } else {
                        if (selectedExt == "json") {
                            convertedData = JSON.stringify(convertedData);
                        }

                        outputBox.textContent = convertedData;
                    }
                } catch (err) {
                    alert('Failed to update fragment.');
                    console.error(err);
                }
            };
        };
    });

    // Close dialog
    document.getElementById('closeConvertDialogBtn').onclick = () => {
        document.getElementById('convertDialog').close();
    };
}

const imageSection = document.getElementById('editImageSection');
const dropZone = document.getElementById('editDropZone');
const fileNameLabel = document.getElementById('editFileName');

let newImageFile = null; // track uploaded image

// Handle drop zone for image editing
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f0f0f0';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = 'transparent';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = 'transparent';
    const file = e.dataTransfer.files[0];

    if (!file || !file.type.startsWith('image/')) {
        alert('Please drop a valid image file.');
        return;
    }

    newImageFile = file;
    fileNameLabel.textContent = file.name;
});