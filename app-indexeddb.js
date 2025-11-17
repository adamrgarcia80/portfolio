// Portfolio page using IndexedDB for large file support
// Shows list of projects on index page

async function loadBioText() {
    try {
        const settings = await getSiteSettings();
        const bioElement = document.querySelector('.header-bio');
        if (bioElement && settings.bioText) {
            bioElement.innerHTML = settings.bioText;
        }
    } catch (error) {
        console.error('Error loading bio text:', error);
    }
}

async function loadFooterLinks() {
    try {
        const settings = await getSiteSettings();
        const footerLinksDiv = document.getElementById('footerLinks');
        if (!footerLinksDiv) return;
        
        const links = settings.footerLinks || [];
        if (links.length === 0) {
            footerLinksDiv.innerHTML = '';
            return;
        }
        
        const linksHTML = links.map((link, index) => {
            return `<a href="${link.url}" target="_blank" class="footer-link">${link.text}</a>${index < links.length - 1 ? ' / ' : ''}`;
        }).join('');
        
        footerLinksDiv.innerHTML = linksHTML;
    } catch (error) {
        console.error('Error loading footer links:', error);
    }
}

async function loadContent() {
    try {
        await initDB();
        await initializeDefaults();
        
        // Load bio text and footer links
        await loadBioText();
        await loadFooterLinks();
        
        // Don't start carousel yet - wait for text animation
        // Carousel will be started after text animation completes
        
        const container = document.getElementById('contentContainer');
        if (!container) {
            console.error('contentContainer not found');
            return;
        }
        
        // Load projects list
        const projects = await getProjects();
        console.log('Projects loaded:', projects);
        
        const sortedProjects = projects.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        container.innerHTML = '';
        
        if (sortedProjects.length === 0) {
            console.log('No projects found');
            return;
        }
        
        // Create projects list
        const projectsList = document.createElement('p');
        projectsList.className = 'projects-list';
        projectsList.style.opacity = '0'; // Start hidden for fade-in
        
        sortedProjects.forEach((project, index) => {
            const projectLink = document.createElement('a');
            projectLink.href = `project.html?id=${project.id}`;
            projectLink.className = 'project-link';
            projectLink.textContent = project.name || 'Untitled Project';
            projectsList.appendChild(projectLink);
            
            // Add slash separator (except after last item)
            if (index < sortedProjects.length - 1) {
                const separator = document.createTextNode(' / ');
                projectsList.appendChild(separator);
            }
        });
        
        container.appendChild(projectsList);
        
        // Store reference for fade-in later
        window.projectsListElement = projectsList;
    } catch (error) {
        console.error('Error loading content:', error);
        const container = document.getElementById('contentContainer');
        if (container) {
            container.innerHTML = '<p>Error loading projects: ' + error.message + '</p>';
        }
    }
}

async function loadImageCarousel() {
    try {
        const carousel = document.getElementById('imageCarousel');
        if (!carousel) return;
        
        // Stop existing carousel
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
        currentImageIndex = 0;
        
        // Get all images from all projects
        const allImages = await getImages();
        
        if (!allImages || allImages.length === 0) {
            carousel.style.display = 'none';
            return;
        }
        
        carousel.style.display = 'block';
        carousel.style.opacity = '0'; // Start hidden for fade-in
        carousel.innerHTML = '';
        
        // Create image elements and find max height
        let loadedCount = 0;
        let maxHeight = 0;
        const imageElements = [];
        let firstImageLoaded = false;
        
        const updateCarouselHeight = () => {
            if (loadedCount === allImages.length) {
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
                    startCarousel(allImages.length);
                }, 600); // Wait for fade-in to complete
            }
        };
        
        allImages.forEach((image, index) => {
            // Create link wrapper
            const link = document.createElement('a');
            link.href = image.projectId ? `project.html?id=${image.projectId}` : '#';
            link.className = 'carousel-link';
            link.style.display = 'block';
            link.style.width = '100%';
            link.style.maxWidth = '1200px';
            
            const img = document.createElement('img');
            img.src = image.data;
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
    } catch (error) {
        console.error('Error loading image carousel:', error);
    }
}

let carouselInterval = null;
let currentImageIndex = 0;

function startCarousel(totalImages) {
    if (totalImages === 0) return;
    
    // Clear any existing interval
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

// Make this available globally for admin panel
window.updatePortfolioContent = async () => {
    await loadContent();
    await loadBioText();
    await loadFooterLinks();
};

// Also update carousel when content changes
window.updateImageCarousel = loadImageCarousel;

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
    await loadImageCarousel();
});

// Also load when page becomes visible (in case admin updated it)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadContent();
    }
});
