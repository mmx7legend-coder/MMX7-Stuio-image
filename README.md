<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cf43ac2e-3863-4b81-9d23-690dffd96a78

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## GitHub Pages deployment

This project includes `.github/workflows/deploy.yml`. Push the project files to the `main` or `master` branch, then open **Settings → Pages** and choose **GitHub Actions** as the build/deployment source. The workflow builds the Vite app and deploys the `dist` folder.

**Important:** GitHub Pages hosts static files only. Server features such as `/api/*`, account registration/login, persistent database, Gemini API calls, and Stripe payments require a separately hosted backend; they will not work on GitHub Pages alone. Do not publish API secrets in frontend code.
