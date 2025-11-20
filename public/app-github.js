// Portfolio page that loads content from GitHub with new pillar structure

const GITHUB_CONFIG_KEY = 'githubConfig';

// Symbolic Systems Projects (lorem ipsum placeholder data)
const SYMBOLIC_PROJECTS = [
    {
        id: 'symbolic-1',
        title: 'Mythic Architectures',
        caption: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.'
    },
    {
        id: 'symbolic-2',
        title: 'Ritual Networks',
        caption: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'
    },
    {
        id: 'symbolic-3',
        title: 'Sacred Algorithms',
        caption: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.'
    },
    {
        id: 'symbolic-4',
        title: 'Divine Interfaces',
        caption: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.'
    },
    {
        id: 'symbolic-5',
        title: 'Transcendent Systems',
        caption: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.'
    },
    {
        id: 'symbolic-6',
        title: 'Eternal Structures',
        caption: 'Ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.'
    }
];

// Commercial Projects Carousel Images (placeholder)
const COMMERCIAL_IMAGES = [
    { src: '', alt: 'Commercial Project 1' },
    { src: '', alt: 'Commercial Project 2' },
    { src: '', alt: 'Commercial Project 3' },
    { src: '', alt: 'Commercial Project 4' }
];

let currentCommercialImageIndex = 0;

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
        
        // Load symbolic projects
        loadSymbolicProjects();
        
        // Initialize commercial carousel
        initCommercialCarousel();
        
        // Animate all text after content loads (only on initial load)
        if (!window.textAnimated) {
            setTimeout(() => {
                animateAllText();
                window.textAnimated = true;
            }, 100);
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
        // Still load projects even if GitHub fails
        loadSymbolicProjects();
        initCommercialCarousel();
    }
}

// Load Symbolic Systems Projects
function loadSymbolicProjects() {
    const container = document.getElementById('symbolicProjects');
    if (!container) return;
    
    container.innerHTML = '';
    
    SYMBOLIC_PROJECTS.forEach(project => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'symbolic-project';
        
        // Image placeholder
        const imageDiv = document.createElement('div');
        imageDiv.className = 'symbolic-project-image';
        imageDiv.textContent = 'Image';
        
        // Title with link
        const titleDiv = document.createElement('div');
        titleDiv.className = 'symbolic-project-title';
        const titleLink = document.createElement('a');
        titleLink.href = `project.html?id=${project.id}`;
        titleLink.textContent = project.title;
        titleDiv.appendChild(titleLink);
        
        // Caption
        const captionDiv = document.createElement('div');
        captionDiv.className = 'symbolic-project-caption';
        captionDiv.textContent = project.caption;
        
        projectDiv.appendChild(imageDiv);
        projectDiv.appendChild(titleDiv);
        projectDiv.appendChild(captionDiv);
        
        container.appendChild(projectDiv);
    });
}

// Initialize Commercial Carousel
function initCommercialCarousel() {
    const carouselContainer = document.querySelector('.carousel-image-placeholder');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    if (!carouselContainer) return;
    
    // Create image elements for carousel
    COMMERCIAL_IMAGES.forEach((img, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = img.src || '';
        imgElement.alt = img.alt;
        imgElement.style.display = 'none';
        if (index === 0) {
            imgElement.classList.add('active');
            imgElement.style.display = 'block';
        }
        carouselContainer.appendChild(imgElement);
    });
    
    // If no images, show placeholder
    if (COMMERCIAL_IMAGES.length === 0 || !COMMERCIAL_IMAGES[0].src) {
        carouselContainer.textContent = 'Image';
    }
    
    function showImage(index) {
        const images = carouselContainer.querySelectorAll('img');
        images.forEach((img, i) => {
            if (i === index) {
                img.classList.add('active');
                img.style.display = 'block';
            } else {
                img.classList.remove('active');
                img.style.display = 'none';
            }
        });
        
        // If no actual images, keep placeholder text
        if (images.length === 0 || !images[index]?.src) {
            carouselContainer.textContent = 'Image';
        }
    }
    
    function nextImage() {
        currentCommercialImageIndex = (currentCommercialImageIndex + 1) % COMMERCIAL_IMAGES.length;
        showImage(currentCommercialImageIndex);
    }
    
    function prevImage() {
        currentCommercialImageIndex = (currentCommercialImageIndex - 1 + COMMERCIAL_IMAGES.length) % COMMERCIAL_IMAGES.length;
        showImage(currentCommercialImageIndex);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevImage();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextImage();
        });
    }
    
    // Auto-advance carousel every 5 seconds
    setInterval(nextImage, 5000);
}

// Commercial Password Handler
function initCommercialPassword() {
    const passwordInput = document.getElementById('commercialPassword');
    const passwordBtn = document.getElementById('commercialPasswordBtn');
    
    if (!passwordInput || !passwordBtn) return;
    
    function handlePassword() {
        const password = passwordInput.value;
        // For now, any password works - you can change this
        if (password.trim() !== '') {
            window.location.href = 'commercial.html';
        }
    }
    
    passwordBtn.addEventListener('click', handlePassword);
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePassword();
        }
    });
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

// Animate all text word-by-word from top-left to bottom-right on initial load
function animateAllText() {
    // Get all text-containing elements (excluding menu and already animated)
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, .pillar-title, .pillar-description, .brand-node, .pillar-project-title, .pillar-project-meta, .essay-title, .essay-excerpt, .contact-content, .practice-text, .section-label, .nav-logo, .subsection-title, .symbolic-project-title, .symbolic-project-caption');
    
    const allWords = [];
    
    textElements.forEach(element => {
        // Skip menu elements
        if (element.closest('.nav-links') || element.classList.contains('nav-menu-toggle') || element.querySelector('.menu-circle')) {
            return;
        }
        
        // Skip if already animated or if element is hidden
        if (element.classList.contains('animated') || element.offsetParent === null) {
            return;
        }
        
        // Get original text
        const originalText = element.textContent || element.innerText;
        if (!originalText || originalText.trim() === '') return;
        
        // Get element position
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const top = rect.top + scrollTop;
        const left = rect.left + scrollLeft;
        
        // Split text into words (preserving spaces)
        const words = originalText.split(/(\s+)/);
        let currentLeft = left;
        
        words.forEach((word, wordIndex) => {
            if (word.trim() === '' && word !== '') {
                // It's whitespace - add it but don't animate
                allWords.push({
                    type: 'space',
                    content: word,
                    element: element,
                    top: top,
                    left: currentLeft,
                    wordIndex: wordIndex
                });
                // Estimate space width (rough approximation)
                currentLeft += 5; // Average space width
            } else if (word.trim() !== '') {
                // It's a word
                allWords.push({
                    type: 'word',
                    content: word,
                    element: element,
                    top: top,
                    left: currentLeft,
                    wordIndex: wordIndex,
                    originalHTML: element.innerHTML
                });
                // Estimate word width (rough approximation: 8px per character)
                currentLeft += word.length * 8;
            }
        });
        
        // Mark element as processed
        element.classList.add('animated');
    });
    
    // Sort words by position: top to bottom, then left to right
    allWords.sort((a, b) => {
        // First by vertical position (top)
        if (Math.abs(a.top - b.top) > 20) {
            return a.top - b.top;
        }
        // Then by horizontal position (left)
        return a.left - b.left;
    });
    
    // Clear all elements and prepare for animation
    const elementGroups = new Map();
    allWords.forEach(word => {
        if (!elementGroups.has(word.element)) {
            elementGroups.set(word.element, {
                element: word.element,
                originalHTML: word.originalHTML || word.element.innerHTML,
                words: []
            });
        }
        elementGroups.get(word.element).words.push(word);
    });
    
    // Clear and prepare elements
    elementGroups.forEach(group => {
        group.element.innerHTML = '';
        group.element.style.position = 'relative';
    });
    
    // Animate words quickly
    let globalWordIndex = 0;
    allWords.forEach(word => {
        if (word.type === 'space') {
            // Add space directly
            word.element.appendChild(document.createTextNode(word.content));
        } else if (word.type === 'word') {
            // Create span for word
            const span = document.createElement('span');
            span.className = 'animated-word';
            span.textContent = word.content;
            span.style.opacity = '0';
            span.style.display = 'inline';
            word.element.appendChild(span);
            
            // Add space after word (except last word in element)
            const group = elementGroups.get(word.element);
            const isLastWord = word === group.words[group.words.length - 1];
            if (!isLastWord) {
                word.element.appendChild(document.createTextNode(' '));
            }
            
            // Animate with quick delay based on position
            setTimeout(() => {
                span.style.transition = 'opacity 0.3s ease-in';
                span.style.opacity = '1';
            }, globalWordIndex * 15); // 15ms delay per word for quick fade-in
            
            globalWordIndex++;
        }
    });
}

// Mobile menu toggle - fresh implementation
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    
    if (!toggle || !links) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    // Toggle menu on button click
    toggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isActive = links.classList.contains('active');
        links.classList.toggle('active');
        toggle.classList.toggle('active');
        console.log('Menu toggled, active:', !isActive);
    });
    
    // Close menu when clicking outside (with slight delay to avoid immediate close)
    document.addEventListener('click', (event) => {
        if (links.classList.contains('active')) {
            if (!links.contains(event.target) && !toggle.contains(event.target)) {
                links.classList.remove('active');
                toggle.classList.remove('active');
            }
        }
    });
    
    // Close menu when clicking a link
    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            links.classList.remove('active');
            toggle.classList.remove('active');
        });
    });
}

// Navigation scroll behavior (desktop only)
function initNavScroll() {
    const nav = document.querySelector('.main-nav');
    const isMobile = window.innerWidth <= 768;
    
    // Only hide/show nav on desktop
    if (isMobile) {
        return; // Keep nav always visible on mobile
    }
    
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                
                if (currentScroll > 100) {
                    // Hide nav on scroll down
                    if (currentScroll > lastScroll) {
                        nav.classList.add('scrolled');
                    } else {
                        // Show nav on scroll up
                        nav.classList.remove('scrolled');
                    }
                } else {
                    nav.classList.remove('scrolled');
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize nav scroll
    initNavScroll();
    
    // Initialize commercial password
    initCommercialPassword();
    
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
    
    // Load content and animate text
    loadContent();
    
    // Animate text on initial load
    setTimeout(() => {
        animateAllText();
    }, 200);
});

// Also load when page becomes visible (in case admin updated it)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadContent();
    }
});
