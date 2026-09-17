# Netlify Deployment Guide — Star-Leaper: Orion Odyssey

Deploying **Star-Leaper: Orion Odyssey** to Netlify gives you a fast, global CDN-backed website with free HTTPS and mobile support.

---

## What Has Been Configured

1. **`netlify.toml`**: Official Netlify configuration with security headers, Phaser 3 caching, and SPA fallback routing.
2. **`_headers` & `_redirects`**: Multi-standard headers and rewrites.
3. **`star-leaper-netlify.zip`**: Optimized 392 KB production archive containing `index.html`, `lib/`, `src/`, and Netlify configs.
4. **`deploy_netlify.ps1` & `deploy_netlify.bat`**: 1-click packager and automated deployer.

---

## Deployment Methods

### Option A: Netlify Drop (Instant Drag & Drop — 30 Seconds, No CLI Needed)

1. **Double-click `deploy_netlify.bat`** (or run `powershell -File .\deploy_netlify.ps1`).
2. The script:
   - Packages `star-leaper-netlify.zip`.
   - Automatically opens [app.netlify.com/drop](https://app.netlify.com/drop) in your browser.
   - Highlights the zip file in Windows File Explorer.
3. **Drag and drop `star-leaper-netlify.zip`** into the drop zone on the Netlify webpage.
4. Netlify will instantly deploy your game and give you a live URL like:
   ```text
   https://star-leaper-orion.netlify.app
   ```
5. Anyone on PC or mobile (iOS & Android) can now play anywhere in the world!

---

### Option B: Automated Headless Deploy via Netlify API

If you have a Netlify Personal Access Token:
1. Generate a token at **Netlify User Settings** ➔ **Applications** ➔ **New Access Token**.
2. Run in PowerShell:
   ```powershell
   .\deploy_netlify.ps1 -Token "your_personal_access_token_here" -SiteName "star-leaper"
   ```
3. The script directly uploads the zip through Netlify's REST API and returns your live URL.

---

### Option C: Link Existing or New Site to GitHub (Continuous Deployment)

We've provided automated scripts ([`link_github.bat`](file:///c:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/link_github.bat) and [`link_github.ps1`](file:///c:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/link_github.ps1)) and a production `.gitignore`.

#### Step 1: Push Local Code to GitHub
1. If Git is not yet installed on your PC, download [Git for Windows](https://git-scm.com/download/win) or [GitHub Desktop](https://desktop.github.com/).
2. Create a new empty repository at [github.com/new](https://github.com/new) (e.g. `star-leaper`).
3. Double-click [`link_github.bat`](file:///c:/Users/muiz.hameed/.gemini/antigravity-ide/scratch/star-leaper/link_github.bat) and paste your GitHub repository URL when prompted.
   *(Or run manually in terminal:)*
   ```bash
   git init
   git remote add origin https://github.com/<YOUR-USERNAME>/star-leaper.git
   git add .
   git commit -m "Star-Leaper: Orion Odyssey"
   git branch -M main
   git push -u origin main
   ```

#### Step 2: Connect Netlify to Your GitHub Repository
1. Log into your Netlify dashboard at [app.netlify.com](https://app.netlify.com/).
2. Click on your site (`starleaper` or `starleaper.netlify.app`).
3. Navigate to: **Site configuration** (or **Site settings**) ➔ **Build & deploy** ➔ **Continuous deployment**.
4. In the **Repository** section, click **Link repository** (or **Manage repository** ➔ **Link to a different repository**).
5. Select **GitHub** and grant Netlify access to your repository.
6. Select your `star-leaper` repository.
7. Verify build configuration:
   - **Base directory:** *(leave blank)*
   - **Build command:** *(leave blank)*
   - **Publish directory:** `.` *(automatically read from `netlify.toml`)*
8. Click **Deploy starleaper**.

From now on, whenever you push any code change to GitHub, Netlify will automatically build and deploy your live game!

---

### Custom Domain: Connecting `starleaper.io`

Once deployed on Netlify:
1. Go to your site dashboard on Netlify ➔ **Domain management** ➔ **Add a domain**.
2. Enter `starleaper.io`.
3. Set your DNS records at your domain registrar:
   - **Apex (`starleaper.io`)**: Point `A` record to Netlify load balancer IP: `75.2.60.5`
   - **Subdomain (`www.starleaper.io`)**: Point `CNAME` record to your Netlify site URL (e.g., `star-leaper-orion.netlify.app`).
4. Netlify will automatically provision a free **Let's Encrypt SSL certificate**.
