// Admin panel with GitHub integration
let isAuthenticated = false;
const ADMIN_PASSWORD = 'admin123';
let currentProjectId = null;
let contentData = { projects: [], images: [], sections: [] };

// Check authentication and load GitHub config
window.addEventListener('DOMContentLoaded', async () => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
        isAuthenticated = true;
        showAdminContent();
        await loadContent();
    }
    
    // Check if GitHub is configured
    const config = getGitHubConfig();
    if (!config) {
        // Don't show setup immediately - wait for authentication
    }
});

function showGitHubSetup() {
    const adminContent = document.getElementById('adminContent');
    if (!adminContent) return;
    
    // Clear any existing error messages
    const existingError = document.getElementById('loadError');
    if (existingError) {
        existingError.remove();
    }
    
    adminContent.innerHTML = `
        <div class="admin-section">
            <h2>GitHub Setup Required</h2>
            <p style="opacity: 0.7; margin-bottom: 1rem;">Your portfolio needs to be connected to GitHub to store images and content.</p>
            
            <div style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(255, 255, 255, 0.1);">
                <h3 style="margin-top: 0;">Quick Setup</h3>
                <p style="opacity: 0.8;">Use our setup wizard for step-by-step instructions:</p>
                <a href="setup.html" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--text-color); color: var(--bg-color); text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">Open Setup Wizard →</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 1.5rem 0;" />
            
            <h3>Or Configure Manually</h3>
            
            <div class="form-group">
                <label style="display: block; margin-bottom: 0.5rem;">GitHub Username/Organization</label>
                <input type="text" id="githubOwner" placeholder="your-username" style="width: 100%; padding: 0.5rem;" />
            </div>
            
            <div class="form-group">
                <label style="display: block; margin-bottom: 0.5rem;">Repository Name</label>
                <input type="text" id="githubRepo" placeholder="portfolio" style="width: 100%; padding: 0.5rem;" />
            </div>
            
            <div class="form-group">
                <label style="display: block; margin-bottom: 0.5rem;">Branch Name</label>
                <input type="text" id="githubBranch" placeholder="main" value="main" style="width: 100%; padding: 0.5rem;" />
            </div>
            
            <div class="form-group">
                <label style="display: block; margin-bottom: 0.5rem;">Personal Access Token</label>
                <input type="password" id="githubToken" placeholder="ghp_xxxxxxxxxxxx" style="width: 100%; padding: 0.5rem;" />
                <small style="opacity: 0.6; display: block; margin-top: 0.5rem; font-size: 0.85rem;">
                    Create one at: <a href="https://github.com/settings/tokens" target="_blank" style="color: var(--text-color); text-decoration: underline;">github.com/settings/tokens</a><br>
                    Required scopes: <code>repo</code>
                </small>
            </div>
            
            <div class="form-group">
                <label style="display: block; margin-bottom: 0.5rem;">Images Folder (optional)</label>
                <input type="text" id="githubImagesFolder" placeholder="images" value="images" style="width: 100%; padding: 0.5rem;" />
                <small style="opacity: 0.6; display: block; margin-top: 0.5rem; font-size: 0.85rem;">
                    Folder name where images will be stored (default: "images")
                </small>
            </div>
            
            <button onclick="saveGitHubConfig()" style="width: 100%; margin-top: 1rem; padding: 0.75rem;">Save Configuration</button>
            <div id="githubConfigStatus" style="margin-top: 1rem; font-size: 0.9rem;"></div>
        </div>
    `;
}

async function saveGitHubConfig() {
    const owner = document.getElementById('githubOwner').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const branch = document.getElementById('githubBranch').value.trim() || 'main';
    const token = document.getElementById('githubToken').value.trim();
    const imagesFolder = document.getElementById('githubImagesFolder').value.trim() || 'images';
    
    if (!owner || !repo || !token) {
        alert('Please fill in all required fields');
        return;
    }
    
    const config = { owner, repo, branch, token, imagesFolder };
    saveGitHubConfig(config);
    
    // Test connection
    const statusDiv = document.getElementById('githubConfigStatus');
    if (statusDiv) {
        statusDiv.innerHTML = '<span style="opacity: 0.7;">Testing connection...</span>';
    }
    
    try {
        await getContentFromGitHub();
        if (statusDiv) {
            statusDiv.innerHTML = '<span class="success">GitHub connection successful! Reloading...</span>';
        } else {
            alert('GitHub connection successful!');
        }
        setTimeout(() => {
            location.reload();
        }, 1000);
    } catch (error) {
        console.error('Connection test failed:', error);
        if (statusDiv) {
            statusDiv.innerHTML = `<span class="error">Connection failed: ${error.message}</span>`;
        } else {
            alert('Connection failed: ' + error.message);
        }
    }
}

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
        errorDiv.textContent = 'Invalid password';
        errorDiv.classList.remove('hidden');
    }
}

function showAdminContent() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
    
    // Check if GitHub is configured
    const config = getGitHubConfig();
    if (!config) {
        showGitHubSetup();
    } else {
        loadAdminInterface();
    }
}

function loadAdminInterface() {
    // Restore the original admin interface HTML
    const adminContent = document.getElementById('adminContent');
    adminContent.innerHTML = `
        <div class="admin-section">
            <h2>Projects</h2>
            <div id="projectsList" style="margin-top: var(--spacing-unit);"></div>
        </div>
        
        <div class="admin-section">
            <h2>Project Name</h2>
            <div class="form-group">
                <input type="text" id="projectName" placeholder="Enter project name" />
            </div>
        </div>
        
        <div class="admin-section">
            <h2>Content</h2>
            <div id="contentBlocksList" style="margin-top: var(--spacing-unit);"></div>
            <div style="display: flex; gap: var(--spacing-unit); margin-top: var(--spacing-unit);">
                <button onclick="showAddCopy()">Add Copy</button>
                <button onclick="showAddImage()">Add Image</button>
            </div>
            <div id="addCopyForm" class="hidden" style="margin-top: var(--spacing-unit); margin-bottom: var(--spacing-unit);">
                <div class="form-group">
                    <textarea id="textContent" placeholder="Enter text"></textarea>
                </div>
                <div class="form-group" style="display: flex; gap: var(--spacing-unit); align-items: center;">
                    <button onclick="addTextContent()">Add</button>
                    <button onclick="hideAddCopy()">Cancel</button>
                </div>
            </div>
            <div id="addImageForm" class="hidden" style="margin-top: var(--spacing-unit); margin-bottom: var(--spacing-unit);">
                <div class="form-group">
                    <input type="file" id="imageUpload" accept="image/*" />
                </div>
                <div class="form-group" style="display: flex; gap: var(--spacing-unit); align-items: center;">
                    <select id="imageLayout" style="flex: 1;">
                        <option value="single">Single Column</option>
                        <option value="two-column">Two Column</option>
                    </select>
                    <button onclick="uploadFile('image')">Add</button>
                    <button onclick="hideAddImage()">Cancel</button>
                </div>
                <div id="imageUploadStatus"></div>
            </div>
        </div>
        
        <div class="admin-section">
            <button onclick="saveProjectInfo()" style="width: 100%;">Save Project</button>
        </div>
        
        <div class="admin-section">
            <a href="index.html" style="color: var(--text-color); text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.9rem;">← Back to Portfolio</a>
        </div>
    `;
}

async function loadContent() {
    try {
        const config = getGitHubConfig();
        if (!config) {
            // Show setup screen if not configured
            showGitHubSetup();
            return;
        }
        
        contentData = await getContentFromGitHub();
        if (!contentData.projects) contentData.projects = [];
        if (!contentData.images) contentData.images = [];
        if (!contentData.sections) contentData.sections = [];
        
        // Make sure admin interface is loaded
        const adminContent = document.getElementById('adminContent');
        if (adminContent && !adminContent.querySelector('#projectsList')) {
            loadAdminInterface();
        }
        
        // Clear any existing error messages
        const existingError = document.getElementById('loadError');
        if (existingError) {
            existingError.remove();
        }
        
        loadProjects(contentData.projects);
        
        if (currentProjectId) {
            await loadProjectContent();
        }
    } catch (error) {
        console.error('Error loading content:', error);
        
        // If error is about GitHub not configured, show setup screen
        if (error.message && (error.message.includes('not configured') || error.message.includes('GitHub not configured'))) {
            showGitHubSetup();
            return;
        }
        
        // For other errors, show error but don't replace entire interface
        const adminContent = document.getElementById('adminContent');
        if (adminContent) {
            // Only replace if we don't have the admin interface loaded
            if (!adminContent.querySelector('#projectsList')) {
                adminContent.innerHTML = `
                    <div class="admin-section">
                        <h2>Error</h2>
                        <p style="opacity: 0.7;">Error loading from GitHub: ${error.message}</p>
                        <button onclick="location.reload()" style="margin-top: 1rem;">Retry</button>
                        <button onclick="showGitHubSetup()" style="margin-top: 0.5rem;">Configure GitHub</button>
                    </div>
                `;
            } else {
                // If interface is loaded, just show a temporary error message
                const errorDiv = document.createElement('div');
                errorDiv.id = 'loadError';
                errorDiv.style.cssText = 'padding: 0.75rem; margin: 1rem 0; background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.3); border-radius: 3px;';
                errorDiv.innerHTML = `<p style="margin: 0; opacity: 0.9;">Error loading: ${error.message}. <a href="#" onclick="location.reload(); return false;" style="color: var(--text-color); text-decoration: underline;">Retry</a></p>`;
                
                const firstSection = adminContent.querySelector('.admin-section');
                if (firstSection) {
                    adminContent.insertBefore(errorDiv, firstSection);
                    
                    // Auto-remove after 5 seconds
                    setTimeout(() => {
                        if (errorDiv.parentElement) {
                            errorDiv.remove();
                        }
                    }, 5000);
                }
            }
        }
    }
}

function loadProjects(projects) {
    const projectsList = document.getElementById('projectsList');
    if (!projectsList) return;
    
    if (projects.length === 0) {
        projectsList.innerHTML = '<p style="opacity: 0.6; font-size: 0.9rem;">No projects yet</p>';
        return;
    }
    
    const sortedProjects = projects.sort((a, b) => (a.order || 0) - (b.order || 0));
    const links = sortedProjects.map(project => {
        return `<a href="#" onclick="selectProject('${project.id}'); return false;" style="color: var(--text-color); text-decoration: underline; margin-right: 1.5rem;">${project.name || 'Untitled'}</a>`;
    }).join('');
    
    projectsList.innerHTML = `<p>${links}</p>`;
}

async function selectProject(id) {
    currentProjectId = id;
    const project = contentData.projects.find(p => p.id === id);
    if (project) {
        const projectNameInput = document.getElementById('projectName');
        if (projectNameInput) {
            projectNameInput.value = project.name || '';
        }
        await loadProjectContent();
    }
}

async function loadProjectContent() {
    if (!currentProjectId) return;
    
    const project = contentData.projects.find(p => p.id === currentProjectId);
    if (!project) return;
    
    const projectImages = (contentData.images || []).filter(img => img.projectId === currentProjectId);
    const projectSections = (contentData.sections || []).filter(s => s.projectId === currentProjectId);
    
    const allContent = [
        ...projectSections.map(s => ({ ...s, contentType: 'text' })),
        ...projectImages.map(i => ({ ...i, contentType: 'image' }))
    ].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    displayContentBlocks(allContent);
}

function displayContentBlocks(blocks) {
    const container = document.getElementById('contentBlocksList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (blocks.length === 0) {
        container.innerHTML = '<p style="opacity: 0.6; font-size: 0.9rem;">No content yet</p>';
        return;
    }
    
    blocks.forEach(block => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 0.75rem; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;';
        
        if (block.contentType === 'text') {
            const preview = block.content ? block.content.substring(0, 60) : '';
            div.innerHTML = `
                <div style="flex: 1;">
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">${preview}${block.content && block.content.length > 60 ? '...' : ''}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="deleteTextBlock('${block.id}')">Delete</button>
                </div>
            `;
        } else if (block.contentType === 'image') {
            div.innerHTML = `
                <div style="flex: 1; display: flex; align-items: center; gap: 1rem;">
                    <img src="${block.url}" style="max-width: 60px; max-height: 40px; object-fit: cover;" onerror="this.style.display='none'" />
                    <div>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">${block.name || 'Image'} ${block.layout === 'two-column' ? '(Two Column)' : ''}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="deleteFile('${block.id}', 'image')">Delete</button>
                </div>
            `;
        }
        
        container.appendChild(div);
    });
}

// Modified uploadFile to upload to GitHub
async function uploadFile(type) {
    const projectName = document.getElementById('projectName').value;
    if (!currentProjectId) {
        if (!projectName) {
            alert('Please enter a project name first');
            return;
        }
        // Create new project
        const project = {
            id: Date.now().toString(),
            name: projectName,
            order: 0,
            createdAt: new Date().toISOString()
        };
        if (!contentData.projects) contentData.projects = [];
        contentData.projects.push(project);
        currentProjectId = project.id;
        loadProjects(contentData.projects);
    }
    
    const fileInput = document.getElementById('imageUpload');
    const statusDiv = document.getElementById('imageUploadStatus');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.innerHTML = '<span class="error">Please select a file</span>';
        return;
    }
    
    const file = fileInput.files[0];
    const config = getGitHubConfig();
    const imagesFolder = config.imagesFolder || 'images';
    
    // Sanitize filename
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedFileName}`;
    const filePath = `${imagesFolder}/${fileName}`;
    
    statusDiv.innerHTML = '<span>Uploading to GitHub...</span>';
    
    try {
        // Upload to GitHub
        const imageUrl = await uploadFileToGitHub(file, filePath);
        
        const layout = document.getElementById('imageLayout').value;
        const existingImages = (contentData.images || []).filter(img => img.projectId === currentProjectId);
        const maxOrder = existingImages.length > 0 ? Math.max(...existingImages.map(i => i.order || 0)) : -1;
        
        const imageData = {
            id: Date.now().toString(),
            name: file.name,
            url: imageUrl,
            layout: layout,
            order: maxOrder + 1,
            projectId: currentProjectId,
            uploadedAt: new Date().toISOString()
        };
        
        if (!contentData.images) contentData.images = [];
        contentData.images.push(imageData);
        
        // Update content.json on GitHub
        await updateContentOnGitHub(contentData);
        
        statusDiv.innerHTML = '<span class="success">Uploaded to GitHub!</span>';
        fileInput.value = '';
        hideAddImage();
        await loadProjectContent();
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 2000);
    } catch (error) {
        console.error('Error uploading:', error);
        statusDiv.innerHTML = `<span class="error">Upload failed: ${error.message}</span>`;
    }
}

async function addTextContent() {
    const projectName = document.getElementById('projectName').value;
    if (!currentProjectId) {
        if (!projectName) {
            alert('Please enter a project name first');
            return;
        }
        const project = {
            id: Date.now().toString(),
            name: projectName,
            order: 0,
            createdAt: new Date().toISOString()
        };
        if (!contentData.projects) contentData.projects = [];
        contentData.projects.push(project);
        currentProjectId = project.id;
        loadProjects(contentData.projects);
    }
    
    const content = document.getElementById('textContent').value;
    if (!content) {
        alert('Please enter text content');
        return;
    }
    
    const existingSections = (contentData.sections || []).filter(s => s.projectId === currentProjectId);
    const maxOrder = existingSections.length > 0 ? Math.max(...existingSections.map(s => s.order || 0)) : -1;
    
    const section = {
        id: Date.now().toString(),
        content,
        style: 'body-regular',
        order: maxOrder + 1,
        projectId: currentProjectId,
        createdAt: new Date().toISOString()
    };
    
    if (!contentData.sections) contentData.sections = [];
    contentData.sections.push(section);
    
    await updateContentOnGitHub(contentData);
    
    document.getElementById('textContent').value = '';
    hideAddCopy();
    await loadProjectContent();
}

async function deleteTextBlock(id) {
    if (!confirm('Delete this content block?')) return;
    
    if (contentData.sections) {
        contentData.sections = contentData.sections.filter(s => s.id !== id);
        await updateContentOnGitHub(contentData);
        await loadProjectContent();
    }
}

async function deleteFile(id, type) {
    if (!confirm('Delete this file?')) return;
    
    if (type === 'image' && contentData.images) {
        contentData.images = contentData.images.filter(img => img.id !== id);
        await updateContentOnGitHub(contentData);
        await loadProjectContent();
    }
}

async function saveProjectInfo() {
    const name = document.getElementById('projectName').value;
    if (!name) {
        alert('Please enter a project name');
        return;
    }
    
    // Show saving status
    const saveButton = document.querySelector('button[onclick="saveProjectInfo()"]');
    const originalButtonText = saveButton ? saveButton.textContent : 'Save Project';
    if (saveButton) {
        saveButton.textContent = 'Saving...';
        saveButton.disabled = true;
    }
    
    try {
        if (!currentProjectId) {
            const project = {
                id: Date.now().toString(),
                name,
                order: 0,
                createdAt: new Date().toISOString()
            };
            if (!contentData.projects) contentData.projects = [];
            contentData.projects.push(project);
            currentProjectId = project.id;
        } else {
            const project = contentData.projects.find(p => p.id === currentProjectId);
            if (project) {
                project.name = name;
            }
        }
        
        await updateContentOnGitHub(contentData);
        loadProjects(contentData.projects);
        
        // Show success message
        showSaveStatus('Project Saved', 'success');
        
    } catch (error) {
        console.error('Error saving project:', error);
        showSaveStatus('Error saving project: ' + error.message, 'error');
    } finally {
        // Restore button
        if (saveButton) {
            saveButton.textContent = originalButtonText;
            saveButton.disabled = false;
        }
    }
}

function showSaveStatus(message, type) {
    // Remove existing status if any
    const existingStatus = document.getElementById('saveStatus');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Create status element
    const statusDiv = document.createElement('div');
    statusDiv.id = 'saveStatus';
    statusDiv.style.cssText = `
        padding: 0.75rem 1rem;
        margin-top: 1rem;
        border-radius: 3px;
        text-align: center;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        ${type === 'success' 
            ? 'background: rgba(0, 255, 0, 0.1); border: 1px solid rgba(0, 255, 0, 0.3); color: rgba(0, 255, 0, 0.9);'
            : 'background: rgba(255, 0, 0, 0.1); border: 1px solid rgba(255, 0, 0, 0.3); color: rgba(255, 0, 0, 0.9);'
        }
    `;
    statusDiv.textContent = message;
    
    // Find the save button's parent section and insert after it
    const saveButton = document.querySelector('button[onclick="saveProjectInfo()"]');
    if (saveButton && saveButton.parentElement) {
        saveButton.parentElement.appendChild(statusDiv);
        
        // Auto-hide after 3 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (statusDiv.parentElement) {
                    statusDiv.style.transition = 'opacity 0.3s ease-out';
                    statusDiv.style.opacity = '0';
                    setTimeout(() => {
                        if (statusDiv.parentElement) {
                            statusDiv.remove();
                        }
                    }, 300);
                }
            }, 3000);
        }
    }
}

// Helper functions
function showAddCopy() {
    document.getElementById('addCopyForm').classList.remove('hidden');
    document.getElementById('addImageForm').classList.add('hidden');
}

function hideAddCopy() {
    document.getElementById('addCopyForm').classList.add('hidden');
    document.getElementById('textContent').value = '';
}

function showAddImage() {
    document.getElementById('addImageForm').classList.remove('hidden');
    document.getElementById('addCopyForm').classList.add('hidden');
}

function hideAddImage() {
    document.getElementById('addImageForm').classList.add('hidden');
    document.getElementById('imageUpload').value = '';
}

// Allow Enter key to authenticate
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                authenticate();
            }
        });
    }
});

