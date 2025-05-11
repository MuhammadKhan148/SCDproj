# Automated Git Setup Script

# Step 1: Remove any existing Git repositories
Write-Host "Removing any existing Git repositories..." -ForegroundColor Cyan
if (Test-Path .git) { Remove-Item -Path .git -Recurse -Force }
if (Test-Path app/.git) { Remove-Item -Path app/.git -Recurse -Force }
if (Test-Path app/backend/.git) { Remove-Item -Path app/backend/.git -Recurse -Force }

# Step 2: Create a comprehensive .gitignore file
Write-Host "Creating .gitignore file..." -ForegroundColor Cyan
@"
# Dependencies
node_modules/
**/node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log
**/.cache/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
/build
/dist
**/*.pack

# Large binary files
kubectl
minikube*

# Kubernetes files (to be added in a later step)
k8s/

# OS specific files
.DS_Store
Thumbs.db
"@ | Out-File -FilePath .gitignore -Encoding utf8

# Step 3: Initialize a fresh Git repository
Write-Host "Initializing new Git repository..." -ForegroundColor Cyan
git init

# Step 4: Add all files respecting .gitignore
Write-Host "Adding files to Git..." -ForegroundColor Cyan
git add .

# Step 5: Commit all changes
Write-Host "Committing files..." -ForegroundColor Cyan
git commit -m "Initial commit with app and Dockerfile"

# Step 6: Configure remote (user needs to provide their own URL)
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"
Write-Host "Setting up remote origin..." -ForegroundColor Cyan
git remote add origin $repoUrl

# Step 7: Push to GitHub
Write-Host "Pushing code to GitHub..." -ForegroundColor Cyan
git push -u origin master

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Your code has been pushed to GitHub." -ForegroundColor Green 