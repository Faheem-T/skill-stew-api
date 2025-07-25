#!/bin/bash

# Exit immediately on error
set -e

# Step 1: Bump patch version
npm version patch

# Step 2: Build the package
npm run build

# Step 3: Stage all changes
git add .

# Step 4: Prompt for a commit message
echo "Enter commit message:"
read COMMIT_MESSAGE
git commit -m "$COMMIT_MESSAGE"

# Step 5: Push to GitHub
echo "Enter remote branch to push to:"
read REMOTE_BRANCH
git push -u origin "$REMOTE_BRANCH"

# Step 6: Publish to npm
npm publish
