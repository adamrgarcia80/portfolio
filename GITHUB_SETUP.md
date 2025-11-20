# GitHub Integration Setup Guide

Your portfolio now uses GitHub to store all images and content! This means:
- ✅ All images are stored in your GitHub repository
- ✅ Content is synced via `content.json` on GitHub
- ✅ Works across all devices (anyone with the token can update)
- ✅ No server needed - just static hosting

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `portfolio` or `my-portfolio`
3. Make it **public** (so images can be accessed) or **private** (if you want to keep it private)
4. Initialize with a README (optional)

## Step 2: Create a Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Portfolio Admin"
4. Select the **`repo`** scope (this allows full repository access)
5. Click "Generate token"
6. **Copy the token immediately** (it starts with `ghp_`) - you won't see it again!

## Step 3: Configure in Admin Panel

1. Open `admin.html` in your browser
2. Enter the password: `admin123`
3. You'll see a GitHub Setup form
4. Fill in:
   - **GitHub Username/Organization**: Your GitHub username
   - **Repository Name**: The repo you created (e.g., `portfolio`)
   - **Branch Name**: Usually `main` (or `master` for older repos)
   - **Personal Access Token**: The token you just created
   - **Images Folder**: `images` (default - this is where images will be stored)
5. Click "Save Configuration"

## Step 4: Start Adding Content!

1. Enter a project name
2. Click "Add Image" to upload images
3. Images will be automatically uploaded to GitHub
4. Add text content with "Add Copy"
5. Click "Save Project"

## How It Works

- **Images**: Uploaded directly to your GitHub repo in the `images/` folder
- **Content**: Stored in `content.json` at the root of your repository
- **Cross-client**: The GitHub token is stored in your browser's localStorage, so it works on any device where you configure it

## Repository Structure

After setup, your GitHub repo will look like:

```
your-repo/
├── content.json          # All portfolio content
├── images/               # All uploaded images
│   ├── 1234567890-image1.jpg
│   ├── 1234567891-image2.png
│   └── ...
└── README.md
```

## Hosting Your Portfolio

You can host your portfolio on:
- **GitHub Pages** (free!)
- **Netlify** (drag & drop the `public/` folder)
- **Vercel** (connect your GitHub repo)
- Any static hosting service

## Troubleshooting

**"GitHub token not configured"**
- Make sure you've completed the setup in the admin panel

**"Upload failed"**
- Check that your token has `repo` scope
- Verify your repository name and username are correct
- Make sure the branch name matches (usually `main`)

**Images not showing**
- Check that your repository is public, OR
- If private, you'll need to use GitHub Pages or another hosting method

**Content not syncing**
- The token is stored per-browser in localStorage
- Configure it on each device/browser you want to use

## Security Note

The GitHub token is stored in your browser's localStorage. This means:
- It's only accessible on the device where you configured it
- Anyone with access to your browser can see it (check DevTools > Application > Local Storage)
- For production, consider using environment variables or a backend service

For a personal portfolio, this is usually fine! 🎉

