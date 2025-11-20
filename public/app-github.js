// Portfolio page that loads content from GitHub

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
            const container = document.getElementById('contentContainer');
            if (container) {
                container.innerHTML = '<p style="opacity: 0.6;">Portfolio not configured. Please set up GitHub in the admin panel.</p>';
            }
            return;
        }
        
        // Load content.json from GitHub
        const branch = config.branch || 'main';
        const response = await fetch(
            `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/content.json`
        );
        
        if (!response.ok) {
            if (response.status === 404) {
                const container = document.getElementById('contentContainer');
                if (container) {
                    container.innerHTML = '<p style="opacity: 0.6;">No content yet. Add projects in the admin panel.</p>';
                }
                return;
            }
            throw new Error('Failed to load content');
        }
        
        const data = await response.json();
        
        const container = document.getElementById('contentContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Load projects
        const projects = (data.projects || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        
        if (projects.length > 0) {
            const projectsList = document.createElement('div');
            projectsList.className = 'projects-list';
            projectsList.style.opacity = '0'; // Start hidden for fade-in
            
            projects.forEach(project => {
                const projectLink = document.createElement('a');
                projectLink.href = `project.html?id=${project.id}`;
                projectLink.className = 'project-link';
                projectLink.innerHTML = `<span class="project-title">${project.name || 'Untitled Project'}</span>`;
                projectsList.appendChild(projectLink);
            });
            
            container.appendChild(projectsList);
            
            // Store reference for fade-in later
            window.projectsListElement = projectsList;
        }
        
        // Load images for carousel
        const allImages = data.images || [];
        if (allImages.length > 0) {
            await loadImageCarousel(allImages);
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
        const container = document.getElementById('contentContainer');
        if (container) {
            container.innerHTML = '<p style="opacity: 0.6;">Error loading portfolio content.</p>';
        }
    }
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
    carousel.style.opacity = '0'; // Start hidden for fade-in
    carousel.innerHTML = '';
    
    // Create image elements and find max height
    let loadedCount = 0;
    let maxHeight = 0;
    const imageElements = [];
    let firstImageLoaded = false;
    
    const updateCarouselHeight = () => {
        if (loadedCount === images.length) {
            // All images loaded, set carousel height to max + padding
            carousel.style.height = (maxHeight + 50) + 'px';
            
            // Fade in first image and projects list
            if (!firstImageLoaded) {
                firstImageLoaded = true;
                carousel.style.transition = 'opacity 0.6s ease-in';
                carousel.style.opacity = '1';
                
                // Fade in projects list at the same time
                if (window.projectsListElement) {
                    window.projectsListElement.style.transition = 'opacity 0.6s ease-in';
                    window.projectsListElement.style.opacity = '1';
                }
            }
            
            // Start carousel rotation after fade-in completes
            setTimeout(() => {
                startCarousel(images.length);
            }, 600); // Wait for fade-in to complete
        }
    };
    
    images.forEach((image, index) => {
        // Create link wrapper
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
        
        // Load image to get natural dimensions
        img.onload = function() {
            // Calculate height based on width constraint (max-width: 1200px)
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
        imageElements.push(link);
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
    
    // Rotate images every 0.8 seconds
    carouselInterval = setInterval(() => {
        const links = document.querySelectorAll('.carousel-link');
        if (links.length === 0) return;
        
        // Hide current image and link
        links[currentImageIndex].classList.remove('active');
        const currentImg = links[currentImageIndex].querySelector('.carousel-image');
        if (currentImg) {
            currentImg.classList.remove('active');
        }
        
        // Move to next image
        currentImageIndex = (currentImageIndex + 1) % links.length;
        
        // Show next image and link
        links[currentImageIndex].classList.add('active');
        const nextImg = links[currentImageIndex].querySelector('.carousel-image');
        if (nextImg) {
            nextImg.classList.add('active');
        }
    }, 800);
}

// Animate bio text word by word
function animateBioText() {
    return new Promise((resolve) => {
        const bioElement = document.querySelector('.header-bio');
        if (!bioElement) {
            resolve();
            return;
        }
        
        // Get the original HTML content (including <br> tags)
        const originalHTML = bioElement.innerHTML;
        
        // Split by <br> tags to preserve line breaks
        const parts = originalHTML.split(/<br\s*\/?>/i);
        
        // Clear the element
        bioElement.innerHTML = '';
        
        // Collect all words across all paragraphs first
        const allWords = [];
        
        parts.forEach((part, partIndex) => {
            // Split each part into words (including spaces and punctuation)
            const words = part.split(/(\s+)/);
            
            words.forEach((word, wordIndex) => {
                if (word.trim() === '' && word !== '') {
                    // Preserve spaces
                    allWords.push({ type: 'space', content: word });
                } else if (word.trim() !== '') {
                    // Word to animate
                    allWords.push({ type: 'word', content: word, partIndex: partIndex });
                }
            });
            
            // Add line break after each part (except the last)
            if (partIndex < parts.length - 1) {
                allWords.push({ type: 'break' });
            }
        });
        
        // Count total words for timing
        const totalWords = allWords.filter(item => item.type === 'word').length;
        
        // Now render all words sequentially
        let globalWordIndex = 0;
        allWords.forEach((item, index) => {
            if (item.type === 'space') {
                bioElement.appendChild(document.createTextNode(item.content));
            } else if (item.type === 'break') {
                bioElement.appendChild(document.createElement('br'));
            } else if (item.type === 'word') {
                // Wrap word in span
                const span = document.createElement('span');
                span.className = 'bio-word';
                span.textContent = item.content;
                span.style.opacity = '0';
                bioElement.appendChild(span);
                
                // Animate with delay - sequential across all paragraphs
                setTimeout(() => {
                    span.style.transition = 'opacity 0.3s ease-in';
                    span.style.opacity = '1';
                }, globalWordIndex * 15); // 15ms delay per word (doubled speed)
                
                globalWordIndex++;
            }
        });
        
        // Calculate when animation completes: last word delay + transition duration
        const lastWordDelay = (totalWords - 1) * 15;
        const transitionDuration = 300; // 0.3s in milliseconds
        const totalAnimationTime = lastWordDelay + transitionDuration;
        
        // Resolve promise after animation completes
        setTimeout(() => {
            resolve();
        }, totalAnimationTime);
    });
}

// Load content on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadContent();
    // Start carousel after text animation completes
    await animateBioText();
});

// Also load when page becomes visible (in case admin updated it)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadContent();
    }
});

