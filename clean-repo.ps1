# Stop on first error
$ErrorActionPreference = "Stop"

Write-Host "Creating backup of important files..."
# Create backup directory
$backupDir = "project-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir

# Copy important files and directories (excluding large binaries and node_modules)
$filesToCopy = @(
    "app",
    "k8s",
    ".github",
    "Dockerfile",
    "docker-compose.yml",
    "README.md",
    ".gitignore"
)

foreach ($item in $filesToCopy) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination "$backupDir/" -Recurse
    }
}

Write-Host "Removing old Git repository..."
# Remove the old .git directory
if (Test-Path ".git") {
    Remove-Item -Path ".git" -Recurse -Force
}

Write-Host "Removing large binary files..."
# Remove large binary files
if (Test-Path "kubectl") {
    Remove-Item -Path "kubectl" -Force
}
if (Test-Path "minikube-linux-amd64") {
    Remove-Item -Path "minikube-linux-amd64" -Force
}

Write-Host "Initializing new Git repository..."
# Initialize new Git repository
git init

Write-Host "Copying files back from backup..."
# Copy files back from backup
foreach ($item in $filesToCopy) {
    $backupItem = Join-Path $backupDir $item
    if (Test-Path $backupItem) {
        Copy-Item -Path $backupItem -Destination "./" -Recurse -Force
    }
}

Write-Host "Adding files to Git..."
# Add all files
git add .

Write-Host "Creating initial commit..."
# Create initial commit
git commit -m "Initial commit with clean repository"

Write-Host "Done! Repository has been cleaned and reinitialized."
Write-Host "Backup of your files is stored in: $backupDir"
Write-Host "You can now add your remote repository and push the changes:"
Write-Host "git remote add origin <your-repository-url>"
Write-Host "git push -u origin main" 