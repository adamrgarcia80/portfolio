// Simple admin panel that works without a server
// Uses localStorage to store content

let isAuthenticated = false;
const ADMIN_PASSWORD = 'admin123';

// Check if already authenticated
window.addEventListener('DOMContentLoaded', () => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
        isAuthenticated = true;
        showAdminContent();
        loadContent();
    }
    
    // Show server status (always connected for client-side version)
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.innerHTML = '<span style="color: rgba(100, 255, 100, 0.8);">✓ Ready (No server needed)</span>';
        statusText.parentElement.style.background = 'rgba(100, 255, 100, 0.1)';
    }
});

function authenticate() {
    const password = document.getElementById('passwordInput').value;
    const errorDiv = document.getElementById('authError');
    
    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        localStorage.setItem('adminAuthenticated', 'true');
        showAdminContent();
        loadContent();
        errorDiv.classList.add('hidden');
    } else {
        errorDiv.textContent = 'Invalid password. Try: admin123';
        errorDiv.classList.remove('hidden');
    }
}

function showAdminContent() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
}

function loadContent() {
    const data = getStoredData();
    
    // Load sections
    loadSections(data.sections || []);
    
    // Load images
    loadFiles(data.images || [], 'imagesList', 'image');
    
    // Load videos
    loadFiles(data.videos || [], 'videosList', 'video');
}

function getStoredData() {
    try {
        const stored = localStorage.getItem('portfolioContent');
        return stored ? JSON.parse(stored) : { sections: [], images: [], videos: [] };
    } catch (error) {
        return { sections: [], images: [], videos: [] };
    }
}

function saveData(data) {
    localStorage.setItem('portfolioContent', JSON.stringify(data));
    // Also update the main page
    if (window.updatePortfolioContent) {
        window.updatePortfolioContent();
    }
}

function loadSections(sections) {
    const container = document.getElementById('sectionsList');
    if (!container) return;
    
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
    if (!container) return;
    
    container.innerHTML = '';
    
    files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'file-item';
        
        if (type === 'image') {
            div.innerHTML = `
                <span>${file.name || 'Image'}</span>
                <div>
                    <img src="${file.data}" style="max-width: 100px; max-height: 60px; margin-right: 1rem; display: inline-block; vertical-align: middle;" />
                    <button onclick="deleteFile('${file.id}', '${type}')">Delete</button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <span>${file.name || 'Video'}</span>
                <button onclick="deleteFile('${file.id}', '${type}')">Delete</button>
            `;
        }
        
        container.appendChild(div);
    });
}

function addTextContent() {
    const content = document.getElementById('textContent').value;
    const style = document.getElementById('textStyle').value;
    const order = parseInt(document.getElementById('sectionOrder').value) || 0;
    
    if (!content) {
        alert('Please provide text content');
        return;
    }
    
    const data = getStoredData();
    data.sections.push({
        id: Date.now().toString(),
        content,
        style,
        order
    });
    
    saveData(data);
    
    document.getElementById('textContent').value = '';
    document.getElementById('textStyle').value = 'body-regular';
    document.getElementById('sectionOrder').value = '0';
    loadContent();
}

function editSection(id) {
    const data = getStoredData();
    const section = data.sections.find(s => s.id === id);
    
    if (section) {
        document.getElementById('textContent').value = section.content || '';
        document.getElementById('textStyle').value = section.style || 'body-regular';
        document.getElementById('sectionOrder').value = section.order || 0;
        
        const button = document.querySelector('.admin-section button');
        button.textContent = 'Update Content';
        button.onclick = () => updateSection(id);
    }
}

function updateSection(id) {
    const content = document.getElementById('textContent').value;
    const style = document.getElementById('textStyle').value;
    const order = parseInt(document.getElementById('sectionOrder').value) || 0;
    
    const data = getStoredData();
    const index = data.sections.findIndex(s => s.id === id);
    
    if (index !== -1) {
        data.sections[index] = { ...data.sections[index], content, style, order };
        saveData(data);
        
        document.getElementById('textContent').value = '';
        document.getElementById('textStyle').value = 'body-regular';
        document.getElementById('sectionOrder').value = '0';
        
        const button = document.querySelector('.admin-section button');
        button.textContent = 'Add Content';
        button.onclick = addTextContent;
        
        loadContent();
    }
}

function deleteSection(id) {
    if (!confirm('Are you sure you want to delete this section?')) {
        return;
    }
    
    const data = getStoredData();
    data.sections = data.sections.filter(s => s.id !== id);
    saveData(data);
    loadContent();
}

function uploadFile(type) {
    const inputId = type === 'image' ? 'imageUpload' : 'videoUpload';
    const statusId = type === 'image' ? 'imageUploadStatus' : 'videoUploadStatus';
    const fileInput = document.getElementById(inputId);
    const statusDiv = document.getElementById(statusId);
    
    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.innerHTML = '<span class="error">Please select a file</span>';
        return;
    }
    
    const file = fileInput.files[0];
    const maxSize = type === 'image' ? 2 * 1024 * 1024 : 10 * 1024 * 1024; // 2MB for images, 10MB for videos
    
    if (file.size > maxSize) {
        statusDiv.innerHTML = `<span class="error">File too large. Max size: ${maxSize / 1024 / 1024}MB</span>`;
        return;
    }
    
    statusDiv.innerHTML = '<span>Processing...</span>';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = getStoredData();
        const fileData = {
            id: Date.now().toString(),
            name: file.name,
            data: e.target.result,
            type: type,
            uploadedAt: new Date().toISOString()
        };
        
        if (type === 'image') {
            data.images.push(fileData);
        } else {
            data.videos.push(fileData);
        }
        
        saveData(data);
        statusDiv.innerHTML = '<span class="success">Upload successful!</span>';
        fileInput.value = '';
        loadContent();
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
    };
    
    reader.onerror = function() {
        statusDiv.innerHTML = '<span class="error">Upload failed</span>';
    };
    
    reader.readAsDataURL(file);
}

function deleteFile(id, type) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    const data = getStoredData();
    
    if (type === 'image') {
        data.images = data.images.filter(img => img.id !== id);
    } else {
        data.videos = data.videos.filter(vid => vid.id !== id);
    }
    
    saveData(data);
    loadContent();
}

// Allow Enter key to authenticate
document.getElementById('passwordInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        authenticate();
    }
});

