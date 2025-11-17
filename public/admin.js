// Admin panel JavaScript

const API_URL = '/api';
let isAuthenticated = false;
let currentEditingSection = null;

// Check if already authenticated and test server connectivity on page load
window.addEventListener('DOMContentLoaded', async () => {
    const statusText = document.getElementById('statusText');
    
    // Test server connectivity
    try {
        const testResponse = await fetch(`${API_URL}/content`, {
            method: 'GET',
            cache: 'no-cache'
        });
        
        if (testResponse.ok) {
            statusText.innerHTML = '<span style="color: rgba(100, 255, 100, 0.8);">✓ Server connected</span>';
            statusText.parentElement.style.background = 'rgba(100, 255, 100, 0.1)';
        } else {
            statusText.innerHTML = '<span style="color: rgba(255, 200, 100, 0.8);">⚠ Server responded with error</span>';
            statusText.parentElement.style.background = 'rgba(255, 200, 100, 0.1)';
        }
    } catch (error) {
        console.warn('Server connectivity test failed - server may not be running', error);
        statusText.innerHTML = '<span style="color: rgba(255, 100, 100, 0.8);">✗ Server not connected</span>';
        statusText.parentElement.style.background = 'rgba(255, 100, 100, 0.1)';
        
        // Show instructions
        const instructions = document.getElementById('serverInstructions');
        if (instructions) {
            instructions.style.display = 'block';
        }
        
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.innerHTML = '<strong>⚠️ Server is not running</strong><br><br>See instructions above to start the server. You need Node.js installed first - check the START_HERE.md file in your project folder.';
            errorDiv.classList.remove('hidden');
        }
        return; // Don't try to authenticate if server isn't running
    }
    
    // Check if already authenticated
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
        isAuthenticated = true;
        showAdminContent();
        loadContent();
    }
});

async function authenticate() {
    const password = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('authError');
    
    if (!password) {
        errorDiv.textContent = 'Please enter a password';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    console.log('Attempting authentication with password:', password);
    console.log('API URL:', `${API_URL}/auth`);
    
    try {
        const response = await fetch(`${API_URL}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.authenticated) {
            isAuthenticated = true;
            localStorage.setItem('adminAuthenticated', 'true');
            showAdminContent();
            loadContent();
            errorDiv.classList.add('hidden');
        } else {
            errorDiv.textContent = 'Invalid password. Try: admin123';
            errorDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Auth error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Load failed') || error.name === 'TypeError') {
            errorDiv.innerHTML = 'Cannot connect to server.<br><br>Make sure the server is running:<br><code style="font-size: 0.8rem; opacity: 0.8; background: rgba(255,255,255,0.1); padding: 0.25rem;">npm start</code><br><br>Then refresh this page and try again.';
        } else if (error.message.includes('HTTP error')) {
            errorDiv.textContent = 'Server error: ' + error.message;
        } else {
            errorDiv.textContent = 'Authentication failed: ' + error.message;
        }
        errorDiv.classList.remove('hidden');
    }
}

function showAdminContent() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
}

async function loadContent() {
    try {
        const response = await fetch(`${API_URL}/content`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Load sections
        loadSections(data.sections || []);
        
        // Load images
        loadFiles(data.images || [], 'imagesList', 'image');
        
        // Load videos
        loadFiles(data.videos || [], 'videosList', 'video');
    } catch (error) {
        console.error('Error loading content:', error);
        alert('Failed to load content. Make sure the server is running.');
    }
}

function loadSections(sections) {
    const container = document.getElementById('sectionsList');
    container.innerHTML = '';
    
    const sortedSections = sections.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    sortedSections.forEach(section => {
        const div = document.createElement('div');
        div.className = 'section-item';
        const styleLabel = section.style ? section.style.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Body Regular';
        const contentPreview = section.content ? section.content.substring(0, 100) : '';
        div.innerHTML = `
            <h3>${styleLabel}</h3>
            <p>${contentPreview}${section.content && section.content.length > 100 ? '...' : ''}</p>
            <p style="font-size: 0.8rem; opacity: 0.6;">Order: ${section.order || 0}</p>
            <button onclick="editSection('${section.id}')">Edit</button>
            <button onclick="deleteSection('${section.id}')">Delete</button>
        `;
        container.appendChild(div);
    });
}

function loadFiles(files, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'file-item';
        
        if (type === 'image') {
            div.innerHTML = `
                <span>${file.originalName}</span>
                <div>
                    <img src="${file.path}" style="max-width: 100px; max-height: 60px; margin-right: 1rem; display: inline-block; vertical-align: middle;" />
                    <button onclick="deleteFile('${file.id}')">Delete</button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <span>${file.originalName}</span>
                <button onclick="deleteFile('${file.id}')">Delete</button>
            `;
        }
        
        container.appendChild(div);
    });
}

async function addTextContent() {
    const content = document.getElementById('textContent').value;
    const style = document.getElementById('textStyle').value;
    const order = parseInt(document.getElementById('sectionOrder').value) || 0;
    
    if (!content) {
        alert('Please provide text content');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/content/section`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                style,
                order
            })
        });
        
        if (response.ok) {
            document.getElementById('textContent').value = '';
            document.getElementById('textStyle').value = 'body-regular';
            document.getElementById('sectionOrder').value = '0';
            loadContent();
        }
    } catch (error) {
        console.error('Error adding content:', error);
        alert('Failed to add content');
    }
}

async function editSection(id) {
    try {
        const response = await fetch(`${API_URL}/content`);
        const data = await response.json();
        const section = data.sections.find(s => s.id === id);
        
        if (section) {
            document.getElementById('textContent').value = section.content || '';
            document.getElementById('textStyle').value = section.style || 'body-regular';
            document.getElementById('sectionOrder').value = section.order || 0;
            currentEditingSection = id;
            
            // Change button text
            const button = document.querySelector('.admin-section button');
            button.textContent = 'Update Content';
            button.onclick = () => updateSection(id);
        }
    } catch (error) {
        console.error('Error loading section:', error);
    }
}

async function updateSection(id) {
    const content = document.getElementById('textContent').value;
    const style = document.getElementById('textStyle').value;
    const order = parseInt(document.getElementById('sectionOrder').value) || 0;
    
    try {
        const response = await fetch(`${API_URL}/content/section`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                content,
                style,
                order
            })
        });
        
        if (response.ok) {
            document.getElementById('textContent').value = '';
            document.getElementById('textStyle').value = 'body-regular';
            document.getElementById('sectionOrder').value = '0';
            currentEditingSection = null;
            
            // Reset button
            const button = document.querySelector('.admin-section button');
            button.textContent = 'Add Content';
            button.onclick = addTextContent;
            
            loadContent();
        }
    } catch (error) {
        console.error('Error updating section:', error);
        alert('Failed to update content');
    }
}

async function deleteSection(id) {
    if (!confirm('Are you sure you want to delete this section?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/content/section/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadContent();
        }
    } catch (error) {
        console.error('Error deleting section:', error);
        alert('Failed to delete section');
    }
}

async function uploadFile(type) {
    const inputId = type === 'image' ? 'imageUpload' : 'videoUpload';
    const statusId = type === 'image' ? 'imageUploadStatus' : 'videoUploadStatus';
    const fileInput = document.getElementById(inputId);
    const statusDiv = document.getElementById(statusId);
    
    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.innerHTML = '<span class="error">Please select a file</span>';
        return;
    }
    
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    statusDiv.innerHTML = '<span>Uploading...</span>';
    
    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            statusDiv.innerHTML = '<span class="success">Upload successful!</span>';
            fileInput.value = '';
            loadContent();
            
            setTimeout(() => {
                statusDiv.innerHTML = '';
            }, 3000);
        } else {
            statusDiv.innerHTML = '<span class="error">Upload failed</span>';
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        statusDiv.innerHTML = '<span class="error">Upload failed</span>';
    }
}

async function deleteFile(id) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/content/file/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadContent();
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Failed to delete file');
    }
}

// Allow Enter key to authenticate
document.getElementById('passwordInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        authenticate();
    }
});

