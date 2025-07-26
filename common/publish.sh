#!/bin/bash

# Exit immediately on error
set -e

# Change to correct dir
cd "/home/fahi/dev/brototype/skillStew/skill-stew-api/common/"

# Step 1: Bump patch version
npm version patch

# Step 2: Build the package
npm run build

# Step 3: Stage all changes
git add .

# Step 4: Prompt for a commit message
echo "Enter commit message:"
read COMMIT_MESSAGE
git commit -m "[common] $COMMIT_MESSAGE"

# Step 5: Push to GitHub
git push

# Step 6: Publish to npm
npm publish
