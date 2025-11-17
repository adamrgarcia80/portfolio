// Project page that loads specific project content

async function loadProject() {
    try {
        await initDB();
        
        // Get project ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            document.getElementById('contentContainer').innerHTML = '<p>Project not found.</p>';
            return;
        }
        
        // Load project
        const project = await getProject(projectId);
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
        await setupNavigation(projectId);
        
        // Load project content
        const [sections, images, videos] = await Promise.all([
            getSectionsForProject(projectId),
            getImagesForProject(projectId),
            getVideosForProject(projectId)
        ]);
        
        const container = document.getElementById('contentContainer');
        container.innerHTML = '';
        
        // Load sections
        const sortedSections = sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        
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
        if (images && images.length > 0) {
            // Sort images by order
            const sortedImages = images.sort((a, b) => (a.order || 0) - (b.order || 0));
            // Group images by layout
            const singleImages = sortedImages.filter(img => !img.layout || img.layout === 'single');
            const twoColumnImages = sortedImages.filter(img => img.layout === 'two-column');
            
            // Single column images
            if (singleImages.length > 0) {
                const imagesDiv = document.createElement('div');
                imagesDiv.className = 'content-section';
                
                singleImages.forEach(image => {
                    const img = document.createElement('img');
                    img.src = image.data;
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
                    img.src = image.data;
                    img.alt = image.name || 'Image';
                    twoColumnGrid.appendChild(img);
                });
                
                imagesDiv.appendChild(twoColumnGrid);
                container.appendChild(imagesDiv);
            }
        }
        
        // Load videos
        if (videos && videos.length > 0) {
            // Sort videos by order
            const sortedVideos = videos.sort((a, b) => (a.order || 0) - (b.order || 0));
            const videosDiv = document.createElement('div');
            videosDiv.className = 'content-section';
            
            sortedVideos.forEach(video => {
                const videoEl = document.createElement('video');
                videoEl.src = video.data;
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

async function setupNavigation(currentProjectId) {
    try {
        const allProjects = await getProjects();
        const sortedProjects = allProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const currentIndex = sortedProjects.findIndex(p => p.id === currentProjectId);
        
        const nav = document.getElementById('projectNavigation');
        if (!nav) return;
        
        if (sortedProjects.length <= 1) {
            // Only show Home if there's only one project
            nav.style.display = 'flex';
            document.getElementById('prevProject').style.display = 'none';
            document.getElementById('nextProject').style.display = 'none';
            return;
        }
        
        nav.style.display = 'flex';
        
        // Previous project
        const prevLink = document.getElementById('prevProject');
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
        
        // Next project
        const nextLink = document.getElementById('nextProject');
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
    } catch (error) {
        console.error('Error setting up navigation:', error);
    }
}

// Load project on page load
document.addEventListener('DOMContentLoaded', loadProject);

