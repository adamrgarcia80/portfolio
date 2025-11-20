// Portfolio page that loads content from GitHub with new pillar structure

const GITHUB_CONFIG_KEY = 'githubConfig';

// Symbolic Systems Body Copy
const SYMBOLIC_SYSTEMS_BODY = 'Works exploring how design, storytelling, and speculative futures can reframe meaning in a world where creativity must evolve beyond traditional models. These projects investigate emergent symbolic systems, myth-making in digital spaces, and the role of narrative in shaping collective understanding.';

// Commercial Projects Body Copy
const COMMERCIAL_PROJECTS_BODY = 'Design work, creative direction, music and cultural projects for clients and collaborators. Selected commercial and cultural projects spanning brand identity, digital experiences, and creative strategy.';

// Symbolic Systems Projects with sample copy and images
const SYMBOLIC_PROJECTS = [
    {
        id: 'symbolic-1',
        title: 'mutant.systems',
        caption: 'A workshop and lecture series examining systems thinking, purpose-driven design, and decentralized organizational structures. Explores how alternative frameworks can reshape creative practice and cultural production.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPm11dGFudC5zeXN0ZW1zPC90ZXh0Pjwvc3ZnPg=='
    },
    {
        id: 'symbolic-2',
        title: 'mythseed.world',
        caption: 'An online and offline environment for evolving symbolic myth systems. A collaborative platform where participants contribute to and transform shared narratives, creating emergent meaning through collective participation.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPm15dGhzZWVkLndvcmxkPC90ZXh0Pjwvc3ZnPg=='
    },
    {
        id: 'symbolic-3',
        title: 'Lore Core',
        caption: 'Research and generative framework around emergent cults and religions in post-apocalyptic fictions. Investigates how narrative structures create belief systems and how fictional cosmologies mirror real-world symbolic practices.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvcmUgQ29yZTwvdGV4dD48L3N2Zz4='
    },
    {
        id: 'symbolic-4',
        title: 'Supplication',
        caption: 'An interactive installation exploring ritual, devotion, and digital prayer. Examines how ancient forms of supplication translate into contemporary networked spaces and what it means to make offerings in a dematerialized world.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlN1cHBsaWNhdGlvbjwvdGV4dD48L3N2Zz4='
    },
    {
        id: 'symbolic-5',
        title: 'Public Dreams',
        caption: 'A series of collective dreaming experiments conducted in public spaces. Participants share and remix dream narratives, creating a shared unconscious that reflects collective anxieties, desires, and symbolic language.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlB1YmxpYyBEcmVhbXM8L3RleHQ+PC9zdmc+'
    },
    {
        id: 'symbolic-6',
        title: 'Echo Chamber',
        caption: 'An investigation into how symbolic systems reinforce themselves through repetition and resonance. Explores the architecture of belief, the mechanics of consensus, and how meaning becomes fixed through recursive patterns.',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4zKSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVjaG8gQ2hhbWJlcjwvdGV4dD48L3N2Zz4='
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
    console.log('loadContent called');
    // Always load projects, regardless of GitHub config
    loadSymbolicProjects();
    loadCommercialProjectsBody();
    initCommercialCarousel();
    
    try {
        const config = getGitHubConfig();
        if (!config) {
            console.error('GitHub not configured');
            // Animate text even without GitHub
            if (!window.textAnimated) {
                setTimeout(() => {
                    animateAllText();
                    window.textAnimated = true;
                }, 100);
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
                // Animate text even if no content.json
                if (!window.textAnimated) {
                    setTimeout(() => {
                        animateAllText();
                        window.textAnimated = true;
                    }, 100);
                }
                return; // No content yet
            }
            throw new Error('Failed to load content');
        }
        
        const data = await response.json();
        
        // Animate all text after content loads (only on initial load)
        if (!window.textAnimated) {
            setTimeout(() => {
                animateAllText();
                window.textAnimated = true;
            }, 100);
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
        // Animate text even if GitHub fails
        if (!window.textAnimated) {
            setTimeout(() => {
                animateAllText();
                window.textAnimated = true;
            }, 100);
        }
    }
}

// Load Symbolic Systems Projects
// Note: Projects are now hardcoded in HTML as fallback
// This function can be used to update them dynamically if needed
function loadSymbolicProjects() {
    // Projects are already in HTML, so we just ensure body copy is there
    const bodyContainer = document.getElementById('symbolicSystemsBody');
    if (bodyContainer && !bodyContainer.querySelector('p')) {
        const bodyParagraph = document.createElement('p');
        bodyParagraph.textContent = SYMBOLIC_SYSTEMS_BODY;
        bodyContainer.appendChild(bodyParagraph);
    }
    
    // If container is empty (shouldn't happen now), load from JS
    const container = document.getElementById('symbolicProjects');
    if (container && container.children.length === 0 && SYMBOLIC_PROJECTS && SYMBOLIC_PROJECTS.length > 0) {
        SYMBOLIC_PROJECTS.forEach((project) => {
            const projectDiv = document.createElement('div');
            projectDiv.className = 'symbolic-project';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'symbolic-project-title';
            const titleLink = document.createElement('a');
            titleLink.href = `project.html?id=${project.id}`;
            titleLink.textContent = project.title;
            titleDiv.appendChild(titleLink);
            
            const captionDiv = document.createElement('div');
            captionDiv.className = 'symbolic-project-caption';
            captionDiv.textContent = project.caption;
            
            const imageDiv = document.createElement('div');
            imageDiv.className = 'symbolic-project-image';
            if (project.image) {
                const imageLink = document.createElement('a');
                imageLink.href = `project.html?id=${project.id}`;
                const img = document.createElement('img');
                img.src = project.image;
                img.alt = project.title;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                imageLink.appendChild(img);
                imageDiv.appendChild(imageLink);
            }
            
            projectDiv.appendChild(titleDiv);
            projectDiv.appendChild(captionDiv);
            projectDiv.appendChild(imageDiv);
            
            container.appendChild(projectDiv);
        });
    }
}

// Load Commercial Projects Body Copy
function loadCommercialProjectsBody() {
    const bodyContainer = document.getElementById('commercialProjectsBody');
    if (bodyContainer) {
        bodyContainer.innerHTML = '';
        const bodyParagraph = document.createElement('p');
        bodyParagraph.textContent = COMMERCIAL_PROJECTS_BODY;
        bodyContainer.appendChild(bodyParagraph);
    }
}

// Initialize Commercial Carousel
function initCommercialCarousel() {
    const carouselContainer = document.querySelector('.carousel-image-placeholder');
    
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
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, .pillar-title, .pillar-description, .brand-node, .pillar-project-title, .pillar-project-meta, .essay-title, .essay-excerpt, .contact-content, .practice-text, .section-label, .nav-logo, .subsection-title, .subsection-body p, .symbolic-project-title, .symbolic-project-caption');
    
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
        console.error('Mobile menu elements not found!', { 
            toggle: !!toggle, 
            links: !!links,
            toggleId: document.getElementById('navToggle'),
            linksId: document.getElementById('navLinks')
        });
        return;
    }
    
    // Remove any existing listeners by cloning
    const newToggle = toggle.cloneNode(true);
    toggle.parentNode.replaceChild(newToggle, toggle);
    const newLinks = links;
    
    console.log('Initializing mobile menu - elements found');
    
    // Simple toggle function
    function toggleMenu() {
        const isActive = newLinks.classList.contains('active');
        console.log('Toggling menu, currently active:', isActive);
        if (isActive) {
            newLinks.classList.remove('active');
            newToggle.classList.remove('active');
            console.log('Menu closed');
        } else {
            newLinks.classList.add('active');
            newToggle.classList.add('active');
            console.log('Menu opened, classes:', newLinks.className);
        }
    }
    
    // Direct inline handler for maximum reliability
    newToggle.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button onclick fired');
        toggleMenu();
        return false;
    };
    
    // Also add event listener as backup
    newToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Button addEventListener fired');
        toggleMenu();
    }, true); // Use capture phase
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function(e) {
            if (newLinks.classList.contains('active')) {
                const clickedInside = newLinks.contains(e.target);
                const clickedButton = newToggle.contains(e.target);
                if (!clickedInside && !clickedButton) {
                    newLinks.classList.remove('active');
                    newToggle.classList.remove('active');
                    console.log('Menu closed - clicked outside');
                }
            }
        }, true);
    }, 200);
    
    // Close menu when clicking a link
    const menuLinks = newLinks.querySelectorAll('a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            newLinks.classList.remove('active');
            newToggle.classList.remove('active');
            console.log('Menu closed - link clicked');
        });
    });
    
    console.log('Mobile menu initialized successfully');
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
    // Initialize mobile menu - do it immediately and also with a delay
    initMobileMenu();
    
    // Also try initializing after a short delay in case DOM isn't ready
    setTimeout(() => {
        initMobileMenu();
    }, 100);
    
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
    
    // Load projects immediately - don't wait for GitHub
    // Use requestAnimationFrame to ensure DOM is fully ready
    requestAnimationFrame(() => {
        loadSymbolicProjects();
        loadCommercialProjectsBody();
        initCommercialCarousel();
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

// Fallback: also try loading when window fully loads
window.addEventListener('load', () => {
    console.log('Window loaded, checking if projects are visible');
    const container = document.getElementById('symbolicProjects');
    if (container && container.children.length === 0) {
        console.log('Projects not loaded, loading now...');
        loadSymbolicProjects();
    }
});

// Immediate check if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('DOM already ready, loading projects immediately');
    setTimeout(() => {
        loadSymbolicProjects();
        loadCommercialProjectsBody();
        initCommercialCarousel();
    }, 100);
}
