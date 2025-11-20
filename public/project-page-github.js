// Project page that loads specific project content from GitHub

const GITHUB_CONFIG_KEY = 'githubConfig';

function getGitHubConfig() {
    const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return null;
}

async function loadProject() {
    try {
        const config = getGitHubConfig();
        if (!config) {
            document.getElementById('contentContainer').innerHTML = '<p>GitHub not configured.</p>';
            return;
        }
        
        // Get project ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            document.getElementById('contentContainer').innerHTML = '<p>Project not found.</p>';
            return;
        }
        
        // Load content from GitHub
        const branch = config.branch || 'main';
        const response = await fetch(
            `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/content.json`
        );
        
        if (!response.ok) {
            document.getElementById('contentContainer').innerHTML = '<p>Error loading content.</p>';
            return;
        }
        
        const data = await response.json();
        const projects = data.projects || [];
        const sections = data.sections || [];
        const images = data.images || [];
        const videos = data.videos || [];
        
        // Find project
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            document.getElementById('contentContainer').innerHTML = '<p>Project not found.</p>';
            return;
        }
        
        // Set page title and header
        document.title = project.name + ' - Portfolio';
        const projectTitleElement = document.getElementById('projectTitle');
        if (projectTitleElement) {
            projectTitleElement.textContent = project.name || 'Project';
        }
        
        // Setup navigation
        await setupNavigation(projectId, projects);
        
        // Get project-specific content
        const projectSections = sections.filter(s => s.projectId === projectId);
        const projectImages = images.filter(img => img.projectId === projectId);
        const projectVideos = videos.filter(vid => vid.projectId === projectId);
        
        const container = document.getElementById('contentContainer');
        container.innerHTML = '';
        
        // Load sections
        const sortedSections = projectSections.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        sortedSections.forEach(section => {
            if (!section.content) return;
            
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'content-section';
            
            const textElement = document.createElement('div');
            const style = section.style || 'body-regular';
            
            if (style === 'header') {
                textElement.className = 'text-header';
            } else if (style === 'body-bold') {
                textElement.className = 'text-body-bold';
            } else if (style === 'link') {
                textElement.className = 'text-link';
            } else {
                textElement.className = 'text-body-regular';
            }
            
            // Handle rich text (HTML) or plain text
            const lines = section.content.split('\n');
            if (style === 'link') {
                textElement.textContent = section.content;
                textElement.style.cursor = 'pointer';
            } else {
                lines.forEach((line, index) => {
                    if (line.trim()) {
                        const p = document.createElement('p');
                        let processedLine = line;
                        
                        // Check if content contains HTML (for rich text)
                        if (section.richText || line.includes('<strong>') || line.includes('<b>') || line.includes('<a>')) {
                            p.innerHTML = processedLine;
                        } else {
                            // Convert **bold** to <strong>bold</strong>
                            processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            // Convert [link text](url) to <a href="url">link text</a>
                            processedLine = processedLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="inline-link">$1</a>');
                            p.innerHTML = processedLine;
                        }
                        textElement.appendChild(p);
                    }
                });
            }
            
            sectionDiv.appendChild(textElement);
            container.appendChild(sectionDiv);
        });
        
        // Load images
        if (projectImages && projectImages.length > 0) {
            // Sort images by order
            const sortedImages = projectImages.sort((a, b) => (a.order || 0) - (b.order || 0));
            // Group images by layout
            const singleImages = sortedImages.filter(img => !img.layout || img.layout === 'single');
            const twoColumnImages = sortedImages.filter(img => img.layout === 'two-column');
            
            // Single column images
            if (singleImages.length > 0) {
                const imagesDiv = document.createElement('div');
                imagesDiv.className = 'content-section';
                
                singleImages.forEach(image => {
                    const img = document.createElement('img');
                    img.src = image.url || image.data; // Support both GitHub URLs and legacy base64
                    img.alt = image.name || 'Image';
                    imagesDiv.appendChild(img);
                });
                
                container.appendChild(imagesDiv);
            }
            
            // Two column images
            if (twoColumnImages.length > 0) {
                const imagesDiv = document.createElement('div');
                imagesDiv.className = 'content-section';
                
                const twoColumnGrid = document.createElement('div');
                twoColumnGrid.className = 'two-column-grid';
                
                twoColumnImages.forEach(image => {
                    const img = document.createElement('img');
                    img.src = image.url || image.data; // Support both GitHub URLs and legacy base64
                    img.alt = image.name || 'Image';
                    twoColumnGrid.appendChild(img);
                });
                
                imagesDiv.appendChild(twoColumnGrid);
                container.appendChild(imagesDiv);
            }
        }
        
        // Load videos
        if (projectVideos && projectVideos.length > 0) {
            // Sort videos by order
            const sortedVideos = projectVideos.sort((a, b) => (a.order || 0) - (b.order || 0));
            const videosDiv = document.createElement('div');
            videosDiv.className = 'content-section';
            
            sortedVideos.forEach(video => {
                const videoEl = document.createElement('video');
                videoEl.src = video.url || video.data; // Support both GitHub URLs and legacy base64
                videoEl.controls = true;
                videoEl.style.width = '100%';
                videosDiv.appendChild(videoEl);
            });
            
            container.appendChild(videosDiv);
        }
    } catch (error) {
        console.error('Error loading project:', error);
        const container = document.getElementById('contentContainer');
        if (container) {
            container.innerHTML = '<p>Error loading project: ' + error.message + '</p>';
        }
    }
}

async function setupNavigation(currentProjectId, projects) {
    try {
        const sortedProjects = projects.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const currentIndex = sortedProjects.findIndex(p => p.id === currentProjectId);
        
        const nav = document.getElementById('projectNavigation');
        if (!nav) return;
        
        if (sortedProjects.length <= 1) {
            // Only show Home if there's only one project
            nav.style.display = 'flex';
            const prevLink = document.getElementById('prevProject');
            const nextLink = document.getElementById('nextProject');
            if (prevLink) prevLink.style.display = 'none';
            if (nextLink) nextLink.style.display = 'none';
            return;
        }
        
        nav.style.display = 'flex';
        
        // Previous project
        const prevLink = document.getElementById('prevProject');
        if (prevLink) {
            if (currentIndex > 0) {
                const prevProject = sortedProjects[currentIndex - 1];
                prevLink.href = `project.html?id=${prevProject.id}`;
                prevLink.style.display = 'block';
            } else {
                // Loop to last project
                const prevProject = sortedProjects[sortedProjects.length - 1];
                prevLink.href = `project.html?id=${prevProject.id}`;
                prevLink.style.display = 'block';
            }
        }
        
        // Next project
        const nextLink = document.getElementById('nextProject');
        if (nextLink) {
            if (currentIndex < sortedProjects.length - 1) {
                const nextProject = sortedProjects[currentIndex + 1];
                nextLink.href = `project.html?id=${nextProject.id}`;
                nextLink.style.display = 'block';
            } else {
                // Loop to first project
                const nextProject = sortedProjects[0];
                nextLink.href = `project.html?id=${nextProject.id}`;
                nextLink.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error setting up navigation:', error);
    }
}

// Load project on page load
document.addEventListener('DOMContentLoaded', loadProject);

