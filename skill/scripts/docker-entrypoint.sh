#!/bin/bash
set -e

# Docker entrypoint script for Skill Service
# This script authenticates with Infisical using Machine Identity (Universal Auth)
# and starts the application with secrets injected
# Run this script only for local development using skaffold

INFISICAL_DOMAIN="https://app.infisical.com"
INFISICAL_PATH="/skill-service"

echo "=========================================="
echo "Skill Service - Starting..."
echo "=========================================="

# Validate required environment variables
if [ -z "${INFISICAL_CLIENT_ID}" ]; then
    echo "ERROR: INFISICAL_CLIENT_ID is not set"
    exit 1
fi

if [ -z "${INFISICAL_CLIENT_SECRET}" ]; then
    echo "ERROR: INFISICAL_CLIENT_SECRET is not set"
    exit 1
fi

if [ -z "${INFISICAL_PROJECT_ID}" ]; then
    echo "ERROR: INFISICAL_PROJECT_ID is not set"
    exit 1
fi

echo "Authenticating with Infisical (domain: ${INFISICAL_DOMAIN})..."

# Exchange Machine Identity credentials for access token
export INFISICAL_TOKEN=$(infisical login \
    --method=universal-auth \
    --domain="${INFISICAL_DOMAIN}" \
    --client-id="${INFISICAL_CLIENT_ID}" \
    --client-secret="${INFISICAL_CLIENT_SECRET}" \
    --plain \
    --silent)

if [ -z "${INFISICAL_TOKEN}" ]; then
    echo "ERROR: Failed to obtain Infisical access token"
    exit 1
fi

echo "✓ Authentication successful!"
echo "Token: ${INFISICAL_TOKEN:0:20}..."
echo "=========================================="
echo "Starting application with secrets..."
echo "=========================================="

# Start the application with Infisical injecting secrets
exec infisical run \
    --domain=$INFISICAL_DOMAIN \
    --projectId=${INFISICAL_PROJECT_ID} \
    --env=dev \
    --path=${INFISICAL_PATH} \
    -- bun start
