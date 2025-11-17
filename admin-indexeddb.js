// Simplified admin panel
let isAuthenticated = false;
const ADMIN_PASSWORD = 'admin123';
let currentProjectId = null;

// Check if already authenticated
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await initializeDefaults();
        
        const authStatus = localStorage.getItem('adminAuthenticated');
        if (authStatus === 'true') {
            isAuthenticated = true;
            showAdminContent();
            await loadContent();
        }
        
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.innerHTML = 'Ready';
        }
    } catch (error) {
        console.error('Database initialization error:', error);
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
        errorDiv.textContent = 'Invalid password';
        errorDiv.classList.remove('hidden');
    }
}

function showAdminContent() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('adminContent').classList.remove('hidden');
}

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

async function loadContent() {
    try {
        const projects = await getProjects();
        loadProjects(projects);
        
        if (currentProjectId) {
            await loadProjectContent();
        } else {
            document.getElementById('contentBlocksList').innerHTML = '<p style="opacity: 0.6; font-size: 0.9rem;">Select a project to edit content</p>';
        }
    } catch (error) {
        console.error('Error loading content:', error);
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
    try {
        const project = await getProject(id);
        if (project) {
            currentProjectId = id;
            document.getElementById('projectName').value = project.name || '';
            await loadProjectContent();
        }
    } catch (error) {
        console.error('Error loading project:', error);
    }
}

async function loadProjectContent() {
    if (!currentProjectId) {
        document.getElementById('contentBlocksList').innerHTML = '<p style="opacity: 0.6; font-size: 0.9rem;">Select a project to edit content</p>';
        return;
    }
    
    try {
        const [sections, images, videos] = await Promise.all([
            getSectionsForProject(currentProjectId),
            getImagesForProject(currentProjectId),
            getVideosForProject(currentProjectId)
        ]);
        
        // Combine and sort all content by order
        const allContent = [
            ...sections.map(s => ({ ...s, contentType: 'text' })),
            ...images.map(i => ({ ...i, contentType: 'image' })),
            ...videos.map(v => ({ ...v, contentType: 'video' }))
        ].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        displayContentBlocks(allContent);
    } catch (error) {
        console.error('Error loading project content:', error);
    }
}

function displayContentBlocks(blocks) {
    const container = document.getElementById('contentBlocksList');
    if (!container) return;
    
    container.innerHTML = '';
    
    blocks.forEach(block => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 0.75rem; margin-bottom: 0.5rem; border: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;';
        
        if (block.contentType === 'text') {
            const preview = block.content ? block.content.substring(0, 60).replace(/\*\*/g, '') : '';
            div.innerHTML = `
                <div style="flex: 1;">
                    <strong style="text-transform: uppercase; font-size: 0.85rem; opacity: 0.8;">${block.style || 'body-regular'}</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">${preview}${block.content && block.content.length > 60 ? '...' : ''}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editTextBlock('${block.id}')">Edit</button>
                    <button onclick="deleteTextBlock('${block.id}')">Delete</button>
                </div>
            `;
        } else if (block.contentType === 'image') {
            div.innerHTML = `
                <div style="flex: 1; display: flex; align-items: center; gap: 1rem;">
                    <img src="${block.data}" style="max-width: 60px; max-height: 40px; object-fit: cover;" />
                    <div>
                        <strong style="text-transform: uppercase; font-size: 0.85rem; opacity: 0.8;">Image</strong>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">${block.name || 'Image'} ${block.layout === 'two-column' ? '(Two Column)' : ''}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="deleteFile('${block.id}', 'image')">Delete</button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div style="flex: 1;">
                    <strong style="text-transform: uppercase; font-size: 0.85rem; opacity: 0.8;">Video</strong>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">${block.name || 'Video'}</p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="deleteFile('${block.id}', 'video')">Delete</button>
                </div>
            `;
        }
        
        container.appendChild(div);
    });
}

async function saveProjectInfo() {
    const name = document.getElementById('projectName').value;
    
    if (!name) {
        alert('Please enter a project name');
        return;
    }
    
    try {
        let project;
        if (currentProjectId) {
            // Update existing project
            project = await getProject(currentProjectId);
            if (project) {
                project.name = name;
            } else {
                project = {
                    id: currentProjectId,
                    name,
                    order: 0,
                    createdAt: new Date().toISOString()
                };
            }
        } else {
            // Create new project
            project = {
                id: Date.now().toString(),
                name,
                order: 0,
                createdAt: new Date().toISOString()
            };
        }
        
        await saveProject(project);
        currentProjectId = project.id;
        
        // Reload projects list at top
        const projects = await getProjects();
        loadProjects(projects);
        
        // Update main index page
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
    } catch (error) {
        console.error('Error saving project:', error);
        alert('Error saving project');
    }
}

async function addTextContent() {
    // Auto-create project if name exists and no project is selected
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
        await saveProject(project);
        currentProjectId = project.id;
        const projects = await getProjects();
        loadProjects(projects);
    } else if (projectName) {
        // Update existing project name if changed
        const project = await getProject(currentProjectId);
        if (project && project.name !== projectName) {
            project.name = projectName;
            await saveProject(project);
            const projects = await getProjects();
            loadProjects(projects);
        }
    }
    
    const content = document.getElementById('textContent').value;
    const style = 'body-regular'; // Default to body regular
    
    // Get current max order and add 1
    const existingContent = await getSectionsForProject(currentProjectId);
    const maxOrder = existingContent.length > 0 ? Math.max(...existingContent.map(c => c.order || 0)) : -1;
    const order = maxOrder + 1;
    
    if (!content) {
        alert('Please enter text content');
        return;
    }
    
    try {
        const section = {
            id: Date.now().toString(),
            content,
            style,
            order,
            projectId: currentProjectId,
            richText: content.includes('**') || content.includes('[') || content.includes('<')
        };
        
        await saveSection(section);
        
        document.getElementById('textContent').value = '';
        hideAddCopy();
        await loadProjectContent();
        
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
    } catch (error) {
        console.error('Error saving content:', error);
        alert('Error saving content');
    }
}

async function editTextBlock(id) {
    try {
        const sections = await getSectionsForProject(currentProjectId);
        const section = sections.find(s => s.id === id);
        
        if (section) {
            document.getElementById('textContent').value = section.content || '';
            showAddCopy();
            
            // Change button to update
            const addButton = document.querySelector('#addCopyForm button[onclick="addTextContent()"]');
            if (addButton) {
                addButton.textContent = 'Update';
                addButton.onclick = () => updateTextBlock(id);
            }
        }
    } catch (error) {
        console.error('Error loading section:', error);
    }
}

async function updateTextBlock(id) {
    const content = document.getElementById('textContent').value;
    
    try {
        const sections = await getSectionsForProject(currentProjectId);
        const section = sections.find(s => s.id === id);
        
        if (section) {
            section.content = content;
            section.style = section.style || 'body-regular'; // Keep existing style or default
            section.richText = content.includes('**') || content.includes('[') || content.includes('<');
            await saveSection(section);
            
            document.getElementById('textContent').value = '';
            hideAddCopy();
            
            // Reset button
            const updateButton = document.querySelector('#addCopyForm button[onclick*="updateTextBlock"]');
            if (updateButton) {
                updateButton.textContent = 'Add';
                updateButton.onclick = addTextContent;
            }
            
            await loadProjectContent();
            
            if (window.updatePortfolioContent) {
                window.updatePortfolioContent();
            }
        }
    } catch (error) {
        console.error('Error updating section:', error);
        alert('Error updating content');
    }
}

async function deleteTextBlock(id) {
    if (!confirm('Delete this content block?')) return;
    
    try {
        await deleteSection(id);
        await loadProjectContent();
        
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
    } catch (error) {
        console.error('Error deleting section:', error);
        alert('Error deleting content');
    }
}

async function uploadFile(type) {
    // Auto-create project if name exists and no project is selected
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
        await saveProject(project);
        currentProjectId = project.id;
        const projects = await getProjects();
        loadProjects(projects);
    } else if (projectName) {
        // Update existing project name if changed
        const project = await getProject(currentProjectId);
        if (project && project.name !== projectName) {
            project.name = projectName;
            await saveProject(project);
            const projects = await getProjects();
            loadProjects(projects);
        }
    }
    
    const fileInput = document.getElementById('imageUpload');
    const statusDiv = document.getElementById('imageUploadStatus');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.innerHTML = '<span class="error">Please select a file</span>';
        return;
    }
    
    const file = fileInput.files[0];
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (file.size > maxSize) {
        statusDiv.innerHTML = `<span class="error">File too large. Max: ${maxSize / 1024 / 1024}MB</span>`;
        return;
    }
    
    statusDiv.innerHTML = '<span>Uploading to cloud...</span>';
    
    try {
        // Get Cloudinary config
        const cloudinaryConfig = await getCloudinaryConfig();
        
        if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
            statusDiv.innerHTML = '<span class="error">Please configure Cloudinary settings first</span>';
            return;
        }
        
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Cloudinary upload failed');
        }
        
        const cloudinaryData = await response.json();
        
        const layout = document.getElementById('imageLayout').value;
        
        // Get current max order and add 1
        const existingImages = await getImagesForProject(currentProjectId);
        const maxOrder = existingImages.length > 0 ? Math.max(...existingImages.map(i => i.order || 0)) : -1;
        const order = maxOrder + 1;
        
        // Store Cloudinary URL instead of base64
        const fileData = {
            id: Date.now().toString(),
            name: file.name,
            url: cloudinaryData.secure_url, // Use Cloudinary URL
            publicId: cloudinaryData.public_id, // Store for deletion
            size: file.size,
            type: 'image',
            layout: layout,
            order: order,
            projectId: currentProjectId,
            uploadedAt: new Date().toISOString()
        };
        
        await saveImage(fileData);
        
        statusDiv.innerHTML = '<span class="success">Uploaded to cloud!</span>';
        fileInput.value = '';
        hideAddImage();
        await loadProjectContent();
        
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
        if (window.updateImageCarousel) {
            window.updateImageCarousel();
        }
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 2000);
    } catch (error) {
        console.error('Error uploading file:', error);
        statusDiv.innerHTML = '<span class="error">Upload failed. Check Cloudinary settings.</span>';
    }
}

async function deleteFile(id, type) {
    if (!confirm('Delete this file?')) return;
    
    try {
        if (type === 'image') {
            await deleteImage(id);
        } else {
            await deleteVideo(id);
        }
        
        await loadProjectContent();
        
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
        if (window.updateImageCarousel) {
            window.updateImageCarousel();
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        alert('Error deleting file');
    }
}

// Load site settings (bio and footer links)
async function loadSiteSettings() {
    try {
        const settings = await getSiteSettings();
        
        // Load bio text
        const bioTextarea = document.getElementById('bioText');
        if (bioTextarea && settings.bioText) {
            bioTextarea.value = settings.bioText;
        }
        
        // Load Cloudinary config
        const cloudinaryConfig = settings.cloudinaryConfig || { cloudName: '', uploadPreset: '' };
        const cloudNameInput = document.getElementById('cloudinaryCloudName');
        const uploadPresetInput = document.getElementById('cloudinaryUploadPreset');
        if (cloudNameInput) cloudNameInput.value = cloudinaryConfig.cloudName || '';
        if (uploadPresetInput) uploadPresetInput.value = cloudinaryConfig.uploadPreset || '';
        
        // Load footer links
        await loadFooterLinks();
    } catch (error) {
        console.error('Error loading site settings:', error);
    }
}

async function saveCloudinaryConfig() {
    try {
        const cloudName = document.getElementById('cloudinaryCloudName').value.trim();
        const uploadPreset = document.getElementById('cloudinaryUploadPreset').value.trim();
        
        if (!cloudName || !uploadPreset) {
            document.getElementById('cloudinaryStatus').innerHTML = '<span class="error">Please enter both Cloud Name and Upload Preset</span>';
            return;
        }
        
        await saveCloudinaryConfig({ cloudName, uploadPreset });
        document.getElementById('cloudinaryStatus').innerHTML = '<span class="success">Cloudinary settings saved!</span>';
        
        setTimeout(() => {
            document.getElementById('cloudinaryStatus').innerHTML = '';
        }, 3000);
    } catch (error) {
        console.error('Error saving Cloudinary config:', error);
        document.getElementById('cloudinaryStatus').innerHTML = '<span class="error">Error saving settings</span>';
    }
}

async function saveBioText() {
    try {
        const bioText = document.getElementById('bioText').value;
        const settings = await getSiteSettings();
        settings.bioText = bioText;
        await saveSiteSettings(settings);
        alert('Bio text saved!');
        
        // Update index page if it's open
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
    } catch (error) {
        console.error('Error saving bio text:', error);
        alert('Error saving bio text');
    }
}

async function loadFooterLinks() {
    try {
        const settings = await getSiteSettings();
        const links = settings.footerLinks || [];
        const linksList = document.getElementById('footerLinksList');
        if (!linksList) return;
        
        linksList.innerHTML = '';
        
        if (links.length === 0) {
            linksList.innerHTML = '<p style="opacity: 0.6; font-size: 0.9rem;">No links yet</p>';
            return;
        }
        
        links.forEach((link, index) => {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'file-item';
            linkDiv.innerHTML = `
                <span><a href="${link.url}" target="_blank" style="color: var(--text-color); text-decoration: underline;">${link.text}</a></span>
                <button onclick="deleteFooterLink(${index})">Delete</button>
            `;
            linksList.appendChild(linkDiv);
        });
    } catch (error) {
        console.error('Error loading footer links:', error);
    }
}

async function addFooterLink() {
    try {
        const text = document.getElementById('linkText').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        
        if (!text || !url) {
            alert('Please enter both link text and URL');
            return;
        }
        
        const settings = await getSiteSettings();
        if (!settings.footerLinks) {
            settings.footerLinks = [];
        }
        
        settings.footerLinks.push({ text, url });
        await saveSiteSettings(settings);
        
        document.getElementById('linkText').value = '';
        document.getElementById('linkUrl').value = '';
        
        await loadFooterLinks();
        
        // Update index page if it's open
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
    } catch (error) {
        console.error('Error adding footer link:', error);
        alert('Error adding footer link');
    }
}

async function deleteFooterLink(index) {
    if (!confirm('Delete this link?')) return;
    
    try {
        const settings = await getSiteSettings();
        if (settings.footerLinks) {
            settings.footerLinks.splice(index, 1);
            await saveSiteSettings(settings);
            await loadFooterLinks();
            
            // Update index page if it's open
            if (window.updatePortfolioContent) {
                window.updatePortfolioContent();
            }
        }
    } catch (error) {
        console.error('Error deleting footer link:', error);
        alert('Error deleting footer link');
    }
}

// Load content on page load
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await loadProjects();
    await loadSiteSettings();
});

async function exportData() {
    try {
        const statusDiv = document.getElementById('syncStatus');
        statusDiv.innerHTML = '<span>Exporting data...</span>';
        
        // Get all data from IndexedDB
        const [projects, sections, images, videos, siteSettings] = await Promise.all([
            getProjects(),
            getSections(),
            getImages(),
            getVideos(),
            getSiteSettings()
        ]);
        
        const exportData = {
            projects,
            sections,
            images,
            videos,
            siteSettings,
            exportDate: new Date().toISOString()
        };
        
        // Create download
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `portfolio-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        statusDiv.innerHTML = '<span class="success">Data exported successfully!</span>';
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 3000);
    } catch (error) {
        console.error('Error exporting data:', error);
        const statusDiv = document.getElementById('syncStatus');
        statusDiv.innerHTML = '<span class="error">Error exporting data</span>';
    }
}

async function importData(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        const statusDiv = document.getElementById('syncStatus');
        statusDiv.innerHTML = '<span>Importing data...</span>';
        
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // Import projects
        if (importData.projects) {
            for (const project of importData.projects) {
                await saveProject(project);
            }
        }
        
        // Import sections
        if (importData.sections) {
            for (const section of importData.sections) {
                await saveSection(section);
            }
        }
        
        // Import images
        if (importData.images) {
            for (const image of importData.images) {
                await saveImage(image);
            }
        }
        
        // Import videos
        if (importData.videos) {
            for (const video of importData.videos) {
                await saveVideo(video);
            }
        }
        
        // Import site settings
        if (importData.siteSettings) {
            await saveSiteSettings(importData.siteSettings);
        }
        
        // Reload everything
        await loadProjects();
        await loadSiteSettings();
        if (currentProjectId) {
            await loadProjectContent();
        }
        
        statusDiv.innerHTML = '<span class="success">Data imported successfully! Refresh the page to see changes.</span>';
        
        // Update index page if it's open
        if (window.updatePortfolioContent) {
            window.updatePortfolioContent();
        }
        if (window.updateImageCarousel) {
            window.updateImageCarousel();
        }
        
        // Clear file input
        event.target.value = '';
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    } catch (error) {
        console.error('Error importing data:', error);
        const statusDiv = document.getElementById('syncStatus');
        statusDiv.innerHTML = '<span class="error">Error importing data. Please check the file format.</span>';
        event.target.value = '';
    }
}

// Allow Enter key to authenticate
document.getElementById('passwordInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        authenticate();
    }
});
