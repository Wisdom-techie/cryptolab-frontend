#!/bin/bash

cd /vercel/share/v0-project

# Configure git
git config user.email "admin@cryptolab.dev"
git config user.name "CryptoLab Admin"

# Stage all changes
git add .

# Commit with message
git commit -m "feat: Add admin balance management page

- Created AdminBalance.jsx with user search and balance update functionality
- Added admin API endpoints (searchUsers, updateUserBalance)
- Implemented confirmation modal for balance changes
- Added AdminBalance.css with responsive styling
- Updated App.jsx routing with AdminRoute protection"

# Push to current branch
git push

echo "✅ Changes pushed to GitHub successfully!"
