FROM node:22-alpine

WORKDIR /app

# Install bash as it is not available in alpine
RUN apk add --no-cache bash

# Install Infisical CLI
RUN npm install -g @infisical/cli
RUN npm update -g @infisical/cli

# Enable pnpm package manager
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable 

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Copy startup script that handles Infisical authentication
COPY scripts/docker-entrypoint.sh /docker-entrypoint.sh

CMD ["/bin/bash", "/docker-entrypoint.sh"]
