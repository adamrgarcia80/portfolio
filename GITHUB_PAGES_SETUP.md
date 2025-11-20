# GitHub Pages Setup Instructions

Your site should be live at: https://adamrgarcia80.github.io/portfolio/

If it's not showing the updated design, follow these steps:

## Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/adamrgarcia80/portfolio
2. Click **Settings** (top right of the repo)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
5. Save the settings

## Step 2: Check GitHub Actions

1. In your repository, click the **Actions** tab
2. You should see a workflow called "Deploy to GitHub Pages"
3. If it shows as failed or hasn't run, click on it and check the logs
4. If it hasn't run yet, it will run automatically on the next push

## Step 3: Trigger a New Deployment

If the workflow hasn't run, you can trigger it by making a small change:

```bash
# Make a small change to trigger the workflow
git commit --allow-empty -m "Trigger GitHub Pages deployment"
git push origin main
```

## Step 4: Wait for Deployment

- GitHub Actions typically takes 1-2 minutes to deploy
- Check the Actions tab to see the deployment status
- Once it shows "Deploy to GitHub Pages" as completed (green checkmark), your site should be live

## Troubleshooting

**If the site still shows old content:**
- Clear your browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check the Actions tab to ensure the workflow completed successfully
- Verify GitHub Pages is set to use "GitHub Actions" as the source

**If GitHub Pages isn't enabled:**
- Make sure you're in the repository Settings → Pages
- Select "GitHub Actions" as the source
- The workflow will automatically deploy from the `public/` folder

## Current Setup

Your workflow is configured to:
- Deploy from the `public/` folder
- Run automatically on every push to `main`
- Deploy to: https://adamrgarcia80.github.io/portfolio/

The workflow file is at: `.github/workflows/deploy.yml`

