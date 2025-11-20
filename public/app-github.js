// Portfolio page that loads content from GitHub with new pillar structure

const GITHUB_CONFIG_KEY = 'githubConfig';

function getGitHubConfig() {
    const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return null;
}

async function loadContent() {
    try {
        const config = getGitHubConfig();
        if (!config) {
            console.error('GitHub not configured');
            return;
        }
        
        // Load content.json from GitHub
        const branch = config.branch || 'main';
        const response = await fetch(
            `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/content.json`
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                return; // No content yet
            }
            throw new Error('Failed to load content');
        }
        
        const data = await response.json();
        
        // Load projects into pillars
        loadProjectsIntoPillars(data.projects || []);
        
        // Load images for carousel (if needed)
        const allImages = data.images || [];
        if (allImages.length > 0) {
            // Optionally load carousel - can be hidden for new design
            // await loadImageCarousel(allImages);
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

function loadProjectsIntoPillars(projects) {
    // Group projects by pillar
    const commercialProjects = projects.filter(p => p.pillar === 'commercial' || !p.pillar);
    const symbolicProjects = projects.filter(p => p.pillar === 'symbolic');
    const futureProjects = projects.filter(p => p.pillar === 'future');
    
    // Sort each group by order
    const sortByOrder = (a, b) => (a.order || 0) - (b.order || 0);
    commercialProjects.sort(sortByOrder);
    symbolicProjects.sort(sortByOrder);
    futureProjects.sort(sortByOrder);
    
    // Load into respective pillar containers
    loadPillarProjects('commercial', commercialProjects);
    loadPillarProjects('symbolic', symbolicProjects);
    loadPillarProjects('future', futureProjects);
}

function loadPillarProjects(pillarType, projects) {
    const container = document.querySelector(`.pillar-projects[data-pillar="${pillarType}"]`);
    if (!container) return;
    
    if (projects.length === 0) {
        container.innerHTML = '<p class="placeholder-text">No projects yet</p>';
        return;
    }
    
    container.innerHTML = '';
    
    projects.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'pillar-project';
        
        const projectLink = document.createElement('a');
        projectLink.href = `project.html?id=${project.id}`;
        projectLink.className = 'pillar-project-link';
        
        const title = document.createElement('div');
        title.className = 'pillar-project-title';
        title.textContent = project.name || 'Untitled Project';
        
        const meta = document.createElement('div');
        meta.className = 'pillar-project-meta';
        if (project.role) {
            meta.textContent = project.role;
        } else if (project.description) {
            meta.textContent = project.description.substring(0, 100) + (project.description.length > 100 ? '...' : '');
        }
        
        projectLink.appendChild(title);
        if (meta.textContent) {
            projectLink.appendChild(meta);
        }
        
        projectDiv.appendChild(projectLink);
        container.appendChild(projectDiv);
    });
}

async function loadImageCarousel(images) {
    const carousel = document.getElementById('imageCarousel');
    if (!carousel) return;
    
    if (images.length === 0) {
        carousel.style.display = 'none';
        return;
    }
    
    // Stop existing carousel
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
    currentImageIndex = 0;
    
    carousel.style.display = 'block';
    carousel.style.opacity = '0';
    carousel.innerHTML = '';
    
    let loadedCount = 0;
    let maxHeight = 0;
    let firstImageLoaded = false;
    
    const updateCarouselHeight = () => {
        if (loadedCount === images.length) {
            carousel.style.height = (maxHeight + 50) + 'px';
            
            if (!firstImageLoaded) {
                firstImageLoaded = true;
                carousel.style.transition = 'opacity 0.6s ease-in';
                carousel.style.opacity = '1';
            }
            
            setTimeout(() => {
                startCarousel(images.length);
            }, 600);
        }
    };
    
    images.forEach((image, index) => {
        const link = document.createElement('a');
        link.href = image.projectId ? `project.html?id=${image.projectId}` : '#';
        link.className = 'carousel-link';
        link.style.display = 'block';
        link.style.width = '100%';
        link.style.maxWidth = '1200px';
        
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.name || 'Image';
        img.className = 'carousel-image';
        if (index === 0) {
            img.classList.add('active');
            link.classList.add('active');
        }
        
        img.onload = function() {
            const maxWidth = 1200;
            const aspectRatio = this.naturalWidth / this.naturalHeight;
            const displayHeight = Math.min(this.naturalHeight, maxWidth / aspectRatio);
            
            if (displayHeight > maxHeight) {
                maxHeight = displayHeight;
            }
            
            loadedCount++;
            updateCarouselHeight();
        };
        
        img.onerror = function() {
            loadedCount++;
            updateCarouselHeight();
        };
        
        link.appendChild(img);
        carousel.appendChild(link);
    });
}

let carouselInterval = null;
let currentImageIndex = 0;

function startCarousel(totalImages) {
    if (totalImages === 0) return;
    
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    
    carouselInterval = setInterval(() => {
        const links = document.querySelectorAll('.carousel-link');
        if (links.length === 0) return;
        
        links[currentImageIndex].classList.remove('active');
        const currentImg = links[currentImageIndex].querySelector('.carousel-image');
        if (currentImg) currentImg.classList.remove('active');
        
        currentImageIndex = (currentImageIndex + 1) % links.length;
        
        links[currentImageIndex].classList.add('active');
        const nextImg = links[currentImageIndex].querySelector('.carousel-image');
        if (nextImg) nextImg.classList.add('active');
    }, 800);
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Load content
    loadContent();
});

// Also load when page becomes visible (in case admin updated it)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadContent();
    }
});
