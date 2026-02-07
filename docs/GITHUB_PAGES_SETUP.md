# GitHub Pages Setup Guide - Child Safety Standards

This guide explains how to publish the Child Safety Standards page on GitHub Pages, making it publicly accessible for app store compliance requirements.

## Prerequisites

- A GitHub account
- The repository containing this project
- Admin access to the repository

## Setup Steps

### Step 1: Ensure Files Are in Place

Make sure the following file exists in the `docs/` folder:
- `child-safety-standards.html` - The HTML page for GitHub Pages

### Step 2: Enable GitHub Pages

1. Go to your GitHub repository on GitHub.com
2. Click on **Settings** (in the repository navigation bar)
3. Scroll down to the **Pages** section (in the left sidebar)
4. Under **Source**, select:
   - **Deploy from a branch**
   - Choose **main** (or your default branch)
   - Select **/docs** as the folder
5. Click **Save**

### Step 3: Verify Publication

1. GitHub Pages will build and deploy your site (this may take a few minutes)
2. Once deployed, you'll see a green checkmark and a URL like:
   ```
   https://[username].github.io/[repository-name]/child-safety-standards.html
   ```
3. Click the URL to verify the page loads correctly

### Step 4: Update App Constants

After confirming the GitHub Pages URL, update the constant in your app:

**File:** `SGVR_PanIndia_Frontend/src/infrastructure/constants.js`

Replace `[username]` and `[repository-name]` with your actual values:
```javascript
export const CHILD_SAFETY_STANDARDS_URL = "https://[username].github.io/[repository-name]/child-safety-standards.html";
```

### Step 5: Test the Link

1. Test the URL in a browser to ensure it's publicly accessible
2. Test opening the URL from within your app
3. Verify the page displays correctly on mobile devices

## Custom Domain (Optional)

If you want to use a custom domain instead of `github.io`:

1. In GitHub Pages settings, add your custom domain
2. Update your DNS records as instructed by GitHub
3. Update the `CHILD_SAFETY_STANDARDS_URL` constant with your custom domain

## Troubleshooting

### Page Not Loading

- Wait a few minutes after enabling GitHub Pages (initial deployment can take 5-10 minutes)
- Check that the file is in the `docs/` folder
- Verify the file name matches exactly: `child-safety-standards.html`
- Check GitHub Actions/Pages logs for build errors

### 404 Error

- Ensure the file is in the `docs/` folder (not `doc` or `documentation`)
- Verify the filename is exactly `child-safety-standards.html` (case-sensitive)
- Check that GitHub Pages is enabled and pointing to the `/docs` folder

### Updates Not Reflecting

- GitHub Pages rebuilds automatically when you push changes
- Wait 1-2 minutes after pushing changes
- Clear your browser cache if needed
- Check the GitHub Pages build status in the repository's Actions tab

## App Store Submission

When submitting to app stores, provide:

- **Safety Standards URL**: Your GitHub Pages URL (e.g., `https://[username].github.io/[repository-name]/child-safety-standards.html`)
- **Verification**: Ensure the URL is publicly accessible without authentication
- **Content**: Verify all required child safety information is present

## Maintenance

- Update the HTML file as needed when policies change
- Update the "Last Updated" date in the HTML file
- Push changes to trigger automatic GitHub Pages rebuild
- Test the URL after each update

## Notes

- GitHub Pages is free and reliable for hosting static pages
- The page will be publicly accessible to anyone with the URL
- No authentication is required to view the page
- The page is automatically rebuilt when you push changes to the repository
