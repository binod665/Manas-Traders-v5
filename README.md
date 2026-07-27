# Manas Traders - Nepal Grocery E-Commerce Website

Production-ready grocery e-commerce web application for Manas Traders (`manastraders.com.np`), supporting English and Nepali languages, Supabase backend integration, cart persistence, and local Nepal payment methods (eSewa, Khalti, Fonepay, Cash on Delivery).

## 🚀 How to Upload & Deploy to GitHub Pages (गिथबमा अपलोड र लाइभ गर्ने तरिका)

### Problem: Why website shows blank on GitHub Pages?
1. **Missing `src/` folder**: GitHub website upload (`Add files via upload`) does not upload directories like `src/` properly.
2. **GitHub Pages Source**: Vite React apps use `.tsx` source code which must be built into production HTML/JS before displaying.

---

### Method 1: Using GitHub Desktop (Recommended / सबैभन्दा सजिलो)

1. Download & Install [GitHub Desktop](https://desktop.github.com/).
2. Log in with your GitHub account (`binod665`).
3. Click **File -> Clone Repository** and select your repository.
4. Extract all files & folders (`src/`, `public/`, `.github/`, `index.html`, etc.) into that cloned folder on your computer.
5. In GitHub Desktop, you will see all files including `src/` listed on the left.
6. Type a commit message (e.g. `Update full website code`) and click **Commit to main**.
7. Click **Push origin**.

---

### Method 2: Configure GitHub Pages Settings (Live Website देखिनका लागि)

After pushing all files (including `src/` folder) to GitHub:

1. Open your GitHub repository in your browser.
2. Go to **Settings** -> Click **Pages** (on the left menu).
3. Under **Build and deployment**:
   - Change **Source** to **GitHub Actions**.
   - *(OR if using branch deployment: Select branch `gh-pages` and folder `/ (root)`, then click Save)*.
4. Wait 1-2 minutes for the GitHub Actions workflow to finish building and deploying.
5. Open your custom domain (`https://manastraders.com.np` or `https://binod665.github.io/...`) and your website will load perfectly!
