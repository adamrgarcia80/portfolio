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
        
        // Animate all text after content loads (only on initial load)
        if (!window.textAnimated) {
            setTimeout(() => {
                animateAllText();
                window.textAnimated = true;
            }, 100);
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

// Animate all text word-by-word from top-left to bottom-right on initial load
function animateAllText() {
    // Get all text-containing elements (excluding menu and already animated)
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, .pillar-title, .pillar-description, .brand-node, .pillar-project-title, .pillar-project-meta, .essay-title, .essay-excerpt, .contact-content, .practice-text, .section-label, .nav-logo');
    
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

// Portal removed - no initialization needed

// Mobile menu toggle
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    
    if (toggle && links) {
        const toggleDrawer = () => {
            const isActive = links.classList.toggle('active');
            toggle.classList.toggle('active', isActive);
            document.body.classList.toggle('drawer-open', isActive);
        };

        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleDrawer();
        });

        document.addEventListener('click', (event) => {
            if (!links.contains(event.target) && !toggle.contains(event.target)) {
                links.classList.remove('active');
                toggle.classList.remove('active');
                document.body.classList.remove('drawer-open');
            }
        });
        
        // Close menu when clicking a link
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                links.classList.remove('active');
                toggle.classList.remove('active');
                document.body.classList.remove('drawer-open');
            });
        });
    }
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
