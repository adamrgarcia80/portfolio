// GitHub Configuration
// Store these in localStorage for cross-client access

const GITHUB_CONFIG_KEY = 'githubConfig';

function getGitHubConfig() {
    const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
    return null;
}

function saveGitHubConfig(config) {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

function getGitHubHeaders() {
    const config = getGitHubConfig();
    if (!config || !config.token) {
        throw new Error('GitHub token not configured');
    }
    return {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    };
}

// GitHub API: Upload file to repo
async function uploadFileToGitHub(file, path) {
    const config = getGitHubConfig();
    if (!config) throw new Error('GitHub not configured');
    
    // Convert file to base64
    const base64Content = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remove data URL prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    
    // Get current file SHA if it exists (for updates)
    let sha = null;
    try {
        const getResponse = await fetch(
            `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
            { headers: getGitHubHeaders() }
        );
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
    } catch (e) {
        // File doesn't exist yet, that's fine
    }
    
    // Upload file
    const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
        {
            method: 'PUT',
            headers: getGitHubHeaders(),
            body: JSON.stringify({
                message: `Upload ${file.name}`,
                content: base64Content,
                sha: sha // Include SHA if updating existing file
            })
        }
    );
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }
    
    const result = await response.json();
    // Return the raw GitHub URL
    const rawUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch || 'main'}/${path}`;
    return rawUrl;
}

// GitHub API: Get content.json
async function getContentFromGitHub() {
    const config = getGitHubConfig();
    if (!config) throw new Error('GitHub not configured');
    
    const branch = config.branch || 'main';
    const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/content.json?ref=${branch}`,
        { headers: getGitHubHeaders() }
    );
    
    if (!response.ok) {
        if (response.status === 404) {
            return { projects: [], images: [], sections: [] }; // Return empty if file doesn't exist
        }
        throw new Error('Failed to fetch content');
    }
    
    const fileData = await response.json();
    const content = atob(fileData.content.replace(/\s/g, ''));
    return JSON.parse(content);
}

// GitHub API: Update content.json
async function updateContentOnGitHub(content) {
    const config = getGitHubConfig();
    if (!config) throw new Error('GitHub not configured');
    
    const branch = config.branch || 'main';
    
    // Get current file SHA
    let sha = null;
    try {
        const getResponse = await fetch(
            `https://api.github.com/repos/${config.owner}/${config.repo}/contents/content.json?ref=${branch}`,
            { headers: getGitHubHeaders() }
        );
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }
    } catch (e) {
        // File doesn't exist yet
    }
    
    const contentBase64 = btoa(JSON.stringify(content, null, 2));
    
    const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/content.json?ref=${branch}`,
        {
            method: 'PUT',
            headers: getGitHubHeaders(),
            body: JSON.stringify({
                message: 'Update portfolio content',
                content: contentBase64,
                sha: sha,
                branch: branch
            })
        }
    );
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
    }
    
    return await response.json();
}

