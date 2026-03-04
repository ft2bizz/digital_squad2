<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Digital Squad AI - Run and Deploy

This repository contains everything you need to run your app locally and deploy it to Google Cloud Run.

## Run Locally

**Prerequisites:** Node.js v20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Google Cloud Run (via GitHub Actions)

This project is pre-configured with a `Dockerfile` and a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated deployment to Google Cloud Run.

### Step 1: Prepare Google Cloud Project
1. Create a Google Cloud Project.
2. Enable the following APIs in your GCP Console:
   - Cloud Run API
   - Container Registry API
   - Secret Manager API
3. Create a Service Account with the following roles:
   - Cloud Run Admin
   - Storage Admin (for GCR)
   - Service Account User
   - Secret Manager Secret Accessor
4. Generate a JSON Key for this Service Account.

### Step 2: Configure Secret Manager
1. Go to Google Cloud Secret Manager.
2. Create a secret named `GEMINI_API_KEY`.
3. Add your Gemini API key as the secret value.

### Step 3: Configure GitHub Secrets
Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** and add the following repository secrets:
- `GCP_PROJECT_ID`: Your Google Cloud Project ID.
- `GCP_CREDENTIALS`: The entire JSON string from the Service Account key you generated.

### Step 4: Deploy
Simply push your code to the `main` branch. The GitHub Actions workflow will automatically:
1. Build the Docker image.
2. Push it to Google Container Registry (GCR).
3. Deploy the image to Cloud Run.

> **Note on Data Persistence:** Google Cloud Run is a stateless environment. The local SQLite database (`app.db`) and the `/uploads` folder will be reset every time the container restarts. For a production-ready application, consider migrating the database to Google Cloud SQL and storing uploaded files in Google Cloud Storage.
