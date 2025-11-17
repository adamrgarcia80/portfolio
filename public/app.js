// Main portfolio page JavaScript

const API_URL = '/api/content';

async function loadContent() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        const container = document.getElementById('contentContainer');
        container.innerHTML = '';
        
        // Load sections
        const sortedSections = data.sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        
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
                img.src = image.path;
                img.alt = image.originalName || 'Image';
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
                videoEl.src = video.path;
                videoEl.controls = true;
                videoEl.style.width = '100%';
                videosDiv.appendChild(videoEl);
            });
            
            container.appendChild(videosDiv);
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Load content on page load
document.addEventListener('DOMContentLoaded', loadContent);

