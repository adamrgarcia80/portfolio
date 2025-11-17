// Simple portfolio page that works without a server
// Uses localStorage to load content

function loadContent() {
    const data = getStoredData();
    const container = document.getElementById('contentContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Load sections
    const sortedSections = (data.sections || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    
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
        
        // Handle line breaks
        const lines = section.content.split('\n');
        if (style === 'link') {
            textElement.textContent = section.content;
            textElement.style.cursor = 'pointer';
        } else {
            lines.forEach((line, index) => {
                if (line.trim()) {
                    const p = document.createElement('p');
                    p.textContent = line;
                    textElement.appendChild(p);
                }
            });
        }
        
        sectionDiv.appendChild(textElement);
        container.appendChild(sectionDiv);
    });
    
    // Load images
    if (data.images && data.images.length > 0) {
        const imagesDiv = document.createElement('div');
        imagesDiv.className = 'content-section';
        
        const imagesGrid = document.createElement('div');
        imagesGrid.className = 'media-grid';
        
        data.images.forEach(image => {
            const img = document.createElement('img');
            img.src = image.data;
            img.alt = image.name || 'Image';
            imagesGrid.appendChild(img);
        });
        
        imagesDiv.appendChild(imagesGrid);
        container.appendChild(imagesDiv);
    }
    
    // Load videos
    if (data.videos && data.videos.length > 0) {
        const videosDiv = document.createElement('div');
        videosDiv.className = 'content-section';
        
        data.videos.forEach(video => {
            const videoEl = document.createElement('video');
            videoEl.src = video.data;
            videoEl.controls = true;
            videoEl.style.width = '100%';
            videosDiv.appendChild(videoEl);
        });
        
        container.appendChild(videosDiv);
    }
}

function getStoredData() {
    try {
        const stored = localStorage.getItem('portfolioContent');
        if (stored) {
            return JSON.parse(stored);
        } else {
            // Initialize with default content
            const defaultData = {
                sections: [
                    {
                        id: "1",
                        content: "Lorem Ipsum",
                        style: "header",
                        order: 0
                    },
                    {
                        id: "2",
                        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                        style: "body-regular",
                        order: 1
                    },
                    {
                        id: "3",
                        content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                        style: "body-bold",
                        order: 2
                    }
                ],
                images: [],
                videos: []
            };
            localStorage.setItem('portfolioContent', JSON.stringify(defaultData));
            return defaultData;
        }
    } catch (error) {
        return { sections: [], images: [], videos: [] };
    }
}

// Make this available globally for admin panel
window.updatePortfolioContent = loadContent;

// Load content on page load
document.addEventListener('DOMContentLoaded', loadContent);

// Also load when page becomes visible (in case admin updated it)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadContent();
    }
});

